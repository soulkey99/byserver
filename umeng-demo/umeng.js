/**
 * Created by MengLei on 2015/5/23.
 */

var UMENG = require('umeng');
var express = require('express');
var config = require('../config').umengConf;
var app = express();

app.get('/', function(req, res){
    res.end();
});


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


var str = require('crypto').randomBytes(4).toString('hex');


//umengT.androidPush({
//    type: 'unicast',
//    device_tokens: '',
//    display_type: 'notification',
//    body: {
//        ticker: 'test ticker notification',
//        title: 'test title notification',
//        text: 'test text notification',
//        custom: {
//            key: 'val'
//        },
//        play_vibrate: "true",
//        play_sound: "true",
//        play_lights: "true",
//        after_open: 'go_app'
//    },
//    production_mode: 'false'
//}).then(function (data) {
//    //console.log('success data: ' + JSON.stringify(data));
//    console.log('success: ' + JSON.stringify(data));
//})
//    .catch(function (err) {
//        //console.log('catch error: ' + err);
//        console.log('success: ' + JSON.stringify(err));
//    })
//    .finally(function () {
//        console.log('android finally.');
//    });


umengT.iosPush({
   "type":"unicast",
   "device_tokens":"",
   "payload":
   {
       "body":
       {
           "aps":
           {
               "alert":"正式环境,教师端，友盟推送测试！！！",
               "sound":"default"
           },
           action: 'message',
           o_id: '12345'
       }
   },
   "production_mode":"true"
})
   .then(function (data) {
       console.log('ios success: ' + JSON.stringify(data));
   })
   .catch(function (err) {
       console.log('error: ' + JSON.stringify(err));
   })
   .finally(function () {
       console.log('ios finally. str: ' + str);
   });
//return;

// umeng.androidPush({
//     "type": "unicast",
//     "device_tokens": "",
//     "display_type": "notification",
//     "body": {
//         "ticker": "CallCall教师，您有一条新消息！",
//         "title": "CallCall教师",
//         "text": "CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师CallCall教师",
//         "play_vibrate": "true",
//         "play_lights": "true",
//         "play_sound": "true",
//         "custom": {
//             "key": "value"
//         }
//     },
//     "production_mode": "false"
// })
//     .then(function (data) {
//         //console.log('success data: ' + JSON.stringify(data));
//         console.log('android success: ' + JSON.stringify(data));
//     })
//     .catch(function (err) {
//         //console.log('catch error: ' + err);
//         console.log('success: ' + JSON.stringify(err));
//     })
//     .finally(function () {
//         console.log('android finally.');
//     });