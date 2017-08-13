/**
 * Created by zhengyi on 15/2/25.
 */
"use strict";
const config = require('../../../config');
const proxy = require('../../../common/proxy');
const objectId = require('mongojs').ObjectId;
const result = require('../../utils/result');
const log = require('../../../utils/log').http;
const ip = require('./../../../utils/ipAddr');
const dbLog = require('../../../utils/log').dbLog;

module.exports = function (req, res) {
    if (!req.body.userID) {
        return result(res, {statusCode: 902, message: '自动登陆失败，用户ID为空！'});
    }
    proxy.User.getUserById(req.body.userID, (err, user)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        if (!user) {
            return result(res, {statusCode: 902, message: '自动登陆失败，用户不存在！'});
        }
        if (user.authSign != req.body.authSign) {
            return result(res, {statusCode: 903, message: '自动登录失败，登陆信息已失效！'});
        }
        user.authSign = require('crypto').randomBytes(16).toString('hex');
        user.status = 'online';
        user.userInfo.last_login = Date.now();
        let resObj = {
            statusCode: 900,
            status: 'online',
            phone: user.phone,
            userID: user._id.toString(),
            authSign: user.authSign,
            userInfo: user.userInfo.toObject(),
            nick: user.nick,
            intro: user.intro || '这个人很懒，什么也没留下...',
            autoReply: user.autoReply || '',
            has_passwd: !!user.passwd,
            userType: user.userType,
            sso_info: user.sso_info || {}
        };
        //登陆成功需要刷新session cache
        config.redis.del('session:' + resObj.userID);
        if (user.userType == 'teacher') {
            //对教师刷新科目列表
            proxy.GSList.onStart(resObj.userID);
            //对于内部专职教师，强制设置为已通过资格认证
            config.db.userConf.findOne({
                phonenum: resObj.phone,
                type: 'teacher',
                delete: false
            }, {_id: 1}, function (err2, doc2) {
                if (err2) {
                    return result(res, {statusCode: 905, message: err2.message});
                }
                if (doc2) {
                    user.userInfo.teacher_info.verify_type = 'verified';
                    resObj.userInfo.teacher_info.verify_type = 'verified';
                }
                user.save((err3)=> {
                    if (err3) {
                        return result(res, {statusCode: 905, message: err3.message});
                    }
                    result(res, resObj);
                });
            });
        } else {
            proxy.GSList.onRemove(resObj.userID);
            user.save((err3)=> {
                if (err3) {
                    return result(res, {statusCode: 905, message: err3.message});
                }
                result(res, resObj);
            });
        }
        log.trace('auto login new authSign token: ' + user.authSign);
        log.trace('auto login res: ' + JSON.stringify(resObj));

        var loginInfo = {
            api: 'v1',
            userType: user.userType,
            platform: '',
            client: '',
            channel: '',
            ip: ip(req)
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
        dbLog(resObj.userID, 'autoLogin', loginInfo);
    });
    // let users = config.db.collection('users');
    // var _id = "";
    // try {
    //     _id = new objectId(req.body.userID);
    // } catch (ex) {
    //     result(res, {statusCode: 905, message: ex.message});
    //     return;
    // }
    // users.findOne({_id: _id}, function (err, doc) {
    //     if (err) {
    //         log.error('auto login: ' + err.message);
    //         result(res, {statusCode: 903, message: err.message});
    //     }
    //     else {
    //         if (doc) {
    //             if (doc.authSign == req.body.authSign) {
    //                 var resobject = {
    //                     phone: doc.phone,
    //                     userID: doc._id.toString(),
    //                     userInfo: doc.userInfo,
    //                     nick: doc.nick,
    //                     intro: doc.intro || '这个人很懒，什么也没留下...',
    //                     autoReply: doc.autoReply || '',
    //                     has_passwd: !!doc.passwd,
    //                     userType: doc.userType,
    //                     sso_info: doc.sso_info || {}
    //                 };
    //                 //登陆成功需要刷新session cache
    //                 config.redis.del('session:' + resobject.userID);
    //                 require('crypto').randomBytes(16, function (ex, buf) {
    //
    //                     var token = buf.toString('hex');
    //                     log.trace('auto login new authSign token: ' + token);
    //
    //                     users.update({_id: _id}, {
    //                         $set: {
    //                             "authSign": token,
    //                             "status": "online",
    //                             "userInfo.last_login": new Date().getTime()
    //                         }
    //                     });
    //                     resobject.statusCode = 900;
    //                     resobject.authSign = token;
    //                     resobject.status = 'online';
    //                     log.trace('auto login res: ' + JSON.stringify(resobject));
    //                     //对于内部专职教师，强制设置为已通过资格认证
    //                     config.db.userConf.findOne({
    //                         phonenum: resobject.phone,
    //                         type: 'teacher'
    //                     }, {_id: 1}, function (err2, doc2) {
    //                         if (err2) {
    //                             result(res, {statusCode: 905, message: err.message});
    //                         } else {
    //                             if (doc2) {
    //                                 resobject.userInfo.teacher_info.verify_type = 'verified';
    //                             }
    //                             result(res, resobject);
    //                         }
    //                     });
    //
    //                     var loginInfo = {
    //                         api: 'v1',
    //                         userType: doc.userType,
    //                         platform: '',
    //                         client: '',
    //                         channel: '',
    //                         ip: ip(req)
    //                     };
    //                     if (req.headers.platform) {
    //                         loginInfo.platform = req.headers.platform.toLowerCase();
    //                     }
    //                     if (req.headers.client) {
    //                         loginInfo.client = req.headers.client.toLowerCase();
    //                     }
    //                     if (req.headers.channel) {
    //                         loginInfo.channel = req.headers.channel;
    //                     }
    //                     dbLog(resobject.userID, 'autoLogin', loginInfo);
    //                 });
    //             } else {
    //                 log.error('auto login, userID; ' + req.body.userID + ', token error.');
    //                 result(res, {statusCode: 903});
    //             }
    //         } else {
    //             log.error('auto login, userID; ' + req.body.userID + ', user not exists.');
    //             result(res, {statusCode: 902});
    //         }
    //     }
    // });
};