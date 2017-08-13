/**
 * Created by MengLei on 2015/9/4.
 */

var db = require('../../../config').db;
var config = require('../../../config');
var objectId = require('mongojs').ObjectId;
var offlineOperate = require('../utils/offlineOperate');
var hot = require("hot-ranking");
var log = require('./../../../utils/log').order;

//关注用户，param={userID: '', u_id: '', action: ''}，如果action=un，则是取消关注
module.exports = function(param, callback) {
    //
    var _id = new objectId(param.userID);   //用户自己的id，由于前面已经校验过，所以此处肯定应该没问题的
    //判断一下，用户不能关注自己
    if (param.userID == param.u_id) {
        callback({statusCode: 949, message: 'can not follow self.'});
        return;
    }
    var u_id = '';  //被关注用户的id
    try {
        u_id = new objectId(param.u_id);
    } catch (ex) {
        log.error('follow user error, u_id: ' + ex.message);
        callback({statusCode: 919, message: ex.message});
        return;
    }
    db.users.findOne({_id: u_id}, {_id: 1, userType: 1}, function (err, doc) {
        if (err) {
            log.error('watch user error: ' + err.message);
            callback({statusCode: 905, message: err.message});
        } else {
            if (doc) {//被关注用户存在
                if (doc.userType == 'public') {
                    //关注公众号
                    if (param.action == 'un') {
                        //我的关注
                        db.userFollowing.update({_id: _id}, {$pull: {pubList: param.u_id}}, {upsert: true});
                        //ta的粉丝
                        db.userFollowers.update({_id: u_id}, {$pull: {list: param.userID}}, {upsert: true});
                        //记录操作
                        offlineOperate({userID: param.userID, operType: 'unfollowPub', operID: param.u_id});
                    } else {
                        //我的关注
                        db.userFollowing.update({_id: _id}, {$addToSet: {pubList: param.u_id}}, {upsert: true});
                        //ta的粉丝
                        db.userFollowers.update({_id: u_id}, {$addToSet: {list: param.userID}}, {upsert: true});
                        //记录操作
                        offlineOperate({userID: param.userID, operType: 'followPub', operID: param.u_id});
                    }
                } else {
                    //关注普通用户
                    if (param.action == 'un') {
                        //我的关注
                        db.userFollowing.update({_id: _id}, {$pull: {list: param.u_id}}, {upsert: true});
                        //ta的粉丝
                        db.userFollowers.update({_id: u_id}, {$pull: {list: param.userID}}, {upsert: true});
                        //记录操作
                        offlineOperate({userID: param.userID, operType: 'unfollow', operID: param.u_id});
                    } else {
                        //我的关注
                        db.userFollowing.update({_id: _id}, {$addToSet: {list: param.u_id}}, {upsert: true});
                        //ta的粉丝
                        db.userFollowers.update({_id: u_id}, {$addToSet: {list: param.userID}}, {upsert: true});
                        //记录操作
                        offlineOperate({userID: param.userID, operType: 'follow', operID: param.u_id});
                    }
                }
                callback({statusCode: 900});
            } else {
                //被关注用户不存在
                log.error('follow user error: user not exists.');
                callback({statusCode: 948, message: 'user not exists.'});
            }
        }
    });
};