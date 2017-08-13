/**
 * Created by MengLei on 2015/7/27.
 */

var config = require('../../../config');
var db = require('../../../config').db;
var result = require('../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('../../../utils/log').http;
var sendSMS = require('../../../utils/sendSMS');
var dbLog = require('../../../utils/log').dbLog;

//获取短信验证码
module.exports = function(req, res) {
    if (!req.body.phonenum) {
        return result(res, {statusCode: 922, message: 'phone num can not be null'});
    }
    db.users.findOne({phone: req.body.phonenum, 'userInfo.ext_info.first': false}, {_id: 1}, function (err, doc) {
        if (err) {
            log.error('get sms, query user error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        } else {
            if (req.body.type == 'new') {
                //必须全新手机号才可以获取验证码
                if (doc) {
                    //如果用户手机号已经注册过
                    result(res, {statusCode: 901, message: 'user already exists.'});
                } else {
                    //如果用户手机号没有被注册过，则获取短信验证码
                    requestSMSCode(req.body.phonenum, res, req.body.smsType);
                }
            } else {
                //必须已注册手机号才可以获取验证码
                if (doc) {
                    //如果用户手机号已经注册过，则获取短信验证码
                    requestSMSCode(req.body.phonenum, res, req.body.smsType);
                } else {
                    //如果用户手机号没有被注册过
                    result(res, {statusCode: 902, message: 'user not exists.'});
                }
            }
        }
    });
};


function requestSMSCode(num, res, smsType){
    var sendObj = {mobilePhoneNumber: num, template: 'smscode'};
    if(smsType){
        sendObj['smsType'] = smsType;
    }
    sendSMS(sendObj, function(err, resp){
        if(err){
            log.error('send sms error: ' + err.message);
            result(res, {statusCode: 912, message: err.message});
        }else {
            log.trace('request sms success, response: ' + JSON.stringify(resp));
            if (resp.code) {
                result(res, {statusCode: resp.code, message: resp.error});
            } else {
                result(res, {statusCode: 900});
            }
        }
    });
}