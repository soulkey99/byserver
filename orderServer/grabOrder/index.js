/**
 * Created by MengLei on 2015/2/26.
 */

var db = require('../../config').db;
var objectId = require('mongojs').ObjectId;
var order = require('../models/order');
//var result = require('../utils/result');
var dnode  = require('../utils/dnodeClient');
var zrpc = require('../../utils/zmqClient');
var log = require('../../utils/log').order;
var config = require('../../config');
var cronJob = require('cron').CronJob;
var addBonus = require('../utils/bonus');

var notify = require('./../notify');

var genOrderJob = require('../genOrder').job;
var updateMoneyInfo = require('../endOrder').updateMoneyInfo;

var job = {};  //保存定时任务
var timerJob = {};   //倒计时3分钟时提醒双方的计时器

var o_idObj = {};   //保存order id，防止抢单时两个教师端同时进入


var grabOrder = function (param, result) {
    //抢单
    var o_id = param.o_id;
    var _id = '';

    try {
        _id = new objectId(o_id);
    }catch(ex){
        log.error('grab order, o_id error: ' + ex.message);
        result({statusCode: 905, message: ex.message});
        return;
    }

    db.orders.find({t_id: param.userID, status: 'received'}, function(err7, doc7){
        if(err7){
            //handle error
            log.error('grab order error: ' + err7.message);
            result({statusCode: 905, message: err7.message});
        }else{
            if(doc7.length > 0){
                //有订单未完成状态，不允许再次接单
                log.error('user have order not finished. userID=' + param.userID);
                result({statusCode: 907, message: 'user have order not finished.'});
            }else{
                //没有订单处于未完成状态，可以再次接单
                if(o_idObj.hasOwnProperty(o_id)) {
                    //表示有人已经进行抢单，接下来的用户就不允许再进行了
                    log.error('userID: ' + o_idObj[o_id] + ' already grab this order: ' + o_id);
                    result({statusCode: 908, message: 'grab order failed.'});
                    return;
                }
                o_idObj[o_id] = param.userID;

                var start_time = new Date().getTime();
                db.orders.findOne({_id: _id}, function (err, doc) {
                    if (err) {
                        //handle error
                        log.error('grabOrder, find order error: ' + err.message);
                        result({statusCode: 905, message: err.message});
                        //删除相关id
                        if (o_idObj.hasOwnProperty(o_id)) {
                            delete(o_idObj[o_id]);
                        }
                    } else {

                        //查找订单，判断订单当前状态，如果状态合法，将订单状态改变为已接单
                        if (doc) {
                            if (doc.status == 'pending') {
                                db.orders.update({_id: _id}, {
                                    $set: {
                                        status: 'received',
                                        t_id: param.userID,
                                        start_time: start_time,
                                        chat_msg: [{
                                            o_id: o_id,
                                            msgid: '1000001',
                                            from: param.userID,
                                            to: doc.s_id,
                                            type: 'text',
                                            status: 'received',
                                            msg: '同学您好，老师已经接单，正在阅读题目，请耐心等待！',
                                            t: start_time
                                        }]
                                    }
                                }, function (err2) {
                                    //修改订单状态之后，删除object中的订单id
                                    if (o_idObj.hasOwnProperty(o_id)) {
                                        delete(o_idObj[o_id]);
                                    }
                                    if (err2) {
                                        //handle error
                                        log.error('grab order update error: ' + err2.message);
                                        result({statusCode: 905, message: err2.message});
                                    } else {
                                        log.trace('grab order success, o_id: ' + o_id + ', t_id: ' + param.userID);
                                        //订单被抢，向所有接单过的教师推送订单被抢的消息
                                        notify(o_id, 'received');
                                        //
                                        result({statusCode: 900});
                                        //告诉学生订单被抢
                                        sendOrderState({o_id: o_id, status: 'received', userType: 'student'}, doc.s_id);

                                        //抢单成功之后，给教师增加一个抢单积分
                                        log.trace('after order is grabbed, add bonus to teacher');
                                        addBonus(param.userID, '2', {o_id: o_id});

                                        //抢单之后，教师接单数增加一个
                                        db.users.findOne({_id: new objectId(param.userID)}, function (err3, doc3) {
                                            if (err3) {
                                                //handle error
                                                log.error('grab order, add teacher grab order number error.');
                                            } else {
                                                if (doc3) {
                                                    //教师接单数加一
                                                    var grabbed = parseInt(doc3.userInfo.teacher_info.orders_grabbed || 0);
                                                    db.users.update({_id: new objectId(param.userID)}, {$set: {'userInfo.teacher_info.orders_grabbed': (grabbed + 1)}});
                                                }
                                            }
                                        });
                                        //抢单之后，订单推送超时的定时器就没有用了，可以关掉
                                        if (genOrderJob && genOrderJob.hasOwnProperty(o_id)) {
                                            genOrderJob[o_id].stop();
                                            delete(genOrderJob[o_id]);
                                        }
                                        //抢单之后，设定一个答题时限的定时器（超过时间仍然未完成，则订单失败，若学生确认订单完成，则订单完成，若教师请求订单完成，
                                        //则等待学生确认，学生确认完成之后，则订单完成，如果学生拒绝，则订单继续，如果学生不响应，则到15分钟，订单自动完成）
                                        job[o_id] = new cronJob(new Date(start_time + doc.duration), function () {
                                            //
                                            db.orders.findOne({o_id: o_id}, function (err4, doc4) {
                                                if (err4) {
                                                    //handle error
                                                } else {
                                                    if (doc4 && doc4.status == 'received') {
                                                        log.debug('order id: ' + o_id + ', reach time limit without finish request, auto change status to failed.');
                                                        //如果15分钟仍然处于接单状态，没有确认完成，则认为自动完成
                                                        db.orders.update({o_id: o_id}, {$set: {status: 'finished'}});
                                                        //给师生双方推送订单超时失败消息
                                                        sendOrderState({o_id: o_id, status: 'finished', userType: 'teacher'}, doc4.t_id);
                                                        sendOrderState({o_id: o_id, status: 'finished', userType: 'student'}, doc4.s_id);
                                                    } else if (doc4.status == 'toBeFinished') {
                                                        //新的流程下面，这个分支不会走到
                                                        log.debug('order id: ' + o_id + ', reach time limit with finish request from teacher, no response from student, auto change status to finished');
                                                        //如果到达答题时限的时候，订单状态是toBeFinished，那么意味着教师请求了订单完成，但是学生没有响应
                                                        //这样的话，就直接将订单状态改为已完成
                                                        db.orders.update({o_id: o_id}, {$set: {status: 'finished'}});
                                                        //给师生双方推送订单完成的消息
                                                        sendOrderState({o_id: o_id, status: 'finished', userType: 'teacher'}, doc4.t_id);
                                                        sendOrderState({o_id: o_id, status: 'finished', userType: 'student'}, doc4.s_id);

                                                        //自动完成，也更新学生和教师的虚拟币记录，学生减少，教师增加，同时插入收支记录
                                                        //updateMoneyInfo(doc4);

                                                        //自动评分机制，由于学生没有确认，那么直接默认5星好评
                                                        //db.users.findOne({_id: new objectId(doc4.t_id)}, function (err5, doc5) {
                                                        //    if (err5) {
                                                        //        //handle error
                                                        //    } else {
                                                        //        if (doc5) {
                                                        //            //默认五分好评
                                                        //            var stars = parseInt(doc5.userInfo.teacher_info.stars || '0') + 5;
                                                        //            //已完成订单数量加一
                                                        //            var finished = parseInt(doc5.userInfo.teacher_info.order_finished || '0') + 1;
                                                        //            //评分之后教师得到的总积分数，5星增加10分，4星增加5分，3星增加1分，其他不得分
                                                        //            var point = parseInt(doc2.userInfo.teacher_info.point || '0') +  10;//默认五星好评，也就是肯定增加10分
                                                        //            //在用户数据库中更新教师教师的评分
                                                        //            db.users.update({_id: new objectId(doc5.t_id)}, {
                                                        //                $set: {
                                                        //                    'userInfo.teacher_info.stars': stars,
                                                        //                    'userInfo.teacher_info.order_finished': finished,
                                                        //                    'userInfo.teacher_info.point': point
                                                        //                }
                                                        //            });
                                                        //            //这里，再在订单数据库里面对该订单记录评分，默认五分好评
                                                        //            db.orders.update({_id: _id}, {$set: {stars: '5'}}, {upsert: true});
                                                        //        }
                                                        //    }
                                                        //});
                                                    }
                                                }
                                            });
                                            //删除该定时任务
                                            if (job.hasOwnProperty(o_id)) {
                                                delete(job[o_id]);
                                            }
                                        }, function () {
                                            //定时器被关闭的时候触发该方法
                                            log.trace('order duration timer stopped, order id=' + o_id.toString());
                                        }, true);
                                        //抢单之后，设定一个距离答题结束提取三分钟的定时器，提醒双方，答题时间还剩三分钟
                                        timerJob[o_id] = new cronJob(new Date(start_time + (doc.duration - config.countdownTimer)), function () {
                                            //
                                            db.orders.findOne({o_id: o_id}, function (err6, doc6) {
                                                if (err6) {
                                                    //handle error
                                                } else {
                                                    if (doc6.status = 'received') {
                                                        log.trace('order id: ' + o_id + (config.countdownTimer/60000).toString() + ' minutes left, send time notification.');
                                                        //如果距离订单结束还有3分钟仍然没有确认完成，则给双方发送倒计时三分钟的提醒
                                                        sendOrderState({o_id: o_id, status: '3minutes', userType: 'teacher'}, doc6.t_id);
                                                        sendOrderState({o_id: o_id, status: '3minutes', userType: 'student'}, doc6.s_id);
                                                    }
                                                }
                                            });
                                            //删除该定时任务
                                            if (timerJob.hasOwnProperty(o_id)) {
                                                delete(timerJob[o_id]);
                                            }
                                        }, function () {
                                            //定时器被关闭的时候触发该方法
                                            log.trace('order countdown timer stopped, order id=' + o_id.toString());
                                        }, true);
                                    }
                                })
                            } else {
                                log.error('order status illegal, id: ' + o_id + ', current status: ' + doc.status);
                                result({statusCode: 909, status: doc.status});
                            }
                        } else {
                            log.error('order id not exists, id: ' + o_id);
                            result({statusCode: 913, message: 'order id not exists.'});
                        }
                    }
                });
            }
        }
    });

};

function sendOrderState(content, to) {
    zrpc('mqttServer', 'setOrder', {content: content, to: to}, function(err, resp){
        //
        if(err){
            log.error('set order error: ' + err.message);
        }else {
            log.trace('set order result: ' + JSON.stringify(resp));
        }
    });
}

grabOrder.job = job;
grabOrder.timerJob = timerJob;
module.exports = grabOrder;
