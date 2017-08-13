/**
 * Created by MengLei on 2016/3/28.
 */
"use strict";
const model = require('../../model');
const Share = model.Share;

/**
 * 根据shareId查询对应参数
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {String} shareId  分享记录的ID
 * @param {Function} callback 回调函数
 */
exports.getShareById = function (shareId, callback) {
    Share.findById(shareId, callback);
};

/**
 * 增加一条share数据
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {Object} param  记录参数
 * @param {Function} callback 回调函数
 */
exports.addOneShare = function (param, callback) {
    let share = new Share({userID: param.userID, type: param.type, operID: param.operID});
    if (param.param) {
        share.param = param.param;
    }
    share.save(callback);
};

