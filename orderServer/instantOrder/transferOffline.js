/**
 * Created by MengLei on 2016-05-27.
 */
"use strict";
const proxy = require('./../../common/proxy');
const cancelOrder = require('../instantOrder/cancelOrder');
const eventproxy = require('eventproxy');

//将普通订单转为离线问答，param={userID: '', o_id: '', topic: ''}
module.exports = function (param, callback) {
    let ep = eventproxy.create('user', 'order', (user, order)=>{
        if(!order){
            return callback();
        }
        if(order.off_id){
            return callback(new Error('已经转化过离线订单，不能再次转化！'));
        }
    });
    ep.fail(callback);
    proxy.Order.getOrderByID(param.o_id, ep.done('order'));
    proxy.User.getUserById(param.userID, ep.done('user'));
};

