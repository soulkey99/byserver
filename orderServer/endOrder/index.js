/**
 * Created by MengLei on 2015/3/7.
 */

var db = require('../../config').db;
var config = require('../../config');
var objectId = require('mongojs').ObjectId;
var checkCheat = require('../instantOrder/checkCheat');
var cronJob = require('cron').CronJob;
var http = require('http');
var log = require('../../utils/log').order;
var dnode  = require('../utils/dnodeClient');
var zrpc = require('../../utils/zmqClient');

var grabOrderJob = require('../grabOrder').job;
var grabOrderTimerJob = require('../grabOrder').timerJob;


var job = {};  //保存定时任务
var rJob = {};  //订单评价定时任务


var endOrder = function (param, result) {
    //TODO:订单完成之后，学生要自动关注该教师，待完成。。

    result({statusCode: 900});

    var content = param;

    log.trace('order server, endOrder, ' + content);

    db.orders.findOne({o_id: content.o_id}, function (err, doc) {
        if (err) {
            //handle error
            sendOrderState({o_id: content.o_id, message: err.message}, content.from);
        } else {
            //success
            if (doc) {
                //有订单，判断订单当前状态
                if (doc.status == 'received' || doc.status == 'toBeFinished') {
                    if (doc.s_id == content.from) {  //发送请求的是学生
                        log.trace('end order request from student, previous status: ' + doc.status);
                        //学生发送订单结束请求，改变订单状态为完成，然后通知教师，并给学生反馈结果
                        if (content.status == 'finished') {
                            db.orders.update({o_id: content.o_id}, {$set: {status: 'finished', end_time: (new Date()).getTime()}}, function (err) {
                                if (err) {
                                    //handle error
                                } else {
                                    log.trace('order id: ' + content.o_id + ', successfully ended.');
                                    //success
                                    log.trace('end order success.');
                                    //通知教师
                                    sendOrderState({o_id: content.o_id, status: 'finished', userType: 'teacher'}, doc.t_id);
                                    //反馈给学生
                                    sendOrderState({o_id: content.o_id, status: 'finished', userType: 'student'}, doc.s_id);
                                    //订单确认结束了之后，将grabOrder里面抢单后12分钟和15分钟的定时器全部停止
                                    if (grabOrderJob && grabOrderJob.hasOwnProperty(content.o_id)) {
                                        grabOrderJob[content.o_id].stop();
                                        delete(grabOrderJob[content.o_id]);
                                    }
                                    if (grabOrderTimerJob && grabOrderTimerJob.hasOwnProperty(content.o_id)) {
                                        grabOrderTimerJob[content.o_id].stop();
                                        delete(grabOrderTimerJob[content.o_id]);
                                    }

                                    //更新财务信息，学生虚拟币减少，教师虚拟币增加，同时分别为学生和教师生成虚拟币收支订单
                                    //updateMoneyInfo(doc);

                                    //订单确认结束之后，启动订单评价定时器，若5分钟之内学生没有对订单进行评价，则默认五星好评
                                    //rJob[content.o_id] = new cronJob(new Date(new Date().getTime() + 300000), autoRemark, null, true);
                                    ////订单确认结束之后，教师已完成订单数量加一(注掉这部分代码，不在这里进行，等待完成学生评分或者自动评分之后，再去加一)
                                    //db.users.findOne({_id: new objectId(doc.t_id)}, function (err2, doc2) {
                                    //    if (err2) {
                                    //        //
                                    //    } else {
                                    //        if (doc2) {
                                    //            var finished = parseInt(doc2.userInfo.teacher_info.order_finished || 0);
                                    //            db.users.update({_id: new objectId(doc.t_id)}, {$set: {'userInfo.teacher_info.order_finished': (finished + 1)}});
                                    //        }
                                    //    }
                                    //});
                                }
                            });
                        } else {  //学生发送的请求不是订单结束，那么判断
                            if (doc.status == 'toBeFinished') {
                                //如果订单当前状态为toBeFinished，那么将学生的消息转发给老师，同时将订单改回已接单状态
                                sendOrderState({o_id: content.o_id, status: content.status}, doc.t_id);
                                db.orders.update({o_id: content.o_id}, {$set: {status: 'received'}});
                            } else {
                                //如果订单当前状态不是toBeFinished，那么给学生返回错误消息
                                sendOrderState({o_id: content.o_id, message: 'order status illegal, current status: ' + content.status}, doc.s_id);
                            }
                        }
                        ////只要学生对订单状态进行操作，那么如果定时任务中有该订单，则删除定时任务
                        //if (job.hasOwnProperty(content.o_id)) {
                        //    job[content.o_id].stop();
                        //    delete(job[content.o_id]);
                        //}
                        //发送订单的是学生，进行反刷单校验
                        checkCheat(param.from);
                    } else if (doc.t_id == content.from) {  //发送请求的是教师
                        log.trace('end order request from teacher, previous status: ' + doc.status);
                        //只有订单状态是received时候，才响应教师的toBeFinished请求
                        if(doc.status == 'received') {
                            //教师端发起订单结束请求，将订单状态改为待确认，然后通知学生，等学生确定之后，才将订单状态改为完成
                            db.orders.update({o_id: content.o_id}, {$set: {status: 'toBeFinished'}}, function (err) {
                                if (err) {
                                    //handle error
                                } else {
                                    log.trace('order id: ' + content.o_id + ', successfully change status to "toBeFinished".');
                                    //success
                                    //首先分别通知教师和学生，当前订单状态为toBeFinished
                                    sendOrderState({o_id: content.o_id, status: 'toBeFinished'}, doc.t_id);
                                    sendOrderState({o_id: content.o_id, status: 'toBeFinished'}, doc.s_id);

                                    //这个定时任务，直接使用抢单15分钟的定时任务就够用了，里面增加一些逻辑，不需要再额外启动这个了，所以将这部分代码注释掉
                                    ////启动一个定时任务，到订单有效期结束学生端仍未确认，则将订单状态改变为已完成
                                    //job[content.o_id] = new cronJob(new Date(doc.start_time + 900000), function () {
                                    //    log.trace('cron job exec: o_id=' + content.o_id);
                                    //    //订单有效期，判断订单状态若仍为toBeFinished，则自动将订单状态改为已完成
                                    //    db.orders.findOne({o_id: content.o_id}, function (err, doc2) {
                                    //        if (err) {
                                    //            //handle error
                                    //        } else {
                                    //            if (doc2.status == 'toBeFinished') {
                                    //                db.orders.update({o_id: content.o_id}, {$set: {status: 'finished'}});
                                    //                //如果是定时任务将订单状态改为已完成，那么立刻就可以自动对订单进行评分操作了
                                    //                autoRemark();
                                    //                //如果是定时任务将订单状态改为已完成，教师已完成订单数量也要加一
                                    //                db.users.findOne({_id: new objectId(doc.t_id)}, function (err2, doc2) {
                                    //                    if (err2) {
                                    //                        //
                                    //                    } else {
                                    //                        if (doc2) {
                                    //                            var finished = parseInt(doc2.userInfo.teacher_info.order_finished || 0);
                                    //                            db.users.update({_id: new objectId(doc.t_id)}, {$set: {'userInfo.teacher_info.order_finished': finished}});
                                    //                        }
                                    //                    }
                                    //                });
                                    //            }
                                    //        }
                                    //    });
                                    //    //删除该定时任务
                                    //    if (job.hasOwnProperty(content.o_id)) {
                                    //        delete(job[content.o_id]);
                                    //    }
                                    //}, null, true);
                                }
                            });
                        } else if(doc.status == 'toBeFinished'){
                            //如果订单状态已经是toBeFinished了，那么只向教师端返回当前状态，不向学生端请求
                            sendOrderState({o_id: content.o_id, status: 'toBeFinished'}, doc.t_id);
                        }
                    } else {
                        //订单id不属于请求者
                        log.debug('order does not belong to this user.');
                        sendOrderState({o_id: content.o_id,  message: 'order does not belong to this user.'}, content.from);
                    }
                } else {
                    //订单状态不合法
                    log.debug('order status illegal. current status: ' + doc.status);
                    sendOrderState({o_id: content.o_id, message: 'order status illegal.'}, content.from);
                }
            } else {
                //订单号不存在
                log.debug('order id not exists.');
                sendOrderState({o_id: content.o_id, message: 'order id not exists.'}, content.from);
            }
        }
    });
    function autoRemark() {
        var _id = new objectId(content.o_id);
        db.orders.findOne({_id: _id}, function (err, doc) {
            if (err) {
                //handle error
            } else {
                if (doc) { //订单存在
                    if (doc.stars) {
                        //已经评分过了，不做下面的操作
                    } else {
                        //没有评过分
                        db.users.findOne({_id: new objectId(doc.t_id)}, function (err, doc2) {
                            if (err) {
                                //handle error
                            } else {
                                if (doc) {
                                    //默认五分好评
                                    var stars = parseInt(doc2.userInfo.teacher_info.stars || '0') + 5;
                                    var finished = parseInt(doc2.userInfo.teacher_info.order_finished || '0');
                                    //评分之后教师得到的总积分数，5星增加10分，4星增加5分，3星增加1分，其他不得分
                                    var point = parseInt(doc2.userInfo.teacher_info.point || '0') +  10;//默认五星好评，也就是肯定增加10分
                                    //在用户数据库中更新教师教师的评分和已完成订单的数量
                                    db.users.update({_id: new objectId(doc.t_id)}, {
                                        $set: {
                                            'userInfo.teacher_info.stars': stars,
                                            'userInfo.teacher_info.order_finished': (finished + 1),
                                            'userInfo.teacher_info.point': point
                                        }
                                    });
                                    //这里，再在订单数据库里面对该订单记录评分，默认五分好评
                                    db.orders.update({_id: _id}, {$set: {stars: '5'}}, {upsert: true});

                                    log.trace('auto remark order, order id: ' + content.o_id);
                                }
                            }
                        });
                    }
                }
            }
        });
        //删除定时任务（只要任务执行了，就删掉）
        if (rJob.hasOwnProperty(content.o_id)) {
            rJob[content.o_id].stop();
            delete(rJob[content.o_id]);
        }
    }
};

//更新财务信息
function updateMoneyInfo(orderInfo) {
    //学生虚拟币减少
    db.users.update({_id: new objectId(orderInfo.s_id)}, {$inc: {'userInfo.money': (0 - orderInfo.price)}});
    //教师虚拟币增加
    db.users.update({_id: new objectId(orderInfo.t_id)}, {$inc: {'userInfo.money': orderInfo.price}});
    //学生虚拟币订单
    db.money.insert({
        userID: orderInfo.s_id,
        money: orderInfo.price,
        type: 3,
        detail: {desc: '提问消费', time: (new Date()).getTime(), o_id: orderInfo._id.toString()}
    });
    //教师虚拟币订单
    db.money.insert({
        userID: orderInfo.t_id,
        money: orderInfo.price,
        type: 5,
        detail: {desc: '回答问题收益', time: (new Date()).getTime(), o_id: orderInfo._id.toString()}
    });
}

function sendOrderState(content, to) {
    zrpc('mqttServer', 'setOrder', {content: content, to: to}, function(err, resp) {
        if (err) {
            log.error('set order error: ' + err.message);
        } else {
            log.trace('set order success, order id: ' + content.o_id);
        }
    });
}

//endOrder.job = job;
endOrder.rJob = rJob;
endOrder.updateMoneyInfo = updateMoneyInfo;
module.exports = endOrder;