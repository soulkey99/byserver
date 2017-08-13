/**
 * Created by MengLei on 2015/8/13.
 */
"use strict";
const config = require('../../config');
const proxy = require('../../common/proxy');
const dnode = require('../utils/dnodeClient');
const zrpc = require('../../utils/zmqClient');
const notify = require('./../notify');
const log = require('./../../utils/log').order;


//封装好的设置订单状态操作
module.exports = function (o_id, status) {
    log.trace('set order ' + o_id + ' status to ' + status);
    proxy.Order.getOrderByID(o_id, function (err, doc) {
        if (err) {
            return log.error('timer, set order status, get order error, o_id: ' + o_id + ', error: ' + err.message)
        }
        if (!doc) {
            return;
        }
        doc.status = status;
        if (status == 'finished') {
            doc.end_time = Date.now();
            //如果是付费订单，并且老师已经开始计费，那么需要对订单的费用进行计算
            if (doc.type == 'senior' && doc.charge_time > 0) {
                doc.end_time = doc.chat_msg[0].t;
                //这里是自动设置订单完成的部分，如果订单是付费订单并且已经开始计费，那么我们取教师最后一次说话的时间作为订单结束的时间
                for (let i = 0; i < doc.chat_msg.length; i++) { //取end_time的最小时间
                    if (doc.chat_msg[i].from == doc.t_id) {
                        doc.end_time = Math.max(doc.end_time, doc.chat_msg[i].t);
                    }
                }
                doc.money = 100 * Math.ceil((doc.end_time - doc.charge_time) / 60000);
                if (doc.money < 500) {
                    doc.money = 500;
                }
                proxy.Money.addOneRecord({
                    userID: doc.s_id,
                    o_id: doc.o_id,
                    t_id: doc.t_id,
                    type: 'seniorOrder',
                    amount: doc.money
                });
            }
        }
        doc.save(function () {
        });
        //设置完订单状态之后，要及时将新状态推送给相关人员
        switch (status) {
            case 'received':
            //已接单，推送所有相关人员
            case 'timeout':
            //订单推送超时，推送所有相关人员
            case 'canceled':
                //订单取消，推送所有相关人员
                notify(o_id, status);
                break;
            case 'toBeFinished':
                //教师确认完成，不推送任何人
                break;
            case 'finished':
                //订单完成，推送双方
                sendOrderState({
                    o_id: o_id,
                    status: status,
                    userType: 'teacher'
                }, doc.t_id);
                sendOrderState({
                    o_id: o_id,
                    status: status,
                    userType: 'student'
                }, doc.s_id);
                break;
            default :
                break;
        }
    })
};

function sendOrderState(content, to) {
    zrpc('mqttServer', 'setOrder', {content: content, to: to}, function (err, resp) {
        //
        if (err) {
            log.error('set order error: ' + err.message);
        } else {
            log.trace('timer, set order result to: ' + content.userType + ' ' + to + ', resp=' + JSON.stringify(resp));
        }
    });
}