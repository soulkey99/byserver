/**
 * Created by MengLei on 2016-05-23.
 */
"use strict";
const model = require('../../model');
const eventproxy = require('eventproxy');
const UserConf = model.UserConf;

/**
 * 通过手机号获取配置信息
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {String} phonenum
 * @param {Function} [callback]
 */
exports.getUserConfByPhone = function (phonenum, callback) {
    UserConf.findOne({phonenum: phonenum}, callback);
};

/**
 * 通过手机号批量获取配置信息
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Array} phonenums
 * @param {Function} [callback]
 */
exports.getUserConfsByPhones = function (phonenums, callback) {
    UserConf.find({phonenum: {$in: phonenums}}, callback);
};

/**
 * 通过Query获取配置信息
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} query
 * @param {Function} [callback]
 */
exports.getUserConfByQuery = function (query, callback) {
    UserConf.find(query, callback);
};

