/**
 * Created by MengLei on 2016-05-27.
 */
"use strict";
const proxy = require('../../../common/proxy');
const result = require('../../utils/result');
const eventproxy = require('eventproxy');
const zrpc = require('../../../utils/zmqClient');

module.exports = function (req, res) {
    let ep = eventproxy.create('user', 'order', (user, order)=> {
        if (!order) {
            return result(res, {statusCode: 913, message: '即时订单ID对应内容不存在！'});
        }
        if (order.off_id) {
            return result(res, {statusCode: 954, message: '已经转化过离线订单，不能再次转化！'});
        }
        proxy.OfflineTopic.createOfflineTopic({
            userID: req.body.userID,
            topic: `${!!user ? user.nick : '某用户'}的${order.grade + order.subject}即时提问`,
            grade: order.grade,
            subject: order.subject,
            section: 'instant',
            q_msg: order.q_msg,
            o_id: order.o_id
        }, (err, topic)=> {
            if (err) {
                return result(res, {statusCode: 905, message: err.message});
            }
            order.off_id = topic.off_id;
            if (order.status == 'pending') {  //如果订单是pending状态，那么要取消订单
                zrpc('orderServer', 'cancelOrder2', {o_id: req.body.o_id, userID: req.body.userID}, err=>null);
            }
            order.save();
            result(res, {statusCode: 900, detail: topic.toObject({getters: true})});
        });
    });
    ep.fail(err=>result(res, {statusCode: 905, message: err.message}));
    proxy.Order.getOrderByID(req.body.o_id, ep.done('order'));
    proxy.User.getUserById(req.body.userID, ep.done('user'));
};
