/**
 * Created by MengLei on 2016-05-25.
 */
"use strict";
const model = require('../../model');
const Tags = model.OfflineTags;

/**
 * 离线问题tags排行
 * Callback:
 * - err, 数据库异常
 * - doc, 离线问题内容
 * @param {Object} param = {tags: [], userID: '', createTime: ''}
 * @param {Function} [callback] 回调函数
 */
exports.rankTags = function (param, callback) {
    if (!param.tags) {
        param.tags = [];
    }
    if (!param.userID) {
        param.userID = 'system';
    }
    if (!param.createTime) {
        param.createTime = Date.now();
    }
    for (let i = 0; i < param.tags.length; i++) {
        Tags.update({tag: param.tags[i]}, {
            $inc: {count: 1},
            $setOnInsert: {userID: param.userID, createTime: param.createTime}
        }, {upsert: true, multi: true}).exec();
    }
};

/**
 * 获取离线问题tags列表
 * Callback:
 * - err, 数据库异常
 * - doc, 离线问题内容
 * @param {Object} param = {startPos: '', pageSize: ''}
 * @param {Function} callback 回调函数
 */
exports.getList = function (param, callback) {
    let start = Number.parseInt(param.startPos || '1') - 1;
    let count = Number.parseInt(param.pageSize || '10');
    Tags.find({}).sort({count: -1}).skip(start < 0 ? 0 : start).limit(count).exec((err, doc)=> {
        if (err) {
            return callback(err);
        }
        let tags = [];
        for (let i = 0; i < doc.length; i++) {
            tags.push(doc[i].tag);
        }
        return callback(null, tags);
    });
};
