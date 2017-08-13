/**
 * Created by MengLei on 2015/12/21.
 */
"use strict";
const model = require('../../model');
const objectId = require('mongoose').Types.ObjectId;
const MsgStatus = model.MsgStatus;

/**
 * 根据id查询状态记录内容
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {String} id  记录id
 * @param {Function} callback 回调函数
 */
exports.getMsgStatusById = function(id, callback){
    MsgStatus.findOne({_id: id}, callback);
};

/**
 * 根据msgid和userID查询某条系统消息是否已经被阅读
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {String} msgid 消息id
 * @param {String} userID 用户id
 * @param {Function} callback 回调函数
 */
exports.getSysMsgStatus = function(msgid, userID, callback){
    MsgStatus.findOne({msgid: msgid, userID: userID}, function(err, doc){
        if(err){
            return callback(err);
        }
        if(!doc){
            return callback(null, false);
        }
        callback(null, !!doc.read);
    });
};

/**
 * 根据query条件查询记录
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {Object} query  查询条件
 * @param {Function} callback 回调函数
 */
exports.getMsgStatusByQuery = function(query, callback){
    MsgStatus.find(query, {}, {}, callback);
};


/**
 * 记录上次获取收件箱列表动作的时间
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {String} id  用户userID
 * @param {Function} callback 回调函数
 */
exports.checkTime = function(id, callback){
    var status = new MsgStatus({_id: id});
    status.save(callback);
};


