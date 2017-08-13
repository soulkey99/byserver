/**
 * Created by MengLei on 2015/2/26.
 */

var db = require('../../config').db;
var objectId = require('mongojs').ObjectId;
var order = require('../models/order');
//var result = require('../utils/result');
var log = require('./../../utils/log').order;

var notify = require('./../notify');

var genOrderJob = require('../genOrder').job;
var grabOrderJob = require('../grabOrder').job;

module.exports = function (param, result) {
    //取消订单
    var o_id = param.o_id;
    var _id = '';

    try {
        _id = new objectId(o_id);
    }catch(ex){
        log.error('cancel order, o_id error: ' + ex.message);
        result({statusCode: 905, message: ex.message});
        return;
    }
    db.orders.findOne({_id: _id}, function (err, doc) {
        if (err) {
            //handle error
            result({statusCode: 905, message: err.message});
        } else {
            //查找订单，判断订单当前状态，如果状态合法(抢单中)，将订单状态改变为已取消
            if (doc) {
                if (doc.status == 'pending') {
                    db.orders.update({_id: _id}, {$set: {status: 'canceled'}}, function (err, doc) {
                        if (err) {
                            //handle error
                            log.error('cancel order error: ' + err.message);
                            result({statusCode: 905, message: err.message});
                        } else {
                            log.trace('cancel order success.');
                            result({statusCode: 900});

                            //取消订单之后，下单15分钟超时的定时器就没有用了，可以关掉
                            if (genOrderJob && genOrderJob.hasOwnProperty(o_id)) {
                                genOrderJob[o_id].stop();
                                delete(genOrderJob[o_id]);
                            }
                            //如果只允许（抢单中）的订单取消，那么下面的代码也就没有作用了
                            //取消订单之后，抢单15分钟超时的定时器也没有用了，可以关掉
                            if (grabOrderJob && grabOrderJob.hasOwnProperty(o_id)) {
                                grabOrderJob[o_id].stop();
                                delete(grabOrderJob[o_id]);
                            }

                            //订单取消，向所有接单过的教师推送订单取消的消息
                            notify(o_id, 'canceled');
                        }
                    });
                } else {
                    log.debug('cancel order error, current status: ' + doc.status);
                    result({statusCode: 905, message: 'order status illegal. current status: ' + doc.status});
                }
            } else {
                log.debug('cancel order error, order id: ' + o_id + ' not exists.');
                result({statusCode: 905, message: 'order id not exists.'});
            }
        }
    });
};