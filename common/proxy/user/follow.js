/**
 * Created by MengLei on 2015/12/11.
 */
"use strict";
const model = require('../../model');
const objectId = require('mongoose').Types.ObjectId;
const offlineOperate = require('../../../orderServer/offlineAnswer/utils/offlineOperate');
const eventproxy = require('eventproxy');
const User = require('./user');
const UserFollowing = model.UserFollowing;
const UserFollowers = model.UserFollowers;

/**
 * 根据userID查询此人关注的人数量
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {String} userID “我”的userID
 * @param {Function} callback 回调函数
 */
exports.getFollowingCount = function (userID, callback) {
    UserFollowing.findById(userID, (err, doc)=> {
        if (err) {
            return callback(err);
        }
        callback(null, (!doc || !doc.list) ? 0 : doc.list.length);
    });
};

/**
 * 根据userID查询关注此人的人数量
 * Callback:
 * - err, 数据库异常
 * - doc, 用户数量
 * @param {String} userID “我”的userID
 * @param {Function} callback 回调函数
 */
exports.getFollowersCount = function (userID, callback) {
    UserFollowers.findById(userID, (err, doc)=> {
        if (err) {
            return callback(err);
        }
        callback(null, (!doc || !doc.list) ? 0 : doc.list.length);
    });
};

/**
 * 根据userID查询关注此人的人的记录
 * Callback:
 * - err, 数据库异常
 * - doc, 用户记录
 * @param {String} userID “我”的userID
 * @param {String} u_id 待查询的人的userID
 * @param {Function} callback 回调函数
 */
exports.getUserFollowersByID = function (userID, u_id, callback) {
    u_id = u_id || userID;  //如果u_id为空，那么用userID代替
    UserFollowers.findById(u_id, (err, doc)=> {
        if (err) {
            return callback(err);
        }
        if (!doc) {
            return callback(null, []);
        }
        var ep = new eventproxy();
        ep.after('item', doc.list.length, function (list) {
            callback(null, list);
        });
        ep.fail(callback);
        doc.list.forEach(function (item) {
            User.getUserSocialInfo(userID, item, ep.group('item'));
        });
    });
};

/**
 * 根据userID查询此人关注的人的记录
 * Callback:
 * - err, 数据库异常
 * - doc, 用户记录
 * @param {String} userID “我”的userID
 * @param {String} u_id 待查询的人的userID
 * @param {String} type 查询类型，关注的用户or公众号(public\user\all，default for user)
 * @param {Function} callback 回调函数
 */
exports.getUserFollowingByID = function (userID, u_id, type, callback) {
    u_id = u_id || userID;  //如果u_id为空，那么用userID代替
    UserFollowing.findById(u_id, (err, doc)=> {
        if (err) {
            return callback(err);
        }
        if (!doc) {
            return callback(null, []);
        }
        var list = [];
        switch (type) {
            case 'public':
                list = doc.pubList || [];
                break;
            case 'all':
                list = (doc.pubList || []).concat((doc.list || []));
                break;
            default:
                list = doc.list || [];
                break;
        }
        var ep = new eventproxy();
        ep.after('item', list.length, function (list) {
            callback(null, list);
        });
        ep.fail(callback);
        list.forEach(function (item) {
            User.getUserSocialInfo(userID, item, ep.done('item'));
        });
    });
};

/**
 * 根据userID查询此人关注的人的数量
 * Callback:
 * - err, 数据库异常
 * - doc, 用户记录
 * @param {String} userID “我”的userID
 * @param {Function} callback 回调函数
 */
exports.getFollowingCount = function (userID, callback) {
    UserFollowing.findById(userID, (err, doc)=> {
        if (err) {
            return callback(err);
        }
        if (!doc) {
            return callback(null, 0);
        }
        if (!doc.list) {
            return callback(null, 0);
        }
        return callback(null, doc.list.length);
    });
};

/**
 * 根据userID查询"我"是否关注此人
 * Callback:
 * - err, 数据库异常
 * - doc, 是否关注(true/false)
 * @param {String} userID “我”的userID
 * @param {String} u_id 待查询的人的userID
 * @param {Function} callback 回调函数
 */
exports.isFollowing = function (userID, u_id, callback) {
    if (userID == u_id) {
        return callback(null, false);
    }
    UserFollowers.findOne({_id: u_id}, function (err, doc) {
        if (err) {
            return callback(err);
        }
        callback(null, (!doc ? false : (doc.list.indexOf(userID) > 0)));
    });
};

/**
 * 根据userID查询"我"是否关注这些人
 * Callback:
 * - err, 数据库异常
 * - doc, 是否关注(true/false)
 * @param {String} userID “我”的userID
 * @param {Array} u_ids 待查询的人的userID列表
 * @param {Function} callback 回调函数
 */
exports.isFollowingThese = function (userID, u_ids, callback) {
    UserFollowing.findOne({_id: userID}, function (err, doc) {
        if (err) {
            return callback(err);
        }
        var list = [];
        for (var i = 0; i < u_ids.length; i++) {
            if (!doc) {
                list.push({u_id: u_ids[i], followed: false});
            } else {
                list.push({u_id: u_ids[i], followed: !doc.list ? false : (doc.list.indexOf(u_ids[i]) >= 0)});
            }
        }
        callback(null, list);
    });
};

/**
 * 根据userID查询此人是否关注"我"
 * Callback:
 * - err, 数据库异常
 * - doc, 是否关注(true/false)
 * @param {String} userID “我”的userID
 * @param {String} u_id 待查询的人的userID
 * @param {Function} callback 回调函数
 */
exports.isFollowed = function (userID, u_id, callback) {
    if (userID == u_id) {
        return callback(null, false);
    }
    UserFollowers.findOne({_id: userID}, function (err, doc) {
        if (err) {
            return callback(err);
        }
        callback(null, (!doc ? false : (doc.list.indexOf(u_id) > 0)));
    });
};

/**
 * 根据userID和u_id进行关注用户
 * Callback:
 * - err, 数据库异常
 * - doc, true:关注成功，false:用户不存在
 * @param {String} userID “我”的userID
 * @param {String} u_id 待关注的人的userID
 * @param {String} action 操作类型
 * @param {Function} callback 回调函数
 */
exports.doFollow = function (userID, u_id, action, callback) {
    User.getUserById(u_id, function (err, doc) {
        if (err) {
            return callback(err);
        }
        if (!doc) {   //待关注用户不存在
            return callback(null, false);
        }
        var ep = new eventproxy();
        ep.fail(callback);
        ep.all('following', 'followers', function () {
            callback(null, true);
        });
        if (doc.userType == 'public') {
            //关注公众号
            if (action == 'un') { //取消关注
                //我的关注
                UserFollowing.update({_id: userID}, {$pull: {pubList: u_id}}, ep.done('following'));
                //ta的粉丝
                UserFollowers.update({_id: u_id}, {$pull: {list: userID}}, ep.done('followers'));
                //记录操作
                offlineOperate({userID: userID, operType: 'unfollowPub', operID: u_id});
            } else {
                //我的关注
                UserFollowing.update({_id: userID}, {$addToSet: {pubList: u_id}}, {upsert: true}, ep.done('following'));
                //ta的粉丝
                UserFollowers.update({_id: u_id}, {$addToSet: {list: userID}}, {upsert: true}, ep.done('followers'));
                //记录操作
                offlineOperate({userID: userID, operType: 'followPub', operID: u_id});
            }
        } else {
            //关注普通用户
            if (action == 'un') { //取消关注
                //我的关注
                UserFollowing.update({_id: userID}, {$pull: {list: u_id}}, ep.done('following'));
                //ta的粉丝
                UserFollowers.update({_id: u_id}, {$pull: {list: userID}}, ep.done('followers'));
                //记录操作
                offlineOperate({userID: userID, operType: 'unfollow', operID: u_id});
            } else {
                //我的关注
                UserFollowing.update({_id: userID}, {$addToSet: {list: u_id}}, {upsert: true}, ep.done('following'));
                //ta的粉丝
                UserFollowers.update({_id: u_id}, {$addToSet: {list: userID}}, {upsert: true}, ep.done('followers'));
                //记录操作
                offlineOperate({userID: userID, operType: 'follow', operID: u_id});
            }
        }
    });
};


