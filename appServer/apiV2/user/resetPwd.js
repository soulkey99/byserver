/**
 * Created by MengLei on 2015/7/30.
 */

var config = require('../../../config');
var db = require('../../../config').db;
var result = require('../../utils/result');
var objectId = require('mongojs').ObjectId;
var checkSMSCode = require('../../../utils/checkSMSCode');
var log = require('../../../utils/log').http;

//通过短信验证码重置密码
module.exports = function(req, res) {
    //
    if (!req.body.phonenum) {
        log.error('reset password, phone num is null.');
        return result(res, {statusCode: 922, message: 'phone num can not be null'});
    }
    if (!req.body.smscode) {
        log.error('reset password, sms code is null.');
        return result(res, {statusCode: 926, message: 'phone num can not be null'});
    }
    if (!req.body.passwd) {
        log.error('reset password, passwd is null.');
        return result(res, {statusCode: 927, message: 'passwd can not be null'});
    }

    checkSMSCode(req.body.phonenum, req.body.smscode, function (err, resp) {
        if (err) {
            //handle error
            log.error('reset pwd, check sms error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        } else {
            if (!resp.code) {
                //验证码成功，执行重置密码
                log.trace('resetPwd, check sms code success.');
                db.users.update({phone: req.body.phonenum}, {$set: {passwd: req.body.passwd}}, function (err2, doc2) {
                    if (err2) {
                        //handle error
                        log.error('resetPwd, update pwd error: ' + err2.message);
                        result(res, {statusCode: 905, message: err2.message});
                    } else {
                        //更新密码操作成功
                        if (doc2.n > 0) {
                            //更新密码数量大于0，表示有数据被更新
                            log.trace('resetPwd success.');
                            result(res, {statusCode: 900});
                        } else {
                            //更新密码数量不大于0，表示没有数据被更新，即手机号在系统中没有注册
                            log.error('resetPwd, no pwd updated.');
                            result(res, {statusCode: 902, message: 'user not exists.'});
                        }
                    }
                });
            } else {
                //验证码错误
                log.error('check sms code error.');
                result(res, {statusCode: resp.code, message: resp.error});
            }
        }
    });
};
