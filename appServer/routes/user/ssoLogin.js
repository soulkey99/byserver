/**
 * Created by MengLei on 2015/7/31.
 */
"use strict";
var config = require('../../../config');
var result = require('../../utils/result');
var proxy = require('../../../common/proxy');
var log = require('../../../utils/log').http;
var ip = require('./../../../utils/ipAddr');
var dbLog = require('../../../utils/log').dbLog;

//用户使用绑定的第三方sso信息进行登录，如果用户没有注册过，则直接创建新用户
module.exports = function (req, res) {
    //
    var ssoType = req.body.ssoType;
    if (!ssoType) {
        result(res, {statusCode: 945, message: 'ssoType empty.'});
        return;
    }
    if (!req.body.openid) {
        result(res, {statusCode: 944, message: 'openid empty.'});
        return;
    }
    var query = {};
    query['sso_info.' + ssoType + '.openid'] = req.body.openid;
    var curTime = new Date().getTime();
    var token = require('crypto').randomBytes(16).toString('hex');

    //记录ssologin的日志
    var loginInfo = {
        api: 'v1',
        userType: req.body.userType,
        platform: '',
        client: '',
        channel: '',
        ip: ip(req),
        imei: '',
        mac: '',
        ssoType: ssoType
    };
    if (req.headers.platform) {
        loginInfo.platform = req.headers.platform.toLowerCase();
    }
    if (req.headers.client) {
        loginInfo.client = req.headers.client.toLowerCase();
    }
    if (req.headers.channel) {
        loginInfo.channel = req.headers.channel;
    }
    if (req.body.u) {
        loginInfo.imei = req.body.u;
    }
    if (req.body.w) {
        loginInfo.mac = req.body.w;
    }

    proxy.User.getUserBySSO(req.body.openid, req.body.ssoType, function (err, doc) {
        if (err) {
            result(res, {statusCode: 905, message: err.message});
        } else {
            if (!doc) {//用户不存在，直接创建新用户
                if (['weixin', 'qq', 'weibo'].indexOf(req.body.ssoType) < 0) {
                    //ssoType不正确
                    return result(res, {statusCode: 945, message: 'ssoType error.'});
                }
                proxy.User.createNewUser({
                    ssoType: req.body.ssoType,
                    userType: req.body.userType,
                    sso_openid: req.body.openid,
                    sso_token: req.body.token,
                    sso_nick: req.body.nick,
                    sso_avatar: req.body.avatar,
                    sso_expire: req.body.expire
                }, function (err2, doc2) {
                    if (err2) {
                        return result(res, {statusCode: 905, message: err2.message});
                    }
                    var info = doc2.toObject();
                    info.userID = doc2._id.toString();
                    info.isNew = true;  //新建的用户，返回一个标识
                    info.statusCode = 900;
                    log.trace('sso login, create new user response data: ' + JSON.stringify(info));
                    result(res, info);
                    //记录日志
                    dbLog(info.userID, 'ssoRegister', loginInfo);

                });
                return;
            }
            //用户存在，直接走登录流程
            doc.authSign = token;
            doc.status = 'online';
            doc.userType = req.body.userType || doc.userType;   //userType如果传了就更新，没传就继续使用以前的
            doc.userInfo.last_login = curTime;
            if (doc.userInfo.ext_info && doc.userInfo.ext_info.first == true) {
                //如果这个字段没有置为false，那么就置为false
                doc.userInfo.ext_info.first = false;
            }
            //登陆成功刷新session cache
            config.redis.del('session:' + doc.userID);
            if (doc.userType == 'teacher' && doc.userInfo.teacher_info.verify_type == 'verified') {
                proxy.GSList.onStart(doc.userID);
            } else {
                proxy.GSList.onRemove(doc.userID);
            }
            //保存新的登录信息
            doc.save(function (err2) {
                if (err2) {
                    result(res, {statusCode: 905, message: err2.message});
                    return;
                }
                var info = doc.toObject();
                info.userID = doc._id.toString();
                info.isNew = false;  //不是新用户，返回false
                info.statusCode = 900;
                log.trace('sso login response data: ' + JSON.stringify(info));
                result(res, info);
                //记录日志
                dbLog(info.userID, 'ssoLogin', loginInfo);
                //登陆成功之后，就删除掉之前保存的device_token信息，如果需要，那么再次report，不保留之前的
                proxy.PushToken.removeTokenByUserID(doc._id, function (err) {
                    if (err) {
                        log.error('remove push token error: ' + err.message);
                    }
                });
            });

        }
    });
};

