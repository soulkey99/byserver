/**
 * Created by MengLei on 2015/8/14.
 */

var db = require('../../config').db;
var objectId = require('mongojs').ObjectId;
var order = require('../models/order');
var proxy = require('../../common/proxy');
var orderOperate = require('./utils/orderOperate');
var log = require('./../../utils/log').order;

//订单增加答题时间(仅学生)，param={userID: '', o_id: '', addTime: ''}
module.exports = function (param, callback) {
    proxy.Order.getOrderByID(param.o_id, function (err, doc) {
        if (err) {
            return callback(err);
        }
        if (!doc) {
            log.error('add order time error, order id ' + param.o_id + ' not exists.');
            return callback(new Error('订单id不存在！'), 913);
        }
        //订单存在
        //只有已接单状态的订单才可以增加答题时间， 非已接单和待确认状态的订单，不能延时
        if (doc.status != 'received' && doc.status != 'toBeFinished') {
            log.error('add order time error, order status error, o_id=' + param.o_id + ', status=' + doc.status);
            return callback(new Error('订单不是已接单状态，无法延时！'), 918);
        }
        //只有学生才可以增加订单的时间
        if (doc.s_id != param.userID) {
            log.error('userID=' + param.userID + ', o_id=' + param.o_id + ' add time error, not allowed.');
            return callback(new Error('您无权为订单延时！'), 917);
        }
        db.orderOperate.count({userID: param.userID, operType: 'addTime', operID: param.o_id}, function (err3, doc3) {
            if (err3) {
                return callback(err3);
            }
            if ((doc.grade == 'special' && doc3 > 2) || doc3 > 0) {
                //已经延时过了，不许再次延时，直接返回错误（特殊科目延长三次，普通科目延长一次）
                return callback(new Error('超过最大可延时次数！'), 953);
            }
            //没有延时过，可以延时
            doc.duration += parseFloat(param.addTime || 300000);
            return doc.save(function (err4, doc4) {
                if (err4) {
                    return callback(err4);
                }
                log.trace('add order time success, o_id=' + param.o_id);
                orderOperate({userID: param.userID, operType: 'addTime', operID: param.o_id});
                return callback(null, doc4);
            });
        });
    });
    return;
    var _id = '';
    try {
        _id = new objectId(param.o_id);
    } catch (ex) {
        log.error('order id exception: ' + param.o_id);
        callback({statusCode: 919, message: ex.message});
        return;
    }
    db.orders.findOne({_id: _id}, {status: 1, s_id: 1}, function (err, doc) {
        if (err) {
            //handle error
            log.error('add order time error: ' + err.message);
            callback({statusCode: 905, message: err.message});
        } else {
            if (doc) {
                //订单存在
                //只有已接单状态的订单才可以增加答题时间
                if (doc.status == 'received' || doc.status == 'toBeFinished') {
                    //只有学生才可以增加订单的时间
                    if (doc.s_id == param.userID) {
                        db.orderOperate.count({
                            userID: param.userID,
                            operType: 'addTime',
                            operID: param.o_id
                        }, function (err3, doc3) {
                            if (err3) {
                                //
                            } else {
                                if (doc3 > 0) {
                                    //已经延时过了，不许再次延时，直接返回错误
                                    callback({statusCode: 953, message: '超过最大可延时次数！'});
                                } else {
                                    //没有延时过，可以延时
                                    db.orders.update({_id: _id}, {$inc: {duration: parseFloat(param.addTime)}}, function (err2, doc2) {
                                        if (err2) {
                                            //handle error
                                            log.error('add order time error: ' + err2.message);
                                            callback({statusCode: 905, message: err2.message});
                                        } else {
                                            //增加答题时间成功
                                            log.trace('add order time success, o_id=' + param.o_id);
                                            orderOperate({
                                                userID: param.userID,
                                                operType: 'addTime',
                                                operID: param.o_id
                                            });
                                            callback({statusCode: 900});
                                        }
                                    });
                                }
                            }
                        });
                    } else {
                        //其他用户无权增加订单时间
                        log.error('userID=' + param.userID + ', o_id=' + param.o_id + ' add time error, not allowed.');
                        callback({statusCode: 917, message: 'not allowed.'});
                    }
                } else {
                    //其他状态，返回错误
                    log.error('add order time error, order status error, o_id=' + param.o_id + ', status=' + doc.status);
                    callback({statusCode: 918, status: doc.status, message: 'order status error.'});
                }
            } else {
                //订单号不存在，返回错误
                log.error('add order time error, order id ' + param.o_id + ' not exists.');
                callback({statusCode: 913, message: 'order id not exists.'});
            }
        }
    });
};

