/**
 * Created by MengLei on 2016/3/15.
 */
"use strict";
let model = require('../../model');
let FastReply = model.FastReply;

/**
 * 通过id获取快速回复
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {String} fr_id  快速回复id
 * @param {Function} callback 回调函数
 */
exports.getFastReplyByID = function(fr_id, callback){
    FastReply.findById(fr_id, callback);
};

/**
 * 根据用户id获取快速回复列表
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {String} userID
 * @param {Object} opt = {startPos: '', pageSize: ''}
 * @param {Function} callback 回调函数
 */
exports.getUserFastReply = function(userID, opt, callback){
    let start = parseInt(opt.startPos || 1) - 1;
    let count = parseInt(opt.pageSize || 10);
    if(start < 0){
        start = 0;
    }
    FastReply.find({userID: userID}, {}, {sort: '-updateAt', skip: start, limit: count}, callback);
};

/**
 * 根据fr_id删除快速回复记录
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {String} userID 用户id
 * @param {String} fr_id 多个以逗号分隔
 * @param {Function} callback 回调函数
 */
exports.removeFastReply = function(userID, fr_id, callback){
    let ids = fr_id.split(',');
    let query = {userID: userID, _id: {$in: []}};
    if(ids.length == 1){
        query['_id'] = ids[0];//只有一个id
    }else if(ids.length > 1){
        query['_id'] = {$in: ids};  //有多个id的情况
    }
    FastReply.remove(query, function(err, doc){
        if(err){
            return callback(err);
        }
        callback(null, doc);
    });
};

/**
 * 新增、编辑用户快速回复(传id就是编辑，没传就是新增)
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param 传入参数{userID: '', fr_id: '', name: '', type: '', msg: '', orientation: '', time: '', }
 * @param {Function} callback 回调函数
 */
exports.editFastReply = function(param, callback) {
    if (param.fr_id) {
        FastReply.findById(param.fr_id, function (err, doc) {
            if (err) {
                return callback(err);
            }
            if (!doc) {
                return callback();
            }
            if (doc.userID != param.userID) {
                return callback(new Error('无权编辑其他用户的快速回复内容！'));
            }
            if (param.name) {
                doc.name = param.name;
            }
            if (param.type) {
                doc.content.type = param.type;
            }
            if (param.msg) {
                doc.content.msg = param.msg;
            }
            if (param.orientation) {
                doc.content.orientation = param.orientation;
            }
            if (param.time) {
                doc.content.time = param.time;
            }
            doc.save(callback);
        });
    } else {
        let fastReply = new FastReply({
            userID: param.userID,
            name: param.name,
            content: {type: param.type, msg: param.msg, orientation: param.orientation, time: param.time}
        });
        fastReply.save(callback);
    }
};

