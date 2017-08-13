/**
 * Created by zhengyi on 15/2/25.
 */

var result = require('../../utils/result');
var log = require('../../../utils/log').http;

module.exports = function (req, res) {
    var http = require('https');
    var options = {
        host: 'leancloud.cn',
        path: '/1.1/requestSmsCode',
        method: 'POST',
        headers: require('../../../config').smsConfig
    };
    var httpReq = http.request(options, function (httpRes) {
        httpRes.setEncoding('utf8');
        httpRes.on('data', function (data) {
            if (data) {
                result(res, handleSMS(data));
            }
        });
    });

    httpReq.on('error', function (e) {
        result(res, {statusCode: 905, message: 'third part sms request problem : ' + e.message});
    });

    //var data = '{"mobilePhoneNumber": "' + req.body.phonenum + '"}';
    var data = {mobilePhoneNumber: req.body.phonenum, template: 'smscode'};
    httpReq.write(JSON.stringify(data));
    log.debug('get sms code, phone num: ' + req.body.phonenum);
    httpReq.end();
};

//处理leancloud服务返回的关于sms的数据
//如果请求成功，会返回一个空json，如果请求失败，会返回错误码code和错误信息error
function handleSMS(data) {
    var resObj = {};
    //先将返回数据解析为json
    try {
        var dataObj = JSON.parse(data);
        if (!dataObj.code) {
            log.debug('get sms code success');
            resObj.statusCode = 900;
        } else {
            log.error('get sms code error ' + data.toString());
            if (dataObj.code == 1) {
                resObj.statusCode = 912;
            } else if (dataObj.code == 127) {
                resObj.statusCode = 913;
            } else {
                resObj.statusCode = 905;
            }
            //resObj.statusCode = dataObj.code == 1 ? 912 : dataObj.code;
            resObj.message = dataObj.error;
        }
    } catch (ex) {
        log.error('get sms code error: ' + ex.message);
        resObj.statusCode = 905;
        resObj.message = 'third part sms service error.';
    }
    return resObj;
}
