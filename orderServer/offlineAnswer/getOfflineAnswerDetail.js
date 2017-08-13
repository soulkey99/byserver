/**
 * Created by MengLei on 2015/8/28.
 */

var db = require('../../config').db;
var config = require('../../config');
var objectId = require('mongojs').ObjectId;
var eventproxy = require('eventproxy');
var offlineAnsItem = require('./utils/offlineAnsItem');
var log = require('./../../utils/log').order;

//获取离线问答的答案详情内容，param={answer_id: '', userID: ''}
module.exports = function(param, callback) {
    //调用统一的answerItem来组织返回结果
    offlineAnsItem(param, function(err, doc){
        if (err) {
            //handle error
            log.error('get offline answer error: ' + err.message);
            return callback(err);
        } else {
            if(doc.answer_id) {
                delete(doc.userInfo);
                delete(doc.summary);
                callback(null, doc);
            }else {
                log.error('answer_id: ' + param.answer_id + ' not exists.');
                callback(new Error('离线答案ID不存在！'));
            }
        }
    });
};

