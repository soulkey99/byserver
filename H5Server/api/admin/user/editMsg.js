/**
 * Created by MengLei on 2015/11/12.
 */
var db = require('./../../../../config').db;
var config = require('./../../../../config');
var objectId = require('mongojs').ObjectId;
var result = require('./../../../utils/result');
var log = require('../../../../utils/log').h5;
var UMENG = require('umeng');


module.exports = function(req, res) {
    var _id = new objectId();
    if (req.body.msgid) {
        //如果传过来msg id，那么就认为是编辑，否则就认为是新增
        try{
            _id = new objectId(req.body.msgid);
        }catch (ex){
            result(res, {statusCode: 919, message: ex.message});
            return;
        }

        var setObj = {};
        if (req.body.display != undefined) {
            setObj['display'] = req.body.display == 'true';
            setObj['time'] = Date.now();
        }
        if (req.body.topic != undefined) {
            setObj['detail.topic'] = req.body.topic;
        }
        if (req.body.content != undefined) {
            setObj['detail.content'] = req.body.content;
        }
        if (req.body.link != undefined) {
            setObj['detail.link'] = req.body.link;
        }
        db.msgbox.update({_id: _id}, {$set: setObj}, function(err){
            if(err){
                result(res, {statusCode: 905, message: err.message});
            }else{
                result(res, {statusCode: 900});
            }
        });
        if(setObj['display'] === true){
            //sendUmeng(item.type);
        }
    } else {
        var item = {
            _id: _id,
            from: 'system',
            type: req.body.type || 'broadcast',
            detail: {
                type: 'link'
            },
            time: (new Date()).getTime(),
            delete: false,
            display: (req.body.display == 'true'),
            read: false
        };
        if (req.body.time) {
            item.time = parseFloat(req.body.time);
        }
        if (req.body.detailType) {
            item.detail.type = req.body.detailType;
        }
        switch (item.detail.type) {
            case 'link':
            {
                item.detail.topic = req.body.topic;
                item.detail.content = req.body.content;
                item.detail.link = req.body.link;
            }
                break;
        }
        db.msgbox.insert(item, function (err) {
            if (err) {
                result(res, {statusCode: 905, message: err.message});
            } else {
                result(res, {statusCode: 900});
            }
        });
        if (item.display === true) {
            //sendUmeng(item.type);
        }
    }
};


function sendUmeng(type){
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

    if(type == 'broadcast' || type == 'broadcast_t'){
        //推送教师端
        umeng_t.iosPush({
                type: 'broadcast',
                payload: {
                    body: {
                        action: 'notice',
                        aps: {
                            alert: '您收到了一条新的消息！',
                            sound: 'default'
                        }
                    }
                },
                production_mode: config.production_mode
            })
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
        umeng_t.androidPush({
                type: 'broadcast',
                display_type: 'notification',
                body: {
                    ticker: 'CallCall教师-教师端，您有一条新消息！',
                    title: 'CallCall教师-教师端',
                    text: '您收到了一条新的消息！',
                    play_vibrate: 'true',
                    play_lights: 'true',
                    play_sound: 'true',
                    after_open: 'go_app',
                    custom: {
                        key: 'value'
                    }
                },
                production_mode: config.production_mode
            })
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

    if(type == 'broadcast' || type == 'broadcast_s'){
        //推送学生端
        umeng_s.iosPush({
                type: 'broadcast',
                payload: {
                    body: {
                        action: 'notice',
                        aps: {
                            alert: '您收到了一条新的消息！',
                            sound: 'default'
                        }
                    }
                },
                production_mode: config.production_mode
            })
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
        umeng_s.androidPush({
                type: 'broadcast',
                display_type: 'notification',
                body: {
                    ticker: 'CallCall教师，您有一条新消息！',
                    title: 'CallCall教师',
                    text: '您收到了一条新的消息！',
                    play_vibrate: 'true',
                    play_lights: 'true',
                    play_sound: 'true',
                    after_open: 'go_app',
                    custom: {
                        key: 'value'
                    }
                },
                production_mode: config.production_mode
            })
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
}
