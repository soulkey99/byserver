/**
 * Created by MengLei on 2016/3/15.
 */
"use strict";
let proxy = require('./../../common/proxy');
let log = require('../../utils/log').order;

//这个接口返回用户的绩效以及徽章信息，param={userID: ', o_id: ''}
module.exports = function(param, callback) {
    proxy.Order.getOrderByID(param.o_id, function (err, doc) {
        if (err) {
            return callback(err);
        }
        if (!doc) {
            return callback(new Error('订单ID不存在！'), 913);
        }
        if (doc.status != 'finished') {
            return callback(new Error('订单状态不正确！'), 918);
        }
        if (doc.t_id != param.userID) {
            return callback(new Error('不是您的订单！'), 917);
        }
        let resp = {badges: doc.badges.toObject(), performance: doc.performance};
        if (!resp.performance) {
            //五分钟绩效，保底15分，每分钟加1分，30分封顶
            let five = 15;
            if (doc.end_time) {//如果有结束时间，则按照计算，否则按照最低绩效给用户发放
                five += Math.floor((doc.end_time - doc.start_time) / 60000);
                five = five > 30 ? 30 : five;
            }
            //8条回复绩效，保底4分，每条回复加1分，20分封顶
            let eight = 4;
            for (let i = 1; i < doc.chat_msg.length; i++) {
                if ((doc.chat_msg[i].from == doc.t_id) && (doc.chat_msg[i - 1].from == doc.s_id)) {
                    eight += 2;
                }
            }
            eight = eight > 20 ? 20 : eight;
            //图片语音绩效，保底5分，点亮再加5分，10分封顶
            let va = 5;
            for (let i = 0; i < doc.chat_msg.length; i++) {
                if ((doc.chat_msg[i].type == 'voice') || (doc.chat_msg[i].type == 'image')) {
                    va = 10;
                }
            }
            //及时回复绩效，保底26分，每个及时回复加1分，40分封顶
            let intime = 26;
            for (let i = 1; i < doc.chat_msg.length; i++) {
                if ((doc.chat_msg[i].from == doc.t_id) && (doc.chat_msg[i - 1].from == doc.s_id)) {
                    if ((doc.chat_msg[i].t - doc.chat_msg[i - 1].t) <= doc.replyInterval) {
                        intime += 1;
                    }
                }
            }
            // console.log('performance o_id: ' + param.o_id + ', five: ' + five + ', eight: ' + eight + ', va: ' + va + ', intime: ' + intime);
            intime = intime > 20 ? 20 : intime;
            resp.performance = five + eight + va + intime;
            doc.performance = resp.performance;
            doc.save();
        }
        callback(null, resp);
    });
};
