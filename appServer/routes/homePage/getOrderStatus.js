/**
 * Created by MengLei on 2015/7/29.
 */
"use strict";
const proxy = require('../../../common/proxy');
const result = require('../../utils/result');
const log = require('../../../utils/log').http;

module.exports = function (req, res) {
    //
    proxy.Order.getOrderByID(req.body.o_id, (err, order)=> {
        if (err) {
            log.trace('get status error: ' + err.message + ', order id: ' + req.body.o_id);
            result(res, {statusCode: 905, message: err.message});
            return;
        }
        if (!order) {
            log.trace('get order status error, order not exists, o_id: ' + req.body.o_id);
            result(res, {statusCode: 913, message: '订单不存在！'});
        }
        if (!order.t_id) {    //没有t_id，那么只返回订单状态
            log.trace('get order status, o_id: ' + req.body.o_id + ', status: ' + order.status);
            result(res, {statusCode: 900, status: order.status});
            return;
        }
        proxy.User.getUserById(order.t_id, (err, user)=> {
            if (err) {
                return result(res, {statusCode: 905, message: err.message});
            }
            if (!user) {
                return result(res, {statusCode: 900, status: order.status});
            }
            proxy.Follow.isFollowing(req.body.userID, order.t_id, (err, isFollowing)=> {
                if (err) {
                    return result(res, {statusCode: 905, message: err.message});
                }
                result(res, {
                    statusCode: 900,
                    status: order.status,
                    t_id: order.t_id,
                    t_nick: user.nick,
                    t_avatar: user.userInfo.avatar || '',
                    followed: isFollowing
                });
            });
        });
    });
};
