/**
 * Created by MengLei on 2015/10/19.
 */

var db = require('../../config').db;
var objectId = require('mongojs').ObjectId;
var log = require('./../../utils/log').order;
var dbLog = require('./../../utils/log').dbLog;
var smsLog = require('./../../utils/log').sms;
var addBonus = require('./../../utils/addBonus');
var sendSMS = require('./../../utils/sendSMS');

//反刷单，在用户下单之前，首先判断一下十分钟内的下单数量，以及订单持续时间
//config = {time: 'a', finished: 'b', duration: 'c', abandon: 'd', sms: 'e', bonus: 'f', canceled: 'g'}，策略： a分钟内，完成了b单，每单持续时间小于c秒，则判定为刷单，禁止登陆d小时，根据e判断是否发送短信通知，同时扣减f积分，或者有g单取消的订单
module.exports = function(userID) {
    //
    log.trace('check cheat userID: ' + userID);
    db.byConfig.findOne({_id: 'antiCheat'}, function (err, config) {
        if (err) {
            //
        } else {
            //
            if(!config){
                //如果没有config，那么取默认值，10分钟内有10单小于10秒的订单，或者有50单取消的订单，则判定为刷单，封禁1小时，同时发短信提醒并扣减100积分
                config = {time: 10, finished: 10, canceled: 50, duration: 10, abandon: 1, sms: true, bonus: 100, total: 30};
            }
            //console.log('check cheat: ' + JSON.stringify(config));
            var t1 = new Date();
            t1.setMinutes(t1.getMinutes() - config.time);
            var query = {s_id: userID, create_time: {$gte: t1.getTime()}};
            //console.log('check cheat query: ' + JSON.stringify(query));
            db.orders.find(query, {create_time: 1, start_time: 1, end_time: 1, status: 1}, function (err, doc) {
                if (err) {
                    //
                } else {
                    var finished = 0;
                    var canceled = 0;
                    var total = doc.length;
                    //console.log('doc: ' + JSON.stringify(doc));
                    for (var i = 0; i < doc.length; i++) {
                        if ((doc[i].status == 'finished') && ((doc[i].end_time - doc[i].start_time) / 1000 < config.duration)) {
                            finished++;
                        } else if (doc[i].status == 'canceled') {
                            canceled++;
                        }
                    }
                    log.trace('userID; ' + userID + ', finished: ' + finished + ', canceled: ' + canceled + ', total: ' + total);
                    if(t1.getHours() < 6 && t1.getHours() >= 1) {
                        finished = 0;   //对于凌晨的订单，不判断持续时间，只要在这段时间内完成订单数超过这么多，就算刷单
                        for(var j=0; j<doc.length; j++){
                            if(doc[j].status == 'finished'){
                                finished ++;
                            }
                        }
                        //扣减1000积分并封禁12小时
                        config.bonus = 1000;
                        config.abandon = 12;
                    }
                    //console.log('finished: ' + finished + ', canceled: ' + canceled);
                    if ((finished >= config.finished) || (canceled >= config.canceled) || (total >= config.total)) {
                        //判定为刷单，封禁用户
                        console.log('add blacklist, userID: ' + userID + ', bonus: ' + config.bonus + ', abandon: ' + config.abandon + '.');
                        dbLog(userID, 'addBlacklist', {finished: finished, canceled: canceled, total: total, bonus: config.bonus, abandon: config.abandon, time: config.time});
                        addBlacklist(userID, config);
                    } else {
                        //不是刷单
                    }
                }
            });
        }
    });
};


function addBlacklist(userID, config) {
    var _id = new objectId(userID);
    db.users.findOne({_id: _id}, {phone: 1}, function (err, doc) {
        if (err) {
            //
        } else {
            //统计该账号2016-01-05之后的最近7天被加黑名单的次数，然后对封号惩罚进行翻倍，乘以系数2^n
            //这条规则是20160106添加的
            db.dbLog.count({userID: userID, action: 'addBlacklist', t: {$gte: Math.max(new Date('2016-01-05 08:00:00').getTime(), Date.now() - 604800000)}}, function(err2, doc2){
                if(err2){
                    //
                }else{
                    var times = Math.pow(2, doc2);
                    config.abandon = times * config.abandon;
                    config.bonus = times * config.bonus;
                }
                if (doc) {
                    //
                    var phone = doc.phone;
                    var t = new Date();
                    t.setHours(t.getHours() + config.abandon);
                    var userObj = {
                        "phonenum": phone,
                        "type": "blacklist",
                        "smscode": "zzzzzz",
                        "status": "blacklist",
                        "grabConf": {
                            "posibility": 0.1,
                            "status": "normal"
                        },
                        "name": "",
                        "desc": "防刷单机制自动封禁",
                        "delete": false,
                        "expire": t
                    };
                    //改变用户在线状态
                    db.users.update({_id: _id}, {$set: {authSign: 'zzzzz', status: 'blacklist'}});
                    //记录黑名单
                    db.userConf.update({phonenum: phone}, {$set: userObj}, {upsert: true});
                    //发送通知短信
                    if (config.sms) {
                        var result = '';
                        if (config.abandon > 0) {
                            result += ('封禁' + config.abandon + '小时');
                        }
                        if (config.bonus > 0) {
                            if (result) {
                                result += '并';
                            }
                            result += ('扣减' + config.bonus + '积分');
                            //执行扣分操作
                            addBonus(userID, '9', {desc: '系统检测到刷单', bonus: config.bonus});
                        }
                        var sendObj = {mobilePhoneNumber: phone, template: 'system', action: '疑似刷单', result: result};
                        sendSMS(sendObj, function () {
                            smsLog.trace('send cheat sms message to: ' + sendObj.mobilePhoneNumber + ', result: ' + result);
                        });
                    }
                } else {
                    //
                }
            });
        }
    });
}
