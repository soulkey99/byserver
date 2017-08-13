/**
 * Created by MengLei on 2015/3/16.
 */

var db = require('../../config').db;
var objectId = require('mongojs').ObjectId;
var order = require('../models/order');
//var result = require('../utils/result');
var log = require('../../utils/log').order;

var rJob = require('../endOrder').rJob;

module.exports = function (param, result) {
    //订单结束之后，触发评分机制，如果学生没有主动评分，那么订单结束24到48小时之内会默认四星好评，否则按照实际评分来计算
    var _id = new objectId(param.o_id);
    db.orders.findOne({_id: _id}, function (err, doc) {
        if (err) {
            log.error('remark order, error: ' + err.message);
            //handle error
            result({statusCode: 905, message: err.message});
        } else {
            if (doc) {
                if (doc.stars) {
                    log.error('order id: ' + param.o_id + ', already remarked. stars: ' + doc.stars);
                    //已经评分过了
                    result({statusCode: 905, message: 'already remarked.'});
                } else {
                    if (doc.s_id == param.userID) {

                        db.users.findOne({_id: new objectId(doc.t_id)}, function (err, doc2) {
                            if (err) {
                                result({statusCode: 905, message: err.message});
                            } else {
                                if (doc2) {
                                    var rStars = param.stars; //用户输入的星级
                                    var stars = parseInt(doc2.userInfo.teacher_info.stars || '0') + parseInt(rStars); //用户评分之后的总星星数
                                    var finished = parseInt(doc2.userInfo.teacher_info.order_finished || '0'); //用户之前完成的订单数
                                    //评分之后教师得到的总积分数，5星增加10分，4星增加5分，3星增加1分，其他不得分
                                    var point = parseInt(doc2.userInfo.teacher_info.point || '0') + (rStars == '5' ? 10 : (rStars == '4' ? 5 : (rStars == '3' ? 1: 0)));
                                    //在用户数据库中更新教师教师的评分
                                    db.users.update({_id: new objectId(doc.t_id)}, {
                                        $set: {
                                            'userInfo.teacher_info.stars': stars,
                                            'userInfo.teacher_info.order_finished': (finished + 1),
                                            'userInfo.teacher_info.point': point
                                        }
                                    });
                                    //这里，再在订单数据库里面对该订单记录评分
                                    db.orders.update({_id: _id}, {$set: {stars: rStars, remark: {choice: param.choice || '', content: param.content || '', auto: false}}}, {upsert: true});
                                    result({statusCode: 900});
                                    //手动评分成功，那么删除掉自动评分定时器
                                    //if (rJob && rJob.hasOwnProperty(req.body.o_id)) {
                                    //    rJob[req.body.o_id].stop();
                                    //    delete(rJob[req.body.o_id]);
                                    //}
                                } else {
                                    result({statusCode: 905, message: 'teacher id not exists.'});
                                }
                            }
                        });
                    } else if (doc.t_id == param.userID) {
                        //教师不可以评分
                        log.error('teacher can not give remark. order id: ' + param.userID);
                        result({statusCode: 905, message: 'teacher can not give remarks.'});
                    } else {
                        //order 不属于该用户
                        log.error('order does not belong to this user, order id: ' + param.userID);
                        result({statusCode: 905, message: 'order not belong to this user id.'});
                    }
                }
            } else {
                //订单不存在
                log.error('order not exists, order id: ' + param.o_id);
                result({statusCode: 905, message: 'order id not exists.'});
            }
        }
    });
};