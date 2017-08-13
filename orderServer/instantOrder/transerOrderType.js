/**
 * Created by MengLei on 2016/3/24.
 */
"use strict";

let proxy = require('../../common/proxy');
let zrpc = require('../../utils/zmqClient');
let cancel = require('./cancelOrder');
let genOrder = require('./genOrder');

//取消付费订单，转成免费订单，或者反之，param={userID: '', o_id: '', type: 'toFree/toSenior'}，默认是付费变免费
module.exports = function (param, callback) {
    proxy.Order.getOrderByID(param.o_id, function (err, doc) {
        if (err) {
            return callback(err);
        }
        if (!doc) {
            return callback(new Error('订单ID不存在！'), 913);
        }
        cancel(param, function (err2) {
            if (err2) {
                return callback(err2);
            }
            param.orderInfo = doc.toObject();
            param.orderInfo.type = (doc.type == 'senior' ? '' : 'senior');//如果是免费订单，那么转成收费，如果是收费订单，那么转成免费
            param.orderInfo = JSON.stringify(param.orderInfo);
            setTimeout(function () {
                genOrder(param, callback);
            }, 800);
        });
    });
};
