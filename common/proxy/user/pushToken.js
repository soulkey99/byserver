/**
 * Created by MengLei on 2015/12/8.
 */

var model = require('../../model');
var objectId = require('mongoose').Types.ObjectId;
var eventproxy = require('eventproxy');
var PushToken = model.PushToken;

/**
 * 根据用户ID获取用户token信息
 * Callback:
 * - err, 数据库异常
 * - users, 用户列表
 * @param {String} id 用户id
 * @param {Function} callback 回调函数
 */
exports.getTokenByUserID = function(id, callback){
    PushToken.findOne({_id: id}, callback);
};

/**
 * 添加用户token信息
 * Callback:
 * - err, 数据库异常
 * - users, 用户列表
 * @param {String} id 用户id
 * @param {String} token 用户token
 * @param {String} platform 用户操作系统平台
 * @param {Function} callback 回调函数
 */
exports.saveToken = function(id, token, platform, callback) {
    var pushToken = new PushToken({_id: new objectId(id), token: token, platform: platform});
    var ep = new eventproxy();
    ep.all('user', 'token', function () {
        //历史遗留token问题以及userID问题全都处理完毕，可以记录新的token了
        pushToken.save(callback);
    });
    ep.fail(function (err) {
        callback(err);
    });
    //在插入新纪录之前，需要判断，该pushToken是否已经存在于系统中，如果存在的话，那么要先将其清理掉，然后再插入新纪录，否则会造成冲突
    PushToken.findOne({token: token}, function (err, doc) {
        if (err) {
            ep.throw(err);
        } else {
            if (doc) {
                PushToken.remove({token: token}, ep.done('token'));
            } else {
                ep.emit('token');
            }
        }
    });
    PushToken.findOne({_id: id}, function (err, doc) {
        if (err) {
            ep.throw(err);
        } else {
            if (doc) {
                PushToken.remove({_id: id}, ep.done('user'));
            } else {
                ep.emit('user');
            }
        }
    });
};

/**
 * 根据用户push token获取用户ID
 * Callback:
 * - err, 数据库异常
 * - users, 用户列表
 * @param {String} token 用户token
 * @param {Function} callback 回调函数
 */
exports.getUserIDByToken = function(token, callback){
    PushToken.findOne({token: token}, callback);
};

/**
 * 根据用户ID移除用户token记录
 * Callback:
 * - err, 数据库异常
 * - users, 用户列表
 * @param {String} id 用户ID
 * @param {Function} callback 回调函数
 */
exports.removeTokenByUserID = function(id, callback){
    PushToken.remove({_id: id}, callback);
};