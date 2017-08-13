/**
 * Created by MengLei on 2016/2/22.
 */

var db = require('../../config').db;
var objectId = require('mongojs').ObjectId;
var log = require('../../utils/log').mqtt;
var dnode = require('../../utils/dnodeClient');
var zrpc = require('../../utils/zmqClient');

module.exports = {
    calcBadge: calcBadge
};

function calcBadge(o_id) {
    log.trace('calculate badge o_id: ' + o_id);
    var _id = new objectId();
    try {
        _id = new objectId(o_id);
    } catch (ex) {
        log.error('light badge error, ex: ' + ex.message);
        return;
    }
    db.orders.findOne({_id: _id}, {t_id: 1, s_id: 1, chat_msg: 1, badges: 1}, function (err, doc) {
        if (err) {
            return;
        }
        if (!doc) {
            return;
        }
        //计算8条回复以及语音或图片
        var replyCount = 0; //回复数
        var imageOrVoice = false;   //语音或图片
        for (var i = 0; i < doc.chat_msg.length; i++) {
            if (doc.chat_msg[i].from == doc.t_id) {
                replyCount++;
                if (doc.chat_msg[i].type == 'image' || doc.chat_msg[i].type == 'voice') {
                    imageOrVoice = true;
                }
            }
        }
        //下面点亮徽章
        if(!doc.badges){
            return;
        }
        for (var j = 0; j < doc.badges.length; j++) {
            if (doc.badges[j].id == 'eightreply') {
                if (!doc.badges[j].is_on) {
                    //如果8条回复的徽章没有点亮，那么在这里判断是否点亮
                    if (replyCount >= 8) {//满足8条回复的条件
                        log.trace('light up badge eight reply, o_id: ' + o_id);
                        db.orders.update({_id: _id, 'badges.id': 'eightreply'}, {$set: {'badges.$.is_on': true}});
                        rawNotify({
                            dest: doc.t_id,
                            body: {action: 'msgNotify', content: {o_id: o_id, type: 'badge', id: 'eightreply', 'is_on': true}}
                        });
                        rawNotify({
                            dest: doc.s_id,
                            body: {action: 'msgNotify', content: {o_id: o_id, type: 'badge', id: 'eightreply', 'is_on': true}}
                        });
                    }
                }
            }
            if (doc.badges[j].id == 'imageorvoice') {
                if (!doc.badges[j].is_on) {
                    //图片或语音的徽章没有点亮，那么在这里判断是否点亮
                    if (imageOrVoice) {   //满足语音、图片的条件
                        log.trace('light up badge image or voice, o_id: ' + o_id);
                        db.orders.update({_id: _id, 'badges.id': 'imageorvoice'}, {$set: {'badges.$.is_on': true}});
                        rawNotify({
                            dest: doc.t_id,
                            body: {action: 'msgNotify', content: {o_id: o_id, type: 'badge', id: 'imageorvoice', 'is_on': true}}
                        });
                        rawNotify({
                            dest: doc.s_id,
                            body: {action: 'msgNotify', content: {o_id: o_id, type: 'badge', id: 'imageorvoice', 'is_on': true}}
                        });
                    }
                }
            }
        }
    });
}

//发送raw消息，param = {dest: '', body: {action: 'game', content: {}}}
function rawNotify(param, callback){
    if(!callback){
        callback = function(){};
    }
    zrpc('mqttServer', 'sendTo', param, callback);
}


