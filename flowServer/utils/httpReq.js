/**
 * Created by MengLei on 2015/6/12.
 */

var http = require('http');
var buf = require('buffer').Buffer;
var auth = require('./auth');
var config = require('../../config').lemianConfig;
var queryString = require('querystring');
var log = require('../../utils/log').flow;

var apiPath = {orderFlow: '/JsonApi.ashx', orderStatusApi: '/JsonStatusApi.ashx', orderStatus: '/JsonStatus.ashx', statusConfirm: '/StatusConfirm.ashx'};

//param参数结构： {api:'必须，api名称', flow: '流量包，充值流量需要', mobile:'手机号，充值、反馈接口需要', msgid: '订单任务编号，反馈接口需要'}
module.exports = function(param, callback) {
    var payLoad = '';
    var path = apiPath[param.api];

    if (!path) {
        callback({message: 'invalid le-mian api.'});
        return;
    }
    //根据不同的api，拼装不同的请求参数
    switch (param.api) {
        case 'orderFlow': //订购流量，需要根据请求内容每次动态计算加密签名
            payLoad = queryString.stringify(auth({mobile: param.mobile, flow: param.flow}));
            break;
        case 'orderStatusApi'://两个查询订购结果的接口，静态md5即可，访问参数相同
        case 'orderStatus':
            payLoad = queryString.stringify({userId: config.userId, userName: config.userName, password: config.passwordMD5});
            break;
        case 'statusConfirm'://订购结果反馈，前面的访问参数相同，需要传msgid和mobile
            payLoad = queryString.stringify({userId: config.userId, userName: config.userName, password: config.passwordMD5, mobile: param.mobile, msgid: param.msgid});
            break;
        default :
            break;
    }
    //console.log('payload: ' + payLoad);

    var opt = {
        method: 'POST',
        host: 'sdk.le-mian.com',
        port: 80,
        path: path,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': buf.byteLength(payLoad)
        }
    };
    var httpReq = http.request(opt, function (httpRes) {
        httpRes.setEncoding('utf-8');
        var body = '';
        httpRes.on('data', function (data) {
            body += data;
        });
        httpRes.on('end', function () {
            callback(null, body);
        });
    });
    httpReq.on('error', function (err) {
        callback(err);
    });
    httpReq.end(payLoad);
};