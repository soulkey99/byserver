/**
 * Created by MengLei on 2015/12/21.
 */
"use strict";
const model = require('../../model');
const eventproxy = require('eventproxy');
const objectId = require('mongoose').Types.ObjectId;
const Msgbox = model.Msgbox;
const MsgStatus = model.MsgStatus;

/**
 * 根据msgid查询消息内容
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {String} id  msgid
 * @param {Function} callback 回调函数
 */
exports.getMsgById = function (id, callback) {
    Msgbox.findOne({_id: id}, callback);
};

/**
 * 根据msgid查询消息内容
 * Callback:
 * - err, 数据库异常
 * - doc, 数量，{sys: '', person: ''}
 * @param {String} id  userID
 * @param {Function} callback 回调函数
 */
exports.getUnreadMsgCount = function (id, callback) {
    let ep = new eventproxy();
    ep.all('sys_msg', 'person_msg', (sys, person)=> {
        callback(null, {sys, person});
    });
    ep.fail(callback);
    let query = {to: id, read: false, type: {$in: ['watchTopic', 'answer', 'upAnswer', 'reply', 'system']}};
    Msgbox.count(query, ep.done('person_msg'));
    require('../../proxy').User.getUserById(id, (err, doc)=> {
        if (err) {
            return callback(err);
        }
        if (!doc) {
            return callback(null, 0);
        }
        Msgbox.find({
            $or: [{type: ('broadcast' + (doc.userType == 'teacher' ? '_t' : '_s'))}, {type: 'broadcast'}],
            time: {$gte: doc.userInfo.create_time}
        }, (err2, doc2)=> {
            if (err2) {
                return callback(err2);
            }
            let ids = [];
            for(let i=0; i<doc2.length; i++){
                ids.push(doc2[i]._id.toString());
            }
            MsgStatus.count({msgid: {$in: ids}, userID: id}, ep.done('sys_msg', (doc3)=> {
                return doc2.length - doc3;
            }));
        });
    });
};

/**
 * 根据query查询消息
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {Object} query 查询条件
 * @param {Object} opt option
 * @param {Function} callback 回调函数
 */
exports.getMsgByQuery = function (query, opt, callback) {
    Msgbox.find(query, {}, opt, callback);
};

/**
 * 根据info内容发送消息
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {Object} info 消息内容
 * @param {Function} callback 回调函数
 */
exports.createMsg = function (info, callback) {
    var msg = new Msgbox();
    msg.time = Date.now();
    switch (info.type) {
        case 'system':
        {
            msg.type = info.type;
            msg.from = info.from;
            msg.to = info.to;
            msg.detail = info.detail;
            msg.read = false;
        }
            break;
        case 'broadcast':
        case 'broadcast_t':
        case 'broadcast_s':
        {
            msg.from = 'system';
            msg.type = info.type;
            msg.detail = info.detail;
        }
            break;
        default:
        {
            msg.type = info.type;
            msg.from = info.from;
            msg.to = info.to;
            msg.detail = info.detail;
            msg.read = false;
        }
            break;
    }
};
