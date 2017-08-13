/**
 * Created by MengLei on 2015/8/11.
 */

var db = require('../../config').db;
var config = require('../../config');
var objectId = require('mongojs').ObjectId;
var hot = require("hot-ranking");
var log = require('./../../utils/log').order;
var offlineTopicItem = require('./utils/offlineTopicItem');
var dnode = require('../utils/dnodeClient');
var eventproxy = require('eventproxy');
var rankData = require('./rank/data');


//获取离线问题详情param={off_id: '', userID: ''}
module.exports = function(param, callback) {
    offlineTopicItem(param, function(err, doc){
        if(err){
            log.error('get offline topic detail error: ' + err.message);
            return callback(err);
        }else{
            if(doc.off_id) {
                //分日点击数增加一
                rankData({off_id: param.off_id, operate: 'visit'});
                //点击数增加一，同时计算新的点击指数
                db.offlineTopics.update({_id: new objectId(param.off_id)}, {
                    $inc: {visit: 1},
                    $set: {visitIndex: parseFloat(parseFloat(hot((doc.visit || 0) + 1, 0, new Date(doc.updateTime))))}
                });
                log.error('get offline topic detail success.');
                delete(doc.userInfo);
                return callback(null, doc);
            } else {
                //off_id不存在
                log.error('get offline topic detail error: not exists.');
                return callback(new Error('离线问题ID不存在！'));
            }
        }
    });
};