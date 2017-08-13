/**
 * Created by MengLei on 2015/6/12.
 */

var crypto = require('crypto');
var config = require('../../config').lemianConfig;
var log = require('../../utils/log').flow;

module.exports = function(param) {
    //
    var obj = auth();
    if (param && param.mobile) {
        obj.mobile = param.mobile;
    }
    if (param && param.flow) {
        obj.flow = param.flow;
    }
    if (param && param.msgid) {
        obj.msgid = param.msgid;
    }

    var sigStr = obj.userId + ',' + obj.userName + ',' + obj.password;
    if(obj.mobile){
        sigStr += (',' + obj.mobile);
    }
    if(obj.flow){
        sigStr += (',' + obj.flow);
    }
    if(obj.stamp){
        sigStr += (',' + obj.stamp);
    }

    log.trace('sigStr: ' + sigStr);
    obj.secret = md5(sigStr);
    return obj;
};

function auth() {
    var ts = timestamp();
    var pwd = md5(config.password + ts);
    return {userId: config.userId, userName: config.userName, password: pwd, stamp: ts};
}


function timestamp() {
    //È¡Ê±¼ä´Á£¬MMDDHHmmss
    var curTime = new Date();
    var month = (curTime.getMonth() + 1).toString();
    var date = curTime.getDate().toString();
    var hour = curTime.getHours().toString();
    var minute = curTime.getMinutes().toString();
    var second = curTime.getSeconds().toString();
    month = month.length == 2 ? month : '0' + month;
    date = date.length == 2 ? date : '0' + date;
    hour = hour.length == 2 ? hour : '0' + hour;
    minute = minute.length == 2 ? minute : '0' + minute;
    second = second.length == 2 ? second : '0' + second;
    return month + date + hour + minute + second;
    //return '0612222603';
}

function md5(str){
    var md5 = crypto.createHash('md5');
    md5.update(str);
    return md5.digest('hex').toUpperCase();
}

