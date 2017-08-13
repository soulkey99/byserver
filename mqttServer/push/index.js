/**
 * Created by MengLei on 2015/2/19.
 */

var router = require('../router');
var log = require('./../../utils/log').mqtt;

//向客户端推送消息，如果有目的地址，则推送到目的地址，否则根据content内容进行推送，如果content内容格式不正确，则不推送
module.exports = function (param, result) {
    try {
        //content 传过来的是string，这里给解析为object
        var content = param.content;
        //to的情况不同，有可能直接是包含一个uid的string，也有可能是包含多个uid被序列化之后的array，这里解析如果失败，那么
        //参数to就是一个uid了，走下面的pushTo流程，如果解析成功，那么就是uid的array，走pushToArray流程
        var to = param.to;
        if (to instanceof(Array)) {
            result(null, pushToArray(content, to));
        }
    } catch (ex) {
        log.error('parse push dest error: ' + ex.message);
        result(ex);
    }
};

//给单独一个uid进行推送消息
var pushTo = function (content, to) {
    log.trace('push to single uid: ' + to);
    if (!to) {
        to = content.to;
    }
    if (!to) {
        //destination invalid, return false;
        return {code: 1, msg: 'destination invalid.'};
    }
    if (!router.isOnline(to)) {
        //destination offline, return false;
        return {code: 2, msg: 'destination offline.'};
    }
    router.pushMsg(content, to);
    return {code: 0}
};

//给一组uid进行推送消息
var pushToArray = function (content, to) {
    log.trace('push to many uids: ' + JSON.stringify(to));
    //这个数组用来存放离线用户的uid
    var offlineDest = [];
    //遍历所有uid，在线的就push消息，不在线的uid存起来返回给app server
    for (var i = 0; i < to.length; i++) {
        //if (!router.isOnline(to[i])) {
        //    offlineDest.push(to[i]);
        //} else {
        //    router.pushMsg(content, to[i]);
        //}
        router.pushMsg(content, to[i]);
    }
    if (offlineDest.length > 0) {
        //离线uid数组长度大于0，则证明有uid离线，将这些uid返回给app server
        return {code: 2, content: {offlineDest: offlineDest}, msg: 'destination(s) offline.'}
    } else {
        //离线uid数组为空，则说明所有uid全部在线并已经push消息，返回成功给app server
        return {code: 0};
    }
};