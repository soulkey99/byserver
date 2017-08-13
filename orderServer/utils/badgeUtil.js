/**
 * Created by MengLei on 2016/2/22.
 */

var db = require('../../config').db;
var objectId = require('mongojs').ObjectId;
var rawNotify = require('../notify/rawNotify');
var log = require('../../utils/log').order;

module.exports = {
    setBadge: setBadge,
    calcFinal: calcFinal
};

//点亮徽章
function setBadge(o_id, badge_id) {
    var _id = new objectId();
    try {
        _id = new objectId(o_id);
    } catch (ex) {
        log.error('light badge error, ex: ' + ex.message);
        return;
    }
    db.orders.findOne({_id: _id}, {t_id: 1, s_id: 1, badges: 1, status: 1}, function (err, doc) {
        if (err) {
            return;
        }
        if (!doc) {
            return;
        }
        db.orders.update({_id: _id, 'badges.id': badge_id}, {$set: {'badges.$.is_on': true}});
        //通知双方
        rawNotify({
            dest: doc.t_id,
            body: {action: 'msgNotify', content: {o_id: o_id, type: 'badge', id: badge_id, 'is_on': true}}
        });
        rawNotify({
            dest: doc.s_id,
            body: {action: 'msgNotify', content: {o_id: o_id, type: 'badge', id: badge_id, 'is_on': true}}
        });
    });
}

//计算最终结束订单的时候的结果
function calcFinal(o_id) {
    var _id = new objectId();
    try {
        _id = new objectId(o_id);
    } catch (ex) {
        log.error('light badge error, ex: ' + ex.message);
        return;
    }
    db.orders.findOne({_id: _id}, {
        t_id: 1,
        s_id: 1,
        chat_msg: 1,
        replyInterval: 1,
        replyInTime: 1
    }, function (err, doc) {
        if (err) {
            return;
        }
        if (!doc) {
            return;
        }
        //计算及时回复徽章
        var interval = doc.replyInterval || 20000;
        var inTime = doc.replyInTime || 0.6;
        var totalReply = 0;
        var inTimeReply = 0;
        for(var i=1; i<doc.chat_msg.length; i++){
            if((doc.chat_msg[i].from == doc.t_id) && (doc.chat_msg[i-1].from == doc.s_id)){
                totalReply ++;
                if((doc.chat_msg[i].t - doc.chat_msg[i-1].t <= interval)){
                    inTimeReply ++;
                }
            }
        }
        if((inTimeReply / totalReply) > inTime){    //满足及时回复条件
            setBadge(o_id, 'intimereply');
        }
    });
}


