/**
 * Created by MengLei on 2015/10/26.
 */

var db = require('./../../../../config').db;
var objectId = require('mongojs').ObjectId;
var result = require('./../../../utils/result');
var log = require('../../../../utils/log').h5;

//公众号登录
module.exports = function(req, res) {
    db.users.findOne({email: req.body.email, userType: 'public'}, function (err, doc) {
        if (err) {
            //
            log.trace('public number login error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        } else {
            if (doc) {
                //用户存在
                if (req.body.passwd == doc.passwd) {
                    //密码正确
                    log.trace('public number login success, email: ' + req.body.email);
                    var token = require('crypto').randomBytes(16).toString('hex');
                    db.users.update({_id: doc._id}, {$set: {authSign: token}});
                    var resp = {
                        statusCode: 900,
                        userID: doc._id.toString(),
                        authSign: token,
                        nick: doc.nick,
                        status: doc.status,
                        userInfo: doc.userInfo,
                        intro: doc.intro,
                        email: doc.email
                    };
                    result(res, resp);
                } else {
                    //密码错误
                    log.trace('public number login fail, password error, email: ' + req.body.email);
                    result(res, {statusCode: 923, message: '登录密码错误！'});
                }
            } else {
                //用户不存在，返回错误
                log.trace('public number login fail, user not exists, email: ' + req.body.email);
                result(res, {statusCode: 902, message: '用户不存在！'});
            }
        }
    });
};
