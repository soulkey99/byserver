/**
 * Created by MengLei on 2015/7/27.
 */
"use strict";
const db = require('../../config').db;
const proxy = require('../../common/proxy');
const redis = require('../../config').redis;
const objectId = require('mongojs').ObjectId;
const result = require('./result');
const log = require('../../utils/log').http;
const dbLog = require('../../utils/log').dbLog;

//校验authSign，利用redis缓存提高数据库的效率
module.exports = function (req, res, next) {
    //默认需要校验authSign，有几处不需要的，就单独判断一下然后直接next
    //两个api列表，在第一个列表中的api，完全不需要校验userID和authSign
    //第二个列表中的api，如果不传userID和authSign，则不校验，如果传了，则必须校验才可以继续
    //             登录 v1、v2  注册    获取验证码 v1、v2 重置密码 v2 sso登录     获取在线教师数       邀请注册    获取公众号历史     充值回调        检测更新       获取验证码配置
    let apiList1 = ['autologin', 'login', 'register', 'getSMSCode', 'resetPwd', 'ssoLogin', 'getOnlineTeacherNum', 'invite', 'getPubHistory', 'chargeNotify', 'checkUpdate', 'getShareCodeConfig'];
    //                 获取离线问题列表        获取离线问题详情      获取离线答案、回复列表      获取离线答案详情       获取用户社交信息  获取用户关注、被关注列表  获取用户离线问题列表  获取用户离线答案列表 获取广告列表  获取最近生成的提问数量
    let apiList2 = ['getOfflineTopicList', 'getOfflineTopicDetail', 'getOfflineContentList', 'getOfflineAnswerDetail', 'getUserSocialInfo', 'getUserSocialList', 'getMyOfflineTopics', 'getMyOfflineAnswers', 'getRecentQuestionNum', 'getActivityList'];
    //               获取学科配置信息
    let apiList3 = ['getSubjectList', 'getADList'];
    if (apiList1.indexOf(req.query.m) >= 0) {
        //属于第一种情况的，不校验直接放行
        next();
    } else if (apiList2.indexOf(req.query.m) >= 0) {
        //属于第二种情况的，如果传userID了，则必须要和authSign校验通过才行，否则不校验
        if (req.body.userID) {
            check(req, res, next);
        } else {
            next();
        }
    } else if (apiList3.indexOf(req.query.m) >= 0) {
        //第三种情况，只需要根据userID取一下用户session即可，不需要校验authSign
        getUserInfo(req, res, next);
    } else {
        //其余的api，必须校验通过才能放行
        check(req, res, next);
    }
};

function check(req, res, next) {
    if (!req.body.userID) {
        return result(res, {statusCode: 902, message: 'userID为空！'});
    }
    getUser(req.body.userID, (err, doc)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        if (!doc) {
            return result(res, {statusCode: 902, message: '用户不存在！'});
        }
        if (doc.blocked == true) {
            log.error('check authSign failed. user abandoned. userID=' + req.body.userID);
            return result(res, {statusCode: 946, message: '账号封禁！'});
        }
        if (doc.authSign != req.body.authSign) {
            redis.del('session:' + req.body.userID, (err)=> {    //既然已失效，那就删除cache重新加载
                if (err) {
                    return result(res, {statusCode: 905, message: err.message});
                }
                getUser(req.body.userID, (err, doc)=> {//这里重新加载session，由于上面已经删除了，那么此处加载的肯定是从db中获取的最新信息
                    if (doc.authSign != req.body.authSign) {
                        log.trace('check authSign failed. token error. userID=' + req.body.userID + ', authSign=' + req.body.authSign + ', api=' + req.query.m);
                        return result(res, {statusCode: 903, message: '用户登陆信息已失效，请重新登陆！'});
                    }
                    req.body.userType = doc.userType;
                    req.user = doc;
                    log.trace('check authSign success. userID=' + req.body.userID + ' ,method=' + req.query.m);
                    next();
                });
            });
            return;
        }
        req.body.userType = doc.userType;
        req.user = doc;
        log.trace('check authSign success. userID=' + req.body.userID + ' ,method=' + req.query.m);
        next();
    });
}

function getUserInfo(req, res, next) {
    getUser(req.body.userID, (err, doc)=> {
        if (err) {
            log.error('check authSign error: ' + err.message);
            return result(res, {statusCode: 905, message: err.message});
        }
        if (doc) {
            req.body.userType = doc.userType;
            req.user = doc;
        }
        next();
    });
}

function getUser(userID, callback) {
    redis.get('session:' + userID, (err, doc)=> {
        if (err) {
            return callback(err);
        }
        if (!doc) {
            proxy.User.getUserById(userID, (err2, doc2)=> {
                if (err2) {
                    return callback(err2);
                }
                if (!doc2) {
                    return callback();
                }
                //update session
                redis.set('session:' + userID, JSON.stringify(doc2.toObject({getters: true})));
                redis.expire('session:' + userID, 3600);
                callback(null, doc2.toObject({getters: true}));
            });
            return;
        }
        try {
            callback(null, JSON.parse(doc));
        } catch (ex) {
            callback(ex);
        }
    });
}
