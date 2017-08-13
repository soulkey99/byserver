/**
 * Created by MengLei on 2015/8/14.
 */
"use strict";
const db = require('../../config').db;
const objectId = require('mongojs').ObjectId;
const dnode = require('../utils/dnodeClient');
const zrpc = require('../../utils/zmqClient');
const order = require('../models/order');
const badgeUtil = require('./../utils/badgeUtil');
const proxy = require('../../common/proxy');
const orderOperate = require('./utils/orderOperate');
const log = require('./../../utils/log').order;
const checkCheat = require('./checkCheat');


//结束订单，param={o_id: '', userID: '', auto: ''}
module.exports = function (param, callback) {
    if (!callback) {
        callback = function () {
        }
    }
    proxy.Order.getOrderByID(param.o_id, function (err, doc) {
        if (err) {
            log.error('end order error, ' + err.message);
            return callback(err);
        }
        if (!doc) { //订单不存在
            log.error('end order error, order not exists.');
            return callback(new Error('订单ID不存在！'), 913);
        }
        //以下是订单存在情况下的逻辑
        if (doc.status != 'received' && doc.status != 'toBeFinished') {
            return callback(new Error('订单状态不合法！'), 918);
        }
        //只能对订单状态已接单或者教师确认完成的订单执行操作，其他状态订单不可以操作
        if (doc.s_id == param.userID) {
            //完成订单的是学生，订单状态直接变为finished，同时给师生双方发通知
            doc.status = 'finished';
            doc.end_time = Date.now();
            //如果是付费订单，并且老师已经开始计费，那么需要对订单的费用进行计算
            if (doc.type == 'senior' && doc.charge_time > 0) {
                let start = 500;
                let unit = 100;
                if (doc.grade == 'special' && !doc.charge_info.free) {
                    start = doc.charge_info.start;
                    unit = doc.charge_info.unit;
                }
                doc.money = unit * Math.ceil((doc.end_time - doc.charge_time) / 60000);
                if (doc.money < start) {
                    doc.money = start;
                }
                log.trace(`calculate money, order id: ${doc.o_id}$, money: ${doc.money}$.`);
                //保存消费记录， 同时自动更改学生端和教师端的余额
                proxy.Money.addOneRecord({
                    userID: doc.s_id,
                    o_id: doc.o_id,
                    t_id: doc.t_id,
                    type: 'seniorOrder',
                    amount: doc.money
                });
            }
            doc.save(function (err2, doc2) {
                if (err2) {
                    return callback(err2);
                }
                log.trace('end order success, o_id=' + param.o_id + ', s_id=' + param.userID + ', set to finished.');
                //记录订单操作
                orderOperate({userID: param.userID, operType: 'endOrder', operID: param.o_id});
                //通知教师
                sendOrderState({o_id: param.o_id, status: 'finished', userType: 'teacher'}, doc.t_id);
                //反馈给学生
                sendOrderState({o_id: param.o_id, status: 'finished', userType: 'student'}, doc.s_id);
                //学生完成订单，执行反刷单检查
                checkCheat(param.userID);
                //学生完成订单，执行徽章检查
                badgeUtil.calcFinal(param.o_id);
                return callback(null, doc2);
            });
        } else if (doc.t_id == param.userID) {
            //完成订单的是老师，订单状态直接变为toBeFinished，同时给师生双方发通知
            doc.status = 'toBeFinished';
            doc.tobe_time = Date.now();
            doc.save(function (err2, doc2) {
                if (err2) {
                    return callback(err2);
                }
                log.trace('end order success, o_id=' + param.o_id + ', t_id=' + param.userID + ', set to toBeFinished.');
                //通知教师
                sendOrderState({o_id: param.o_id, status: 'toBeFinished', userType: 'teacher'}, doc.t_id);
                //反馈给学生，updated 20160204: toBeFinished通知不给学生发送
                //sendOrderState({o_id: param.o_id, status: 'toBeFinished', userType: 'student'}, doc.s_id);
                return callback(null, doc2);
            });
        }
    });
    return;
    var _id = '';
    try {
        _id = new objectId(param.o_id);
    } catch (ex) {
        log.error('end order id error: ' + ex.message);
        callback({statusCode: 919, message: ex.message});
        return;
    }
    db.orders.findOne({_id: _id}, {s_id: 1, t_id: 1, status: 1, badges: 1}, function (err, doc) {
        if (err) {
            //handle error
            log.error('end order error, ' + err.message);
            callback({statusCode: 905, message: err.message});
        } else {
            if (doc) {
                //订单存在
                //只能对订单状态已接单或者教师确认完成的订单执行操作，其他状态订单不可以操作
                if (doc.status == 'received' || doc.status == 'toBeFinished') {
                    //首先要进行订单徽章的处理工作
                    var t2 = Date.now();
                    if (doc.s_id == param.userID) {
                        //完成订单的是学生，订单状态直接变为finished，同时给师生双方发通知
                        db.orders.update({_id: _id}, {$set: {status: 'finished', end_time: (new Date()).getTime()}});
                        log.trace('end order success, o_id=' + param.o_id + ', s_id=' + param.userID + ', set to finished.');
                        callback({statusCode: 900});
                        orderOperate({userID: param.userID, operType: 'endOrder', operID: param.o_id});
                        //通知教师
                        sendOrderState({o_id: param.o_id, status: 'finished', userType: 'teacher'}, doc.t_id);
                        //反馈给学生
                        sendOrderState({o_id: param.o_id, status: 'finished', userType: 'student'}, doc.s_id);
                        //学生完成订单，执行反刷单检查
                        checkCheat(param.userID);
                        //学生完成订单，执行徽章检查
                        badgeUtil.calcFinal(param.o_id);
                    } else if (doc.t_id == param.userID) {
                        //完成订单的是老师，订单状态直接变为toBeFinished，同时给师生双方发通知
                        db.orders.update({_id: _id}, {$set: {status: 'toBeFinished'}});
                        log.trace('end order success, o_id=' + param.o_id + ', t_id=' + param.userID + ', set to toBeFinished.');
                        callback({statusCode: 900});
                        //通知教师
                        sendOrderState({o_id: param.o_id, status: 'toBeFinished', userType: 'teacher'}, doc.t_id);
                        //反馈给学生，updated 20160204: toBeFinished通知不给学生发送
                        //sendOrderState({o_id: param.o_id, status: 'toBeFinished', userType: 'student'}, doc.s_id);
                    } else {
                        //完成订单的既不是学生也不是老师，返回错误
                        log.error('end order error, s_id=' + doc.s_id + ', t_id=' + doc.t_id + ', userID=' + param.userID);
                        callback({statusCode: 917, message: 'end order not allowed'});
                    }
                } else {
                    log.error('end order error, o_id=' + param.o_id + ', status=' + doc.status);
                    callback({statusCode: 918, status: doc.status, message: 'order status illegal.'});
                }
            } else {
                //订单不存在
                log.error('end order error, order not exists.');
                callback({statusCode: 913, message: 'order id not exists.'});
            }
        }
    });
};


function sendOrderState(content, to) {
    zrpc('mqttServer', 'setOrder', {content: content, to: to}, function (err, resp) {
        if (err) {
            log.error('set order error: ' + err.message);
        } else {
            log.trace('set order success, order id: ' + content.o_id);
        }
    });
}