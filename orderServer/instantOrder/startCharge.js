/**
 * Created by MengLei on 2016/3/24.
 */
"use strict";

let proxy = require('../../common/proxy');
let zrpc = require('../../utils/zmqClient');

//付费订单开始计费,param={userID: '', o_id: ''}5218 9903 1825 5832
module.exports = function (param, callback) {
    proxy.Order.getOrderByID(param.o_id, function (err, doc) {
        if (err) {
            return callback(err);
        }
        if (!doc) {
            return callback(new Error('订单ID不存在！'), 913);
        }
        if (doc.t_id != param.userID) {
            return callback(new Error('不是你的订单，无权开始计费！'), 917);
        }
        if (doc.status != 'received') {
            return callback(new Error('订单状态不合法，无法开始计费！'), 918);
        }
        if (doc.charge_time) {
            return callback(new Error('已经开始计费，不能重复开始！'), 984);
        }
        if (doc.type != 'senior') {
            return callback(new Error('不是付费订单，不可以计费！'), 983);
        }
        doc.charge_time = Date.now();
        doc.save(function (err2, doc2) {
            if (err2) {
                return callback(err2);
            }
            //开始计时成功，将消息发送给学生端
            zrpc('mqttServer', 'sendTo', {
                body: {
                    action: 'control',
                    content: {route: 'charge', body: {charge_time: doc.charge_time, o_id: doc.o_id}}
                }, dest: doc.s_id
            });
            callback(null, doc2);
        });
    });
};
