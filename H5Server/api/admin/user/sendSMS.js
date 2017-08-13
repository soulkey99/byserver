/**
 * Created by MengLei on 2015/9/21.
 */

var sendSMS = require('../../../../utils/sendSMS');
var db = require('./../../../../config').db;
var result = require('./../../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('./../../../../utils/log').h5;

//发送短信
module.exports = function(req, res) {
    var sendObj = {mobilePhoneNumber: req.body.phonenum, template: 'smscode'};
    switch (req.body.template) {
        case 'complain':    //被举报
            sendObj.template = 'complain';
            sendObj.action = (req.body.action || '');
            sendObj.result = (req.body.result || '');
            break;
        case 'system':  //系统通知
            sendObj.template = 'system';
            sendObj.action = (req.body.action || '');
            sendObj.result = (req.body.result || '');
            break;
        case 'flow':    //流量到账
            sendObj.template = 'byflow';
            sendObj.flow = (req.body.flow || '30');
            break;
        case 'teacher_pass':    //教师审核通过
            sendObj.template = 'teacher_pass';
            break;
        case 'teacher_reject':  //教师审核失败
            sendObj.template = 'teacher_reject';
            sendObj.result = (req.body.result || '');
            break;
        default :
            break;
    }
    sendSMS(sendObj, function (err, resp) {
        if (err) {
            log.error('send sms error: ' + err.message);
            result(res, {statusCode: 912, message: err.message});
        } else {
            log.trace('request sms success, response: ' + JSON.stringify(resp));
            if (resp.code) {
                result(res, {statusCode: resp.code, message: resp.error});
            } else {
                result(res, {statusCode: 900});
            }
        }
    })
};
