/**
 * Created by MengLei on 2016/4/6.
 */
"use strict";

const proxy = require('../../../common/proxy');
const db = require('../../../config').db;
const result = require('../../utils/result');
const log = require('../../../utils/log').http;
const num2str = require('../../../utils/num2str');
const eventproxy = require('eventproxy');

//获取“我的”页面所需要的信息
module.exports = function (req, res) {
    let info = {
        userID: req.body.userID,
        phone: req.user.phone,
        nick: req.user.nick,
        avatar: req.user.userInfo.avatar,
        bonus: req.user.userInfo.bonus
    };
    let ep = new eventproxy();
    //返回需要的参数：即时订单的提问数，关注离线问题数，离线问题发帖数，离线问题回答数，消息数，积分数，钱包余额数
    ep.all('user', 'orders', 'watch', 'offlineTopic', 'offlineReply', 'newMsg', (user, orders, watch, offlineTopic, offlineReply, newMsg) => {
        let moneyInfo = {money: user.userInfo.money};
        if (req.body.userType == 'teacher') {//如果是教师端，那么需要改成教师端的余额
            moneyInfo = {money: req.user.userInfo.money_info.money};
        }
        Object.assign(info, {orders, watch, offlineTopic, offlineReply, newMsg}, moneyInfo, {
            orderStr: num2str(orders),
            watchStr: num2str(watch),
            offlineTopicStr: num2str(offlineTopic),
            offlineReplyStr: num2str(offlineReply)
        });
        result(res, {statusCode: 900, info});
    });
    ep.fail((err) => {
        return result(res, {statusCode: 905, message: err.message});
    });
    proxy.User.getUserById(info.userID, ep.done('user'));
    //订单数
    proxy.Order.getOrderCount({s_id: info.userID}, ep.done('orders'));
    //关注离线问题数
    db.topicWatch.count({userID: info.userID}, ep.done('watch'));
    //离线问题数
    proxy.OfflineTopic.getTopicCount(info.userID, ep.done('offlineTopic'));
    //离线回答数
    proxy.OfflineAnswer.getAnswerCount(info.userID, ep.done('offlineReply'));
    //未读消息数
    proxy.Msgbox.getUnreadMsgCount(info.userID, ep.done('newMsg'));
};


