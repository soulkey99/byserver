/**
 * Created by MengLei on 2015/8/11.
 */

var db = require('../../config').db;
var config = require('../../config');
var objectId = require('mongojs').ObjectId;
var hot = require("hot-ranking");
var proxy = require('../../common/proxy');
var offlineOperate = require('./utils/offlineOperate');
var log = require('./../../utils/log').order;

//支持、反对离线答案param={userID: '', answer_reply_id: '', answer_id: '', action: ''}，answer_reply_id和answer_id二选一，action可选，默认up，可传down
module.exports = function(param, callback) {
    var _id = '';
    var offlineOperParam = {userID: param.userID};  //记录离线操作用的参数
    if (param.answer_id) {
        proxy.OfflineAnswer.rateAnswer(param.userID, param.answer_id, param.action, function(err, doc){
            if(err){
                return callback(err);
            }
            if(!doc){
                return callback(new Error('离线问题答案ID不存在！'));
            }
            callback(null, doc);
        });
        return;
        offlineOperParam.operID = param.answer_id;
        //支持、反对离线答案
        try {
            _id = new objectId(param.answer_id);
        } catch (ex) {
            log.error('rate answer error: id ' + ex.message);
            callback({statusCode: 919, message: ex.message});
            return;
        }
        db.offlineAnswers.findOne({_id: new objectId(param.answer_id)}, function (err, doc) {
            if (err) {
                log.error('rate answer reply error: ' + err.message);
                callback({statusCode: 905, message: err.message});
            } else {
                if (doc) {
                    //
                    switch (param.action){
                        case 'up':
                        {
                            offlineOperParam.operType = 'upAnswer';
                            //如果是没有支持过，那么就是加入支持
                            if (doc.ups.indexOf(param.userID) < 0) {
                                doc.ups.push(param.userID);
                            }
                            //还要判断之前是否反对过，如果反对过，那么一定要取消反对
                            if (doc.downs.indexOf(param.userID) >= 0) {
                                doc.downs.splice(doc.downs.indexOf(param.userID), 1);
                            }
                        }
                            break;
                        case 'down':
                        {
                            offlineOperParam.operType = 'downAnswer';
                            //如果是没有反对过，那么就是加入反对
                            if (doc.downs.indexOf(param.userID) < 0) {
                                doc.downs.push(param.userID);
                            }
                            //还要判断之前是否支持过，如果支持过，那么一定要取消支持
                            if (doc.ups.indexOf(param.userID) >= 0) {
                                doc.ups.splice(doc.ups.indexOf(param.userID), 1);
                            }
                        }
                            break;
                        case 'cancelup':
                        {
                            offlineOperParam.operType = 'cancelupAnswer';
                            //如果是已经支持过了，那么取消支持
                            if (doc.ups.indexOf(param.userID) >= 0) {
                                doc.ups.splice(doc.ups.indexOf(param.userID), 1);
                            }
                        }
                            break;
                        case 'canceldown':
                        {
                            offlineOperParam.operType = 'canceldownAnswer';
                            //如果是已经反对过了，那么取消反对
                            if (doc.downs.indexOf(param.userID) >= 0) {
                                doc.downs.splice(doc.downs.indexOf(param.userID), 1);
                            }
                        }
                            break;
                        default :
                            offlineOperParam.operType = param.action;
                            break;
                    }
                    //更新点赞指数
                    doc.upIndex = parseFloat(hot(doc.ups.length, doc.downs.length, new Date(doc.updateTime)));
                    //保存结果
                    db.offlineAnswers.save(doc);
                    //返回，操作结果成功与否，当前支持数、反对数，用户是否支持、反对
                    callback({statusCode: 900, ups: doc.ups.length, downs: doc.downs.length, up: (doc.ups.indexOf(param.userID) >= 0), down: (doc.downs.indexOf(param.userID) >= 0)});
                    //记录操作信息
                    offlineOperate(offlineOperParam);
                } else {
                    //
                    log.error('rate answer reply error: id not exists.');
                    callback({statusCode: 914, message: 'rate answer reply error: id not exists.'});
                }
            }
        });
    } else if (param.answer_reply_id) {
        offlineOperParam.operID = param.answer_reply_id;
        //支持、反对离线答案的回复
        try {
            _id = new objectId(param.answer_reply_id);
        } catch (ex) {
            log.error('rate answer reply error: id ' + ex.message);
            callback({statusCode: 919, message: ex.message});
        }
        db.offlineAnsReply.findOne({_id: new objectId(param.answer_reply_id)}, function (err, doc) {
            if (err) {
                log.error('rate answer reply error: ' + err.message);
                callback({statusCode: 905, message: err.message});
            } else {
                if (doc) {
                    //
                    switch (param.action){
                        case 'up':
                        {
                            offlineOperParam.operType = 'upReply';
                            //如果是没有支持过，那么就是加入支持
                            if (doc.ups.indexOf(param.userID) < 0) {
                                doc.ups.push(param.userID);
                            }
                            //还要判断之前是否反对过，如果反对过，那么一定要取消反对
                            if (doc.downs.indexOf(param.userID) >= 0) {
                                doc.downs.splice(doc.downs.indexOf(param.userID), 1);
                            }
                        }
                            break;
                        case 'down':
                        {
                            offlineOperParam.operType = 'downReply';
                            //如果是没有反对过，那么就是加入反对
                            if (doc.downs.indexOf(param.userID) < 0) {
                                doc.downs.push(param.userID);
                            }
                            //还要判断之前是否支持过，如果支持过，那么一定要取消支持
                            if (doc.ups.indexOf(param.userID) >= 0) {
                                doc.ups.splice(doc.ups.indexOf(param.userID), 1);
                            }
                        }
                            break;
                        case 'cancelup':
                        {
                            offlineOperParam.operType = 'cancelupReply';
                            //如果是已经支持过了，那么取消支持
                            if (doc.ups.indexOf(param.userID) >= 0) {
                                doc.ups.splice(doc.ups.indexOf(param.userID), 1);
                            }
                        }
                            break;
                        case 'canceldown':
                        {
                            offlineOperParam.operType = 'canceldownReply';
                            //如果是已经反对过了，那么取消反对
                            if (doc.downs.indexOf(param.userID) >= 0) {
                                doc.downs.splice(doc.downs.indexOf(param.userID), 1);
                            }
                        }
                            break;
                        default :
                            offlineOperParam.operType = param.action;
                            break;
                    }
                    //更新点赞指数
                    doc.upIndex = parseFloat(hot(doc.ups.length, doc.downs.length, new Date(doc.createTime)));
                    //保存结果
                    db.offlineAnsReply.save(doc);
                    //返回，操作结果成功与否，当前支持数、反对数，用户是否支持、反对
                    callback({statusCode: 900, ups: doc.ups.length, downs: doc.downs.length, up: (doc.ups.indexOf(param.userID) >= 0), down: (doc.downs.indexOf(param.userID) >= 0)});
                    //记录操作信息
                    offlineOperate(offlineOperParam);
                } else {
                    //
                    log.error('rate answer reply error: id not exists.');
                    callback({statusCode: 915, message: 'rate answer reply error: id not exists.'});
                }
            }
        });
    } else {
        log.error('rate offline error: no answer id or reply id');
        callback({statusCode: 919, message: 'no answer_id or reply_id.'});
    }
};


