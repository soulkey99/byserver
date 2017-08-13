/**
 * Created by MengLei on 2015/9/16.
 */

var db = require('../../../config').db;
var result = require('../../utils/result');
var objectId = require('mongojs').ObjectId;
var eventproxy = require('eventproxy');
var smsLog = require('../../../utils/log').sms;
var addBonus = require('../../../utils/addBonus');
var sendSMS = require('../../../utils/sendSMS');
var log = require('../../../utils/log').http;

//接受用户举报，举报类型type：order：即时订单，offlineTopic：离线问题，offlineAnswer：离线答案，offlineReply：离线回复，user：举报用户
//reportID：被举报的id，userID：用户id，time：举报时间。reportType：举报描述类型， reportDesc：举报描述
module.exports = function(req, res) {
    var item = {
        type: req.body.type,
        userID: req.body.userID,
        reportID: req.body.reportID,
        reportType: req.body.reportType,
        reportDesc: (req.body.reportDesc || ''),
        time: (new Date()).getTime(),
        handle: false,
        handleType: '',
        handleDesc: '',
        handleID: '',
        handleTime: 0
    };

    var ep = new eventproxy();
    ep.all('s_id', function(s_id){
        if(s_id){
            item.s_id = s_id;
        }
        db.report.insert(item, function(err, doc){
            if(err){
                log.error('report error: ' + err.message);
                result(res, {statusCode: 905, message: err.message});
            }else{
                log.error('report success, userID=' + req.body.userID);
                result(res, {statusCode: 900});

                //进行加黑名单的判断，如果10分钟之内有三个订单被举报，则加黑名单2小时，扣减200积分
                if(item.type == 'order') {
                    var t1 = new Date();
                    db.report.distinct('reportID', {type: 'order', time: {$gte: t1.getTime() - 600000}, s_id: s_id}, function (err2, doc2) {
                        if (err2) {
                            //
                        } else {
                            //console.log('report count: ' + doc2 + ', ' + JSON.stringify({type: 'order', time: {$gte: t1.getTime() - 600000}, s_id: s_id}));
                            if (doc2.length >= 3) {
                                //超过三单，加黑
                                addBlacklist(s_id);
                            }
                        }
                    });
                }
            }
        });
    });
    ep.fail(function(err){
        result(res, {statusCode: 905, message: err.message});
    });
    if(item.type == 'order'){
        //如果举报的是即时订单，那么记录订单对应的学生id
        var _id = new objectId();
        try{
            _id = new objectId(item.reportID);
        }catch (ex){
            //
        }
        db.orders.findOne({_id: _id}, {s_id: 1}, function(err, doc){
            if(err){
                ep.emit('error', err);
            }else{
                if(doc){
                    ep.emit('s_id', doc.s_id);
                }else{
                    ep.emit('s_id', null);
                }
            }
        });
    }else{
        ep.emit('s_id', null);
    }
};


function addBlacklist(userID) {
    var _id = new objectId(userID);
    db.users.findOne({_id: _id}, {phone: 1}, function (err, doc) {
        if (err) {
            //
        } else {
            if (doc) {
                //
                var phone = doc.phone;
                var t = new Date();
                t.setHours(t.getHours() + 2);
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
                    "desc": "被用户举报而自动封禁",
                    "delete": false,
                    "expire": t
                };
                //改变用户在线状态
                db.users.update({_id: _id}, {$set: {authSign: 'zzzzz', status: 'blacklist'}});
                //记录黑名单
                db.userConf.update({phonenum: phone}, {$set: userObj}, {upsert: true});
                //发送通知短信
                var result = '封禁2小时并扣减200积分';
                //执行扣分操作
                addBonus(userID, '9', {desc: '被用户举报', bonus: 200});
                var sendObj = {mobilePhoneNumber: phone, template: 'system', action: '被用户举报行为不当', result: result};
                sendSMS(sendObj, function () {
                    smsLog.trace('send cheat sms message to: ' + sendObj.mobilePhoneNumber + ', result: ' + result);
                });
            } else {
                //
            }
        }
    });
}
