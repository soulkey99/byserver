/**
 * Created by MengLei on 2015/8/14.
 */

var db = require('../../config').db;
var objectId = require('mongojs').ObjectId;
var order = require('../models/order');
var proxy = require('../../common/proxy');
var orderOperate = require('./utils/orderOperate');
var log = require('../../utils/log').order;

//评价订单param={o_id: '', stars: '', choice: '', content: '', userID: ''}，订单id，评价星级，选项，内容，用户id
// 订单结束之后，触发评分机制，如果学生没有主动评分，那么订单结束24到48小时之内会默认四星好评，否则按照实际评分来计算
// 20151201：增加教师对学生的评价，
module.exports = function (param, callback) {
    proxy.Order.getOrderByID(param.o_id, function (err, doc) {
        if (err) {
            return callback(err);
        }
        if (!doc) {
            return callback(new Error('订单ID不存在！'), 913);
        }
        if (doc.s_id != param.userID && doc.t_id != param.userID) {
            return callback(new Error('无权评价，不是自己的订单！'), 917);
        }
        if (doc.status != 'finished') {
            return callback(new Error('订单状态不正确，无法评价！'), 918);
        }
        if (doc.s_id == param.userID) {  //如果是学生调用该接口的话，那么就是评价教师
            if (doc.stars) {//已经评价过，不许再次评价
                log.error('remark order error, already remarked. o_id=' + param.o_id);
                return callback(new Error('订单已评价过，不允许再次评价！'), 930);
            }
            //没评价过，可以评价
            //给教师增加对应的星级、分数
            var rStars = param.stars;
            db.users.update({_id: new objectId(doc.t_id)}, {
                $inc: {
                    'userInfo.teacher_info.point': (rStars == '5' ? 10 : (rStars == '4' ? 5 : (rStars == '3' ? 1 : 0))),
                    'userInfo.teacher_info.stars': parseInt(rStars),
                    'userInfo.teacher_info.order_finished': 1
                }
            });
            //在订单数据库里面对该订单记录评分
            doc.stars = rStars;
            doc.remark.choice = param.choice || '';
            doc.remark.content = param.content || '';
            doc.remark.auto = false;
            doc.save(function (err2, doc2) {
                if (err2) {
                    return callback(err2);
                }
                orderOperate({userID: param.userID, operType: 'remarkOrder', operID: param.o_id});
                return callback();
            });
            // db.orders.update({_id: _id}, {
            //     $set: {
            //         stars: rStars,
            //         remark: {choice: param.choice || '', content: param.content || '', auto: false}
            //     }
            // });
        } else if (doc.t_id == param.userID) { //如果是教师调用该接口的话，那么就当是老师评价学生，stars_s和remark_s字段是教师对学生的评价
            if (doc.stars_s) { //已经评价过，不许再次评价
                log.error('remark order error, already remarked. o_id=' + param.o_id);
                return callback(new Error('订单已评价过，不允许再次评价！'), 930);
            }
            //没评价过，可以评价
            //在订单数据库里面对该订单记录评分
            // db.orders.update({_id: _id}, {
            //     $set: {
            //         stars_s: rStars_s,
            //         remark_s: {choice: param.choice || '', content: param.content || '', auto: false}
            //     }
            // });
            doc.stars_s = param.stars;
            doc.remark_s.choice = param.choice;
            doc.remark_s.content = param.content;
            doc.remark_s.auto = false;
            doc.save(function (err2, doc2) {
                if (err2) {
                    return callback(err2);
                }
                orderOperate({userID: param.userID, operType: 'remarkOrder_s', operID: param.o_id});
                return callback();
            });
        }
    });
    return;
    //
    var _id = '';
    try {
        _id = new objectId(param.o_id);
    } catch (ex) {
        log.error('remark order error, id exception: ' + ex.message);
        callback({statusCode: 919, message: ex.message});
        return;
    }
    db.orders.findOne({_id: _id}, {status: 1, t_id: 1, s_id: 1, stars: 1, stars_s: 1}, function (err, doc) {
        if (err) {
            //handle error
            log.error('remark order error: ' + err.message);
            callback({statusCode: 905, message: err.message});
        } else {
            if (doc) {
                //订单存在
                if (doc.status == 'finished') {
                    if (doc.s_id == param.userID) {  //如果是学生调用该接口的话，那么就是评价教师
                        //只有已完成的订单才可以评价
                        if (doc.stars) {
                            //已经评价过，不许再次评价
                            log.error('remark order error, already remarked. o_id=' + param.o_id);
                            callback({statusCode: 930, message: '订单已评价过，不允许再次评价！'});
                        } else {
                            //没评价过，可以评价
                            //给教师增加对应的星级、分数
                            var rStars = param.stars;
                            db.users.update({_id: new objectId(doc.t_id)}, {
                                $inc: {
                                    'userInfo.teacher_info.point': (rStars == '5' ? 10 : (rStars == '4' ? 5 : (rStars == '3' ? 1 : 0))),
                                    'userInfo.teacher_info.stars': parseInt(rStars),
                                    'userInfo.teacher_info.order_finished': 1
                                }
                            });
                            //在订单数据库里面对该订单记录评分
                            db.orders.update({_id: _id}, {
                                $set: {
                                    stars: rStars,
                                    remark: {choice: param.choice || '', content: param.content || '', auto: false}
                                }
                            });
                            callback({statusCode: 900});
                            orderOperate({userID: param.userID, operType: 'remarkOrder', operID: param.o_id});
                        }
                    } else if (doc.t_id == param.userID) { //如果是教师调用该接口的话，那么就当是老师评价学生，stars_s和remark_s字段是教师对学生的评价
                        //
                        //只有已完成的订单才可以评价
                        if (doc.stars_s) {
                            //已经评价过，不许再次评价
                            log.error('remark order error, already remarked. o_id=' + param.o_id);
                            callback({statusCode: 930, message: '订单已评价过，不允许再次评价！'});
                        } else {
                            //没评价过，可以评价
                            var rStars_s = param.stars;
                            //在订单数据库里面对该订单记录评分
                            db.orders.update({_id: _id}, {
                                $set: {
                                    stars_s: rStars_s,
                                    remark_s: {choice: param.choice || '', content: param.content || '', auto: false}
                                }
                            });
                            callback({statusCode: 900});
                            orderOperate({userID: param.userID, operType: 'remarkOrder_s', operID: param.o_id});
                        }
                    } else {
                        //如果评价订单的既不是老师也不是学生，那么直接返回错误
                        callback({statusCode: 917, message: '无法评价，不是自己的订单！'});
                    }
                } else {
                    //订单评价失败，订单状态不是已完成
                    log.error('remark order error, o_id=' + param.o_id + ', status=' + doc.status);
                    callback({statusCode: 918, status: doc.status, message: '无法评价，订单状态不合法！'});
                }

            } else {
                //订单id不存在
                log.error('remark order error, o_id=' + param.o_id + ' not exists.');
                callback({statusCode: 913, message: 'order id not exists.'});
            }
        }
    });
};