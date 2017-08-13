/**
 * Created by MengLei on 2015/8/13.
 */

var db = require('../../config').db;
var objectId = require('mongojs').ObjectId;
var order = require('../models/order');
var orderOperate = require('./utils/orderOperate');
var log = require('./../../utils/log').order;
var proxy = require('../../common/proxy');

var notify = require('./../notify');


//取消订单param={userID: '', o_id: ''}
module.exports = function (param, callback) {
    proxy.Order.getOrderByID(param.o_id, function (err, doc) {
        if (err) {
            return callback(err);
        }
        if (!doc) {
            return callback(new Error('订单ID不存在！'), 913);
        }
        if (doc.s_id != param.userID) {
            return callback(new Error('不是自己的订单，无权取消！'), 917);
        }
        if (doc.status != 'pending') {  //只有penging状态的订单才可以取消
            return callback(new Error('订单状态不对，无法取消！'), 918);
        }
        doc.status = 'canceled';
        doc.cancel_time = Date.now();
        doc.save(function (err2, doc2) {
            if(err2){
                return callback(err2);
            }
            orderOperate({userID: param.userID, operType: 'cancelOrder', operID: param.o_id});
            //订单取消，向所有接单过的教师推送订单取消的消息
            notify(param.o_id, 'canceled');
            callback(null, doc2);
        });
    });
    return;
    var _id = '';
    try {
        _id = new objectId(param.o_id);
    } catch (ex) {
        log.error('cancel order id error: ' + ex.message);
        callback({statusCode: 919, message: ex.message});
        return;
    }
    //只允许将pending状态的订单取消
    db.orders.findAndModify({
        query: {_id: _id, s_id: param.userID, status: 'pending'},
        update: {$set: {status: 'canceled'}},
        new: true,
        fields: {status: 1}
    }, function (err, doc) {
        if (err) {
            //handle error
            log.error('cancel order, order id error: ' + err.message);
            callback({statusCode: 905, message: err.message});
        } else {
            if (doc) {
                //取消订单成功
                callback({statusCode: 900});
                orderOperate({userID: param.userID, operType: 'cancelOrder', operID: param.o_id});
                //订单取消，向所有接单过的教师推送订单取消的消息
                notify(param.o_id, 'canceled');
            } else {
                //取消订单失败，查询订单当前状态
                db.orders.findOne({_id: _id}, {s_id: 1, status: 1}, function (err2, doc2) {
                    if (err2) {
                        //handle error
                        log.error('cancel order, order id error: ' + err.message);
                        callback({statusCode: 905, message: err.message});
                    } else {
                        //
                        if (doc) {
                            //订单存在
                            if (doc.s_id == param.userID) {
                                //如果订单是用户自己的，那么肯定是订单状态不允许取消
                                log.error('cancel order error, o_id=' + doc._id.toString() + ', status=' + doc.status);
                                callback({statusCode: 918, status: doc.status, message: 'order status illegal.'});
                            } else {
                                //订单不是自己发出的，无法取消
                                log.error('cancel order error, s_id=' + doc.s_id + ', userID=' + doc.userID);
                                callback({statusCode: 917, message: 'not allow to cancel order'});
                            }
                        } else {
                            //订单号不存在
                            log.error('cancel order error, o_id not exist, o_id=' + param.o_id);
                            callback({statusCode: 913, message: 'order id not exists.'});
                        }
                    }
                });
            }
        }
    });
};


