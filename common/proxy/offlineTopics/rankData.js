/**
 * Created by MengLei on 2016-05-26.
 */
"use strict";
const model = require('../../model');

/**
 * 离线问题点击
 * Callback:
 * - err, 数据库异常
 * - doc, 离线问题内容
 * @param {String} off_id  离线问题ID
 * @param {Function} [callback] 回调函数
 */
exports.onClick = function (off_id, callback) {
    var setObj = {};
    var dateStr = genDateStr();
    setObj['data.' + dateStr] = 1;
    model.OfflineClick.update({_id: off_id}, {$inc: setObj}, {upsert: true}).exec(callback);
};

/**
 * 离线问题收藏
 * Callback:
 * - err, 数据库异常
 * - doc, 离线问题内容
 * @param {String} off_id  离线问题ID
 * @param {Function} [callback] 回调函数
 */
exports.onCollect = function (off_id, callback) {
    var setObj = {};
    var dateStr = genDateStr();
    setObj['data.' + dateStr] = 1;
    model.OfflineCollect.update({_id: off_id}, {$inc: setObj}, {upsert: true}).exec(callback);
};

/**
 * 离线问题关注
 * Callback:
 * - err, 数据库异常
 * - doc, 离线问题内容
 * @param {String} off_id  离线问题ID
 * @param {Function} [callback] 回调函数
 */
exports.onWatch = function (off_id, callback) {
    var setObj = {};
    var dateStr = genDateStr();
    setObj['data.' + dateStr] = 1;
    model.OfflineWatch.update({_id: off_id}, {$inc: setObj}, {upsert: true}).exec(callback);
};

/**
 * 离线问题回复
 * Callback:
 * - err, 数据库异常
 * - doc, 离线问题内容
 * @param {String} off_id  离线问题ID
 * @param {Function} [callback] 回调函数
 */
exports.onReply = function (off_id, callback) {
    var setObj = {};
    var dateStr = genDateStr();
    setObj['data.' + dateStr] = 1;
    model.OfflineReply.update({_id: off_id}, {$inc: setObj}, {upsert: true}).exec(callback);
};


function genDateStr(){
    //返回当前年月日，格式2015/8/12
    var d = new Date();
    var year = (d.getFullYear()).toString();
    var month = (d.getMonth() + 1).toString();
    var date = (d.getDate()).toString();
    return year + '/' + month + '/' + date;
}