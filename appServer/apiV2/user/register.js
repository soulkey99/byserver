/**
 * Created by MengLei on 2015/7/28.
 */
"use strict";
const config = require('../../../config');
const proxy = require('../../../common/proxy');
const db = require('../../../config').db;
const result = require('../../utils/result');
const objectId = require('mongojs').ObjectId;
const log = require('../../../utils/log').http;
const checkSMSCode = require('../../../utils/checkSMSCode');
const handleInvite = require('./../../utils/handleInvite');
const ip = require('./../../../utils/ipAddr');
const addBonus = require('../../utils/addBonus');
const dbLog = require('../../../utils/log').dbLog;

//注册新用户
module.exports = function (req, res) {
    //
    if (!req.body.phonenum) {
        return result(res, {statusCode: 922, message: '手机号不能为空！'});
    }
    if (!req.body.userType) {
        return result(res, {statusCode: 904, message: 'userType不能为空！'});
    }

    db.users.findOne({phone: req.body.phonenum}, function (err, doc) {
        if (err) {
            log.trace('register v2 error: ' + err.message);
            return result(res, {statusCode: 905, message: err.message});
        }
        if (doc && (!doc.userInfo.ext_info.first)) {
            //用户存在，返回错误
            log.trace('user already exists.');
            return result(res, {statusCode: 901, message: '注册失败，用户已存在！'});
        }
        //用户不存在，执行注册新用户的流程
        checkSMSCode(req.body.phonenum, req.body.smscode, function (err2, resp) {
            if (err2) {
                console.log('register, check sms code error: ' + JSON.stringify(err2));
                log.trace('check sms code error: ' + err.message);
                return result(res, {statusCode: 905, message: err.message});
            }
            if (!resp.code) {
                //sms code 校验成功，执行注册流程
                var token = require('crypto').randomBytes(16).toString('hex');
                var curTime = new Date().getTime();
                var _id = (!!doc && !!doc._id) ? doc._id : new objectId();
                log.trace('new user, userID: ' + _id.toString() + ', authSign: ' + token);

                var shareCode = '';
                if (doc && doc.userInfo) {
                    shareCode = (doc.userInfo.ext_info.promoterShareCode || '');
                }

                var resObject = {  //初始化用户信息
                    _id: _id,
                    phone: req.body.phonenum,
                    nick: req.body.nick || '',
                    intro: '这个人很懒，什么也没留下...',
                    autoReply: '',
                    authSign: token,
                    passwd: req.body.passwd,
                    status: "online",
                    userType: req.body.userType,
                    userInfo: {
                        name: '',
                        family_name: '',
                        given_name: '',
                        avatar: req.body.avatar || '',
                        gender: '',
                        id_no: '',
                        age: '',
                        birthday: '',
                        money: 0,
                        bonus: 0,
                        promoter: false,
                        address: {
                            country: '中国',
                            province: '',
                            city: '',
                            region: '',
                            address: ''
                        },
                        school: '',
                        student_info: {
                            grade: '',
                            watchedTeachers: []
                        },
                        teacher_info: {
                            grades: [],
                            verify_type: 'notVerified',
                            id_pic: '',
                            certificate_pic: '',
                            verify_desc: '',
                            admin_reason: '',
                            orders_grabbed: 0,
                            order_finished: 0,
                            stars: 0,
                            point: 0
                        },
                        ext_info: {
                            first: false, //首次登陆之后改为false
                            promoterShareCode: shareCode //被哪个邀请码邀请到的
                        },
                        create_time: curTime,
                        last_login: curTime
                    }
                };
                db.users.save(resObject);
                resObject.userID = _id.toString();
                resObject.statusCode = 900;
                delete(resObject._id);
                delete(resObject.passwd);
                result(res, resObject);
                if (resObject.userType == 'teacher') {
                    //
                    proxy.GSList.onStart(resObject.userID);
                    //给新注册教师发送问卷系统消息---------------------------------------------
                    var msg = {
                        "from": "sojump20151221",
                        "to": resObject.userID,
                        "type": "system",
                        "detail": {
                            "type": "link",
                            "topic": "点开有惊喜，积分免费送",
                            "content": "CallCall教师有奖调查问卷",
                            "link": "http://www.sojump.com/jq/6833933.aspx"
                        },
                        "time": Date.now(),
                        "delete": false,
                        "read": false,
                        "display": true
                    };
                    db.msgbox.insert(msg);
                }
                //-------------------------------------------------------------------------
                //发放首次登录奖励
                addBonus(resObject.userID, '0');  //首次登录，类型为 0
                //如果推广表中有对应手机号，那么置为true
                db.promotion.update({phonenum: req.body.phonenum}, {$set: {registered: true}});
                //处理邀请信息
                handleInvite.v2(resObject.userID);
                //记录登录log
                var regInfo = {
                    api: 'v2',
                    userType: req.body.userType,
                    platform: '',
                    client: '',
                    channel: '',
                    ip: ip(req)
                };
                if (req.headers.platform) {
                    regInfo.platform = req.headers.platform.toLowerCase();
                }
                if (req.headers.client) {
                    regInfo.client = req.headers.client.toLowerCase();
                }
                if (req.headers.channel) {
                    regInfo.channel = req.headers.channel;
                }
                if (req.body.u) {
                    regInfo.imei = req.body.u;
                }
                if (req.body.w) {
                    regInfo.mac = req.body.w;
                }
                //如果有邀请码，那么也记录下来邀请码的信息
                if (doc && doc.userInfo) {
                    regInfo.shareCode = (doc.userInfo.ext_info.promoterShareCode || '');
                }
                dbLog(resObject.userID, 'register', regInfo);
                //if(req.body.userType == 'teacher'){
                //    //如果是教师端，那么发送通知，告诉老师要上传身份证和教师资格证
                //    notifyTeacher(resObject.userID);
                //}
            } else {
                //sms code 检验失败，返回错误信息
                log.trace('register v2, check sms code error: ' + resp.error);
                result(res, {statusCode: resp.code, message: resp.error});
            }
        });
    });
};


