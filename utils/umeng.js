/**
 * Created by MengLei on 2015/7/23.
 */

var UMENG = require('umeng');
var objectId = require('mongojs').ObjectId;
var config = require('./../config');
var log = require('./../utils/log').umeng;
var converTime = require('./convertTime');


var umeng_s = new UMENG({
    appKey: config.umengConf.and_key_s,
    app_master_secret: config.umengConf.and_secret_s,
    ios_appKey: config.umengConf.ios_key_s,
    ios_app_master_secret: config.umengConf.ios_secret_s
});

var umeng_t = new UMENG({
    appKey: config.umengConf.and_key_t,
    app_master_secret: config.umengConf.and_secret_t,
    ios_appKey: config.umengConf.ios_key_t,
    ios_app_master_secret: config.umengConf.ios_secret_t
});


//友盟推送，dest：目标user id， content：推送通知内容
//如果是订单，那么type=order，text='您有一条订单/您的订单被抢/您的订单完成', detail={o_id: ""}
//如果是通知，那么type=notice，text='通知内容'
//如果是聊天，那么type=msg，text='聊天内容'
//content: {text: '',type: '', detail: {}}
module.exports = function(dest, content){
    if(!content.type){
        //log.error('push type is empty, return false;');
        return;
    }

    var _id = '';
    try {
        _id = new objectId(dest);
    } catch (ex) {
        log.error('umeng push dest error: ' + dest);
    }
    config.db.pushTokens.findOne({_id: _id}, function (err, doc) {
        if (err) {
            //handle error
            log.error('find token error: ' + err.message);
        } else {
            if (doc && doc.token) {
                var pushObj = {text: content.text, type: content.type, detail: content.detail};
                pushObj.token = doc.token;
                pushObj.userType = doc.userType;
                pushObj.platform = doc.platform;
                log.trace('umeng push to uid: ' + dest + ', platform: ' + doc.platform + ', device_token: ' + doc.token);
                //console.log('push');
                umengPush(pushObj);
            } else {
                //uid not connected
                //log.error('token of uid not found. uid: ' + dest);
            }
        }
    });
};


//调用uemng推送，发送消息
function umengPush(info) {

    var pushObj = {token: info.token, type: info.type, userType: info.userType, detail: info.detail};
    if (info.userType = 'teacher') {
        pushObj.ticker = 'CallCall教师-教师端，您有一条新消息！';
        pushObj.title = 'CallCall教师-教师端';
    } else {
        pushObj.ticker = 'CallCall教师，您有一条新消息！';
        pushObj.title = 'CallCall教师';
    }

    pushObj.text = info.text;

    log.trace('push: ' + JSON.stringify(info));

    if (info.platform.toLowerCase() == 'ios') {
        //ios push
        iosPush(pushObj);
    } else {
        //android push
        if(info.type == 'msg'){
            //如果是聊天，那么需要查年级学科
            config.db.orders.findOne({_id: new objectId(info.detail.o_id)}, {subject: 1, grade: 1}, function(err, doc){
                if(err){
                    //handle error
                }else{
                    pushObj.detail.grade = doc.grade;
                    pushObj.detail.subject = doc.subject;
                    androidPush(pushObj);
                }
            });
        }else{
            androidPush(pushObj);
        }
    }
}

function iosPush(info){

    //ios推送
    var umeng = {};
    if(info.userType == 'teacher'){
        log.trace('push user type: teacher.');
        umeng = umeng_t;
    }else{
        log.trace('push user type: student.');
        umeng = umeng_s;
    }
    var body = {};

    if(!info.detail){
        log.error('ios push detail null.' + JSON.stringify(info));
    }

    switch(info.type){
        case 'order':
            body.action = 'order';
            body.status = info.detail.status;
            body.o_id = info.detail.o_id;
            break;
        case 'msg':
            body.action = 'message';
            body.oid = info.detail.o_id;
            break;
        case 'web':
            body.action = 'web';
            body.url = info.detail.url;
            break;
        case 'update':
            body.action = 'update';
            break;
        case 'notice':
            body.action = 'notice';
            break;
        default :
            break;
    }

    body.aps = {
        alert: info.text,
        sound: 'default'
    };

    var iosPush = {
        type: 'unicast',
        device_tokens: info.token,
        payload: {
            body: body
        },
        production_mode: config.production_mode
    };

    //ios推送
    umeng.iosPush(iosPush)
        .then(function (data) {
            //success
            log.trace('umeng push ios: ' + JSON.stringify(data));
        })
        .catch(function (err) {
            //exception
        })
        .finally(function () {
            //finally
            //console.log('ios finally.');
        });
}


function androidPush(info) {

    var umeng = {};
    if (info.userType = 'teacher') {
        log.trace('android push user type: teacher.');
        umeng = umeng_t;
        act_prefix = 'com.soulkey.callcallTeacher.activity.';
    } else {
        log.trace('android push user type: student.');
        umeng = umeng_s;
    }

    //android推送

    //info.type = 'abc';
    if (!info.detail) {
        log.error('android push detail null.' + JSON.stringify(info));
    }
    var body = {
        ticker: info.ticker,
        title: info.title,
        text: info.text,
        play_vibrate: 'true',
        play_lights: 'true',
        play_sound: 'true',
        custom: {
            key: 'value'
        }
    };
    var extra = {};

    var policy = {};

    switch (info.type) {
        case 'order':
        {
            body.after_open = 'go_activity';
            extra.status = info.detail.status;
            extra.o_id = info.detail.o_id;
            if (info.userType == 'teacher') {
                if (info.detail.status == 'received') {
                    body.activity = 'com.soulkey.callcallTeacher.activity.QAActivity_';
                } else {
                    body.after_open = 'go_app';
                    //body.activity = 'com.soulkey.callcallTeacher.activity.MainActivity_';
                    policy.expire_time = converTime((new Date()).getTime() + 600000);
                }
            } else {
                if (info.detail.status == 'received') {
                    body.activity = 'com.soulkey.callcall.activity.AskActivity_';
                } else {
                    body.afbter_open = 'go_app';
                    //body.activity = 'com.soulkey.callcall.activity.MainActivity_';
                }
            }
        }
            break;
        case 'msg':
        {
            body.after_open = 'go_activity';
            extra.orderId = info.detail.o_id;
            extra.view_mode = '1005';
            extra.subject_result = info.detail.subject;
            extra.grade_result = info.detail.grade;
            if (info.userType == 'teacher') {
                body.activity = 'com.soulkey.callcallTeacher.activity.QAActivity_';
            } else {
                body.activity = 'com.soulkey.callcall.activity.AskActivity_';
            }
        }
            break;
        case 'web':
            body.after_open = 'go_url';
            body.url = info.detail.url;
            break;
        case 'update':
            body.after_open = 'go_app';
            break;
        case 'notice':
            body.after_open = 'go_app';
            break;
        default :
            break;
    }

    var androidPush = {
        type: 'unicast',
        device_tokens: info.token,
        display_type: 'notification',
        body: body,
        extra: extra,
        policy: policy,
        production_mode: config.production_mode
    };

    log.trace('android push object: ' + JSON.stringify(androidPush));
    //android推送
    umeng.androidPush(androidPush)
        .then(function (data) {
            //success
            log.trace('umeng push android: ' + JSON.stringify(data));
        })
        .catch(function (err) {
            //exception
        })
        .finally(function () {
            //finally
            //console.log('android finally.');
        });
}