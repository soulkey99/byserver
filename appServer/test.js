/**
 * Created by MengLei on 2015/2/28.
 */

var db = require('../config').db;
var BagPipe = require('bagpipe');
var objectId = require('mongojs').ObjectId;
var UMENG = require('umeng');
var config = require('../config').umengConf;

var umeng = new UMENG({
    appKey: config.and_key_s,
    app_master_secret: config.and_secret_s,
    ios_appKey: config.ios_key_s,
    ios_app_master_secret: config.ios_secret_s
});

var umengT = new UMENG({
    appKey: config.and_key_t,
    app_master_secret: config.and_secret_t,
    ios_appKey: config.ios_key_t,
    ios_app_master_secret: config.ios_secret_t
});
var bagPipe = new BagPipe(100);

var cnt = 0;

db.msgbox.find({time: {$gte: 1444883107354}}, {to: 1}, function(err, doc){
    if(err){
        //
    }else{
        for(var i=0; i<doc.length; i++){
            bagPipe.push(async, {userID: doc[i].to}, function(){
                cnt ++;
                console.log('count: ' + cnt);
            });
        }
    }
});

function async(param, callback){
    var _id = new objectId();
    try{
        _id = new objectId(param.userID);
    }catch(ex){
        callback(ex);
    }
    db.pushTokens.findOne({_id: _id}, function(err, doc){
        if(err){
            callback(err);
        }else{
            if(doc){
                if(doc.platform == 'ios'){
                    if(doc.userType == 'teacher'){
                        umengT_ios(doc.token, callback);
                    }else{
                        umeng_ios(doc.token, callback);
                    }
                }else{
                    if(doc.userType == 'teacher'){
                        umengT_android(doc.token, callback);
                    }else{
                        umeng_android(doc.token, callback);
                    }
                }
            }else{
                console.log('null, null');
                callback(null, null);
            }
        }
    })
}

function umeng_ios(token, callback) {
    umeng.iosPush({
        "type": "unicast",
        "device_tokens": token,
        "payload": {
            "body": {
                "aps": {
                    "alert": "尊敬的CallCall教师用户，您收到了一条新的通知消息，请登陆最新版客户端进行查看。",
                    "sound": "default"
                },
                action: 'alert'
            }
        },
        "production_mode": "true"
    })
        .then(function (data) {
            //console.log('ios_s success: ' + JSON.stringify(data));
        })
        .catch(function (err) {
            //console.log('ios_s error: ' + JSON.stringify(err));
        })
        .finally(function () {
            console.log('ios_s finally.');
            callback();
        });
}

function umengT_ios(token, callback) {
    umengT.iosPush({
        "type": "unicast",
        "device_tokens": token,
        "payload": {
            "body": {
                "aps": {
                    "alert": "尊敬的CallCall教师用户，您收到了一条新的通知消息，请登陆最新版客户端进行查看。",
                    "sound": "default"
                },
                action: 'alert'
            }
        },
        "production_mode": "true"
    })
        .then(function (data) {
            //console.log('ios_t success: ' + JSON.stringify(data));
        })
        .catch(function (err) {
            //console.log('ios_t error: ' + JSON.stringify(err));
        })
        .finally(function () {
            console.log('ios_t finally.');
            callback();
        });
}

function umeng_android(token, callback) {
    umeng.androidPush({
        "type": "unicast",
        "device_tokens": token,
        "display_type": "notification",
        "body": {
            "ticker": "CallCall教师-教师端，您有一条新消息！",
            "title": "CallCall教师-教师端",
            "text": "您收到了一条新的通知消息，请登陆最新版客户端进行查看。",
            "play_vibrate": "true",
            "play_lights": "true",
            "play_sound": "true",
            "custom": {
                "key": "value"
            }
        },
        "production_mode": "false"
    })
        .then(function (data) {
            console.log('android_s success: ' + JSON.stringify(data));
        })
        .catch(function (err) {
            console.log('android_s success: ' + JSON.stringify(err));
        })
        .finally(function () {
            console.log('android_s finally.');
            callback();
        });
}

function umengT_android(token, callback) {
    umengT.androidPush({
        "type": "unicast",
        "device_tokens": token,
        "display_type": "notification",
        "body": {
            "ticker": "CallCall教师-教师端，您有一条新消息！",
            "title": "CallCall教师-教师端",
            "text": "您收到了一条新的通知消息，请登陆最新版客户端进行查看。",
            "play_vibrate": "true",
            "play_lights": "true",
            "play_sound": "true",
            "custom": {
                "key": "value"
            }
        },
        "production_mode": "true"
    })
        .then(function (data) {
            //console.log('android_t success: ' + JSON.stringify(data));
        })
        .catch(function (err) {
            //console.log('android_t success: ' + JSON.stringify(err));
        })
        .finally(function () {
            console.log('android_t finally.');
            callback();
        });
}
