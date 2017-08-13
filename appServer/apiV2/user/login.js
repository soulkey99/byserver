/**
 * Created by MengLei on 2015/7/28.
 */
"use strict";
const config = require('../../../config');
const db = require('../../../config').db;
const result = require('../../utils/result');
const objectId = require('mongojs').ObjectId;
const proxy = require('../../../common/proxy');
const log = require('../../../utils/log').http;
const checkSMSCode = require('../../../utils/checkSMSCode');
const firstLoginMsg = require('../../routes/msgbox/firstLoginMsg');
const ip = require('./../../../utils/ipAddr');
const dbLog = require('../../../utils/log').dbLog;

//用户登录
module.exports = function (req, res) {
    // log.trace('loginV2 headers: ' + JSON.stringify(req.headers));
    if (!req.body.phonenum) {
        return result(res, {statusCode: 922, message: '手机号码不能为空！'});
    }
    //先在数据库库中查找手机号对应的配置信息
    db.userConf.findOne({phonenum: req.body.phonenum}, function (err2, doc2) {
        if (err2) {
            log.error('login, check conf error: ' + err2.message);
            return result(res, {statusCode: 905, message: err2.message});
        }
        //检查配置信息
        if (doc2) {
            req.userConf = doc2;
            if (doc2.status == 'blacklist') {
                //黑名单，禁止登陆，直接返回错误
                log.error('phonenum ' + req.body.phonenum + ' login error, blacklist');
                result(res, {statusCode: 946, message: '账号封禁.'});
                return;
            }
        }
        if (req.body.passwd) {
            //如果是用密码登录
            db.users.findOne({phone: req.body.phonenum, 'userInfo.ext_info.first': false}, function (err, doc) {
                if (err) {
                    //handle error
                    log.trace('login error: ' + err.message);
                    return result(res, {statusCode: 910, message: err.message});
                }
                if (!doc) {
                    //用户不存在
                    log.error('login, user not exist, phone: ' + req.body.phonenum);
                    return result(res, {statusCode: 902, message: '用户不存在！'});
                }
                //用户存在
                if (!doc.passwd) {
                    log.error('pass word not exists, please set up a new password, phonenum: ' + req.body.phonenum);
                    return result(res, {statusCode: 924, message: '登陆失败，用户尚未设置密码！'});
                }
                if (doc.passwd != req.body.passwd) {//密码错误
                    log.error('login password error. phone num: ' + req.body.phonenum);
                    return result(res, {statusCode: 923, message: '登陆失败，用户密码错误！'});
                }
                //密码正确，执行登录
                log.trace('password correct, do login.');
                doLogin(req, res);
            });
        } else if (req.body.smscode) {
            //如果是短信验证码登录
            checkSMSCode(req.body.phonenum, req.body.smscode, function (err, resp) {
                if (err) {
                    log.error('check sms error: ' + err.message);
                    return result(res, {statusCode: 905, message: err.message});
                }
                if (!resp.code) {
                    //验证码成功，执行登录
                    log.trace('check sms code success.');
                    doLogin(req, res);
                } else {
                    //验证码错误
                    log.error('check sms code error.');
                    result(res, {statusCode: resp.code, message: resp.error});
                }

            });
        } else {
            log.error('smscode and passwd both null.');
            result(res, {statusCode: 925, message: '登陆失败，用户密码或者短信验证码不能全为空！'});
        }
    });
};


function doLogin(req, res) {
    proxy.User.getUserByPhone(req.body.phonenum, (err, user)=> {
        if (err) {
            log.error('do login, error: ' + err.message);
            return result(res, {statusCode: 905, message: err.message});
        }
        if (!user) {
            log.error('do login, error, user not exists. phone: ' + req.body.phonenum);
            return result(res, {statusCode: 902, message: '用户不存在！'});
        }
        let resObj = {
            statusCode: 900,
            authSign: '',
            phone: user.phone,
            userID: user._id.toString(),
            userInfo: user.userInfo.toObject(),
            nick: user.nick,
            intro: user.intro || '这个人很懒，什么也没留下...',
            autoReply: user.autoReply || '',
            status: 'online',
            userType: user.userType,
            has_passwd: !!user.passwd,
            sso_info: user.sso_info || {}
        };
        //new authSign
        let token = require('crypto').randomBytes(16).toString('hex');
        log.trace('do login, userID: ' + user._id.toString() + ', new authSign: ' + token);
        resObj.authSign = token;
        user.authSign = token;
        user.status = 'online';
        user.userType = req.body.userType || user.userType;
        // log.trace('login userType: ' + user.userType);
        user.userInfo.ext_info.first = false;
        user.userInfo.last_login = Date.now();
        //登陆成功之后，就删除掉之前保存的device_token信息，如果需要，那么再次report，不保留之前的
        db.pushTokens.remove({_id: user._id}, ()=> {
        });
        //登陆成功需要刷新session cache
        config.redis.del('session:' + resObj.userID);
        //对于教师登陆成功，需要刷新推送科目，学生登陆成功则删除对应的记录
        if (user.userType == 'teacher') {
            proxy.GSList.onStart(resObj.userID);
        } else {
            proxy.GSList.onRemove(resObj.userID);
        }
        //判断内部教师
        if (req.userConf && req.userConf.type == 'teacher') {
            if (req.userConf.delete === false) {    //在职内部教师
                user.userInfo.channel = 'qa_center';
                user.userInfo.teacher_info.verify_type = 'verified';
                resObj.userInfo.teacher_info.verify_type = 'verified';
            } else {
                if (user.userInfo.channel == 'qa_center') { //离职内部教师
                    user.userInfo.channel = 'qa_former';
                }
            }
        }
        user.save((err2)=> {
            if (err2) {
                return result(res, {statusCode: 905, message: err2.message});
            }
            result(res, resObj);
            //对首次登录发送msg使用
            firstLoginMsg(resObj.userID, (req.body.userType || user.userType));
            //记录log
            let loginInfo = {
                api: 'v2',
                userType: req.body.userType,
                platform: '',
                client: '',
                channel: '',
                ip: ip(req),
                imei: '',
                mac: ''
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
            dbLog(resObj.userID, 'login', loginInfo);
        });
    });
    // db.users.findOne({phone: req.body.phonenum, 'userInfo.ext_info.first': false}, function (err, doc) {
    //     if (err) {
    //         //handle error
    //         log.error('do login, error: ' + err.message);
    //         result(res, {statusCode: 905, message: err.message});
    //     } else {
    //         if (doc) {
    //             var curTime = new Date().getTime();
    //             var resobject = {
    //                 phone: doc.phone,
    //                 userID: doc._id.toString(),
    //                 userInfo: doc.userInfo,
    //                 nick: doc.nick,
    //                 intro: doc.intro || '这个人很懒，什么也没留下...',
    //                 autoReply: doc.autoReply || '',
    //                 status: 'online',
    //                 userType: doc.userType,
    //                 sso_info: doc.sso_info || {}
    //             };
    //             //登陆成功需要刷新session cache
    //             config.redis.del('session:' + resobject.userID);
    //
    //             //用户已设置密码，则为true，否则为false
    //             if (doc.passwd) {
    //                 delete(doc.passwd);
    //                 resobject.has_passwd = true;
    //             } else {
    //                 resobject.has_passwd = false;
    //             }
    //
    //             var token = require('crypto').randomBytes(16).toString('hex');
    //             log.trace('do login, userID: ' + doc._id.toString() + ', new authSign: ' + token);
    //             var setObj = {};
    //             //如果传入有userType，那么更新，否则保留原来的不变
    //             if (req.body.userType) {
    //                 setObj = {
    //                     "authSign": token,
    //                     "status": "online",
    //                     "userType": req.body.userType,
    //                     "userInfo.last_login": curTime
    //                 };
    //                 resobject.userType = req.body.userType;
    //             } else {
    //                 setObj = {
    //                     "authSign": token,
    //                     "status": "online",
    //                     "userInfo.last_login": curTime
    //                 };
    //             }
    //
    //             if (doc.userInfo.ext_info && doc.userInfo.ext_info.first == false) {
    //             } else {
    //                 setObj['userInfo.ext_info.first'] = false;//如果这个字段没有置为true，那么就置为true
    //             }
    //
    //             //是首次登录，update：修改登录流程之后，就没有首次登录的事情了，所有首次登录的都必须要走注册接口
    //             //if (doc.userInfo.ext_info && doc.userInfo.ext_info.first == true) {
    //             //    if(doc.userInfo.ext_info.promoterShareCode == 'FrvMz'){
    //             //        //如果是从邀请码 FrvMz 注册的，那么不发放奖励
    //             //    }else {
    //             //        //如果是被邀请的用户并且是首次登录，那么要发放邀请奖励
    //             //        handleInviteFirstLogin(req.body.phonenum);
    //             //    }
    //             //}
    //
    //             db.pushTokens.remove({_id: doc._id});   //登陆成功之后，就删除掉之前保存的device_token信息，如果需要，那么再次report，不保留之前的
    //
    //             db.users.update({_id: doc._id}, {$set: setObj});
    //             resobject.statusCode = 900;
    //             resobject.authSign = token;
    //             //console.log('res:' + JSON.stringify(resobject));
    //             //log.trace('login response data: ' + JSON.stringify(resobject));
    //             log.trace('login success: ' + req.body.phonenum);
    //
    //             //对于内部专职教师，强制设置为已通过资格认证
    //             db.userConf.findOne({phonenum: resobject.phone, type: 'teacher'}, {_id: 1}, function (err2, doc2) {
    //                 if (err2) {
    //                     result(res, {statusCode: 905, message: err.message});
    //                 } else {
    //                     if (doc2) {
    //                         resobject.userInfo.teacher_info.verify_type = 'verified';
    //                     }
    //                     result(res, resobject);
    //                 }
    //             });
    //
    //             var loginInfo = {
    //                 api: 'v2',
    //                 userType: req.body.userType,
    //                 platform: '',
    //                 client: '',
    //                 channel: '',
    //                 ip: ip(req),
    //                 imei: '',
    //                 mac: ''
    //             };
    //             if (req.headers.platform) {
    //                 loginInfo.platform = req.headers.platform.toLowerCase();
    //             }
    //             if (req.headers.client) {
    //                 loginInfo.client = req.headers.client.toLowerCase();
    //             }
    //             if (req.headers.channel) {
    //                 loginInfo.channel = req.headers.channel;
    //             }
    //             if (req.body.u) {
    //                 loginInfo.imei = req.body.u;
    //             }
    //             if (req.body.w) {
    //                 loginInfo.mac = req.body.w;
    //             }
    //             dbLog(resobject.userID, 'login', loginInfo);
    //             //对首次登录发送msg使用
    //             firstLoginMsg(resobject.userID, (req.body.userType || doc.userType));
    //         } else {
    //             //用户不存在
    //             log.error('login, user not exist, phone: ' + req.body.phonenum);
    //             result(res, {statusCode: 902, message: 'user not exists.'});
    //         }
    //     }
    // });
}

