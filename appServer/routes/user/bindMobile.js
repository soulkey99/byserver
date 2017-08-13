/**
 * Created by MengLei on 2015/7/17.
 */
"use strict";
const config = require('../../../config');
const proxy = require('../../../common/proxy');
const db = require('../../../config').db;
const result = require('../../utils/result');
const objectId = require('mongojs').ObjectId;
const log = require('../../../utils/log').http;
const checkSMSCode = require('../../../utils/checkSMSCode');

//第三方登录的用户，绑定手机号码
module.exports = function (req, res) {
    checkSMSCode(req.body.phonenum, req.body.smscode, (err, resp)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        if (!resp.code) {
            //sms 校验成功
            proxy.User.getUserById(req.body.userID, (err, user)=> {
                if (err) {
                    return result(res, {statusCode: 905, message: err.message});
                }
                proxy.User.getUserByPhone(req.body.phonenum, (err2, user2)=> {
                    if (err2) {
                        return result(res, {statusCode: 905, message: err2.messasge});
                    }
                    if (!user2) {
                        user.phone = req.body.phonenum;
                        user.save((err3)=> {
                            if (err3) {
                                return result(res, {statusCode: 905, message: err3.message});
                            }
                            result(res, {statusCode: 900});
                        });
                        return;
                    }
                    result(res, {statusCode: 905, message: '绑定失败，手机号已注册过用户！'});
                });
            });
            return;
        }
        //sms code 检验失败，返回错误信息
        log.trace('check sms code error: ' + resp.error);
        result(res, {statusCode: resp.code, message: resp.error});
    });
};

function handleData(req, res, data) {
    proxy.User.getUserById(req.body.userID, (err, user)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        proxy.User.getUserByPhone(req.body.phonenum, (err2, user2)=> {
            if (err2) {
                return result(res, {statusCode: 905, message: err2.messasge});
            }
            if (!user2) {
                user.phone = req.body.phonenum;
                user.save((err3)=> {
                    if (err3) {
                        return result(res, {statusCode: 905, message: err3.message});
                    }
                    result(res, {statusCode: 900});
                });
                return;
            }
            result(res, {statusCode: 905, message: '绑定失败，手机号已注册过用户！'});
        });
    });
    var dataObj = {};
    try {
        dataObj = JSON.parse(data);
    } catch (ex) {
        log.error('handle leancloud data error: ' + ex.message);
        result(res, {statusCode: 912, message: 'sms service error.'});
        return;
    }
    if (!dataObj.code) {
        //短信校验成功，执行绑定操作
        db.users.findOne({phone: req.body.phonenum}, function (err, doc) {
            if (err) {
                //handle error
            } else {
                if (doc) {
                    //手机号已经注册过，进行绑定操作
                    doBind(req, res, doc);
                } else {
                    //手机号没有注册过，那么直接将手机号绑定到该账号中
                    db.users.update({_id: new objectId(req.body.userID)}, {$set: {phone: req.body.phonenum}});
                    result(res, {statusCode: 900});
                }
            }
        })
    } else {
        //短信验证码无效的情况
        log.error('sms code for phone: ' + req.body.phonenum + ' error: ' + data);
        result(res, {statusCode: 911, message: 'sms code error.'});
        //result(res, dataObj);
    }
}

function doBind(req, res, doc) {
    var userID = req.body.userID;  //新id
    var u_id = doc._id.toString();  //旧id
    delete(doc._id);
    delete(doc.authSign);
    delete(doc.userType);
    var sso_info = req.user.sso_info;
    for (var item in doc.sso_info) {
        sso_info[item] = doc.sso_info[item];
    }
    doc.sso_info = sso_info;
    db.users.update({_id: req.user._id}, {$set: doc});
    var resobject = {
        statusCode: 900,
        phone: doc.phone,
        userID: userID,
        authSign: req.body.authSign,
        userInfo: doc.userInfo,
        nick: doc.nick,
        status: 'online',
        userType: req.user.userType,
        sso_info: sso_info
    };
    result(res, resobject);

    //迁移问答(每个订单中的t_id， s_id， from， to都需要修改对新的id，然后再保存回去)
    //db.orders.update({t_id: u_id}, {$set: {t_id: userID}});
    db.orders.find({t_id: u_id}, function (err, doc) {
        if (err) {
            //handle error
        } else {
            for (var i = 0; i < doc.length; i++) {
                doc[i].t_id = userID;
                for (var j = 0; j < doc[i].chat_msg.length; j++) {
                    if (doc[i].chat_msg[j].from == u_id) {
                        doc[i].chat_msg[j].from = userID;
                    }
                    if (doc[i].chat_msg[j].to == u_id) {
                        doc[i].chat_msg[j].to = userID;
                    }
                }
                db.orders.save(doc[i]);
            }
        }
    });
    //db.orders.update({s_id: u_id}, {$set: {s_id: userID}});
    db.orders.find({s_id: u_id}, function (err, doc) {
        if (err) {
            //handle error
        } else {
            for (var i = 0; i < doc.length; i++) {
                doc[i].s_id = userID;
                for (var j = 0; j < doc[i].chat_msg.length; j++) {
                    if (doc[i].chat_msg[j].from == u_id) {
                        doc[i].chat_msg[j].from = userID;
                    }
                    if (doc[i].chat_msg[j].to == u_id) {
                        doc[i].chat_msg[j].to = userID;
                    }
                }
                db.orders.save(doc[i]);
            }
        }
    });
    //迁移用户反馈
    db.feedbacks.update({userID: u_id}, {$set: {userID: userID}});
    //迁移邀请码
    db.shareCode.update({userID: u_id}, {$set: {userID: userID}});
    //删除原账户
    db.users.remove({_id: new objectId(u_id)});

}