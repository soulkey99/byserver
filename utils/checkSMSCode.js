/**
 * Created by MengLei on 2015/7/28.
 */

var http = require('https');
var config = require('../config');
var log = require('./log').sms;

module.exports = function(phonenum, smscode, callback) {

    //if (config.testPhones.indexOf(phonenum) >= 0 || phonenum.indexOf('90') == 0 || phonenum.indexOf('99') == 0) {
    //    if (smscode == '123123') {
    //        log.trace('test phone check sms success');
    //        callback(null, {});
    //        return;
    //    }
    //}
    if (config.production_mode == 'false') {
        //测试环境才生效
        if (smscode == '123123') {
            log.trace('test mode sms code 123123 check success');
            callback(null, {});
            return;
        }
    }
    //if (config.teacherPhones.indexOf(phonenum) >= 0) {
    //    if (smscode == '456456') {
    //        log.trace('teacher phone check sms success');
    //        callback(null, {});
    //        return;
    //    }
    //}

    config.db.userConf.findOne({phonenum: phonenum}, function (err, doc) {
        if (err) {
            log.error('check sms code, query userConf error: ' + err.message);
            callback(err);
        } else {
            //
            if (doc) {
                //如果有配置信息，那么校验smscode
                if (doc.smscode == smscode) {
                    //校验成功，返回结果，否则继续
                    callback(null, {});
                    return;
                }
            }
            if(!smscode){
                //没有输入验证码，直接返回错误
                callback(null, {code: 603});
                return;
            }
            if(!(/\d{6}/.test(smscode))){
                //输入的验证码不是六位纯数字，返回错误
                callback(null, {code: 603});
                return;
            }
            //查询配置信息结束，并没有登录预配置信息，可以继续
            var path = '/1.1/verifySmsCode/' + smscode + '?mobilePhoneNumber=' + phonenum;
            var options = {
                host: 'leancloud.cn',
                path: path,
                method: 'POST',
                headers: config.smsConfig
            };

            var httpReq = http.request(options, function (httpRes) {
                httpRes.setEncoding('utf8');
                var str = '';
                httpRes.on('data', function (data) {
                    str += data.toString();
                });
                httpRes.on('end', function () {
                    log.debug('check sms code at leancloud:' + str);
                    var respObj = {};
                    console.log('check sms code resp string: ' + str);
                    try {
                        respObj = JSON.parse(str);
                        callback(null, respObj);
                    } catch (ex) {
                        console.log('check sms code exception: ' + ex.message);
                        log.error('sms service exception: ' + ex.message);
                        callback(null, {statusCode: 912, message: 'sms service exception.'});
                    }
                });
            });

            httpReq.on('error', function (e) {
                log.error('login, third part sms service error: ' + e.message);
                callback(e);
            });

            httpReq.end();
        }
    });
};