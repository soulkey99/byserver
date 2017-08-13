/**
 * Created by MengLei on 2015/8/26.
 */

var db = require('../../config').db;
var config = require('../../config');
var objectId = require('mongojs').ObjectId;
var offlineOperate = require('./utils/offlineOperate');
var hot = require("hot-ranking");
var log = require('./../../utils/log').order;
var rankData = require('./rank/data');

//关注话题,param={userID: '', off_id: '', action: ''}
module.exports = function(param, callback){
    //
    var _id = '';
    try{
        _id = new objectId(param.off_id);
    }catch(ex){
        log.error('watch topic error: id ' + ex.message);
        callback(ex);
        return;
    }
    db.offlineTopics.findOne({_id: _id}, function(err, doc){
        if(err){
            log.error('watch topic error: ' + err.message);
            callback(err);
        }else{
            if(doc){
                //topic存在
                if(param.action == 'un'){
                    //取消关注
                    db.topicWatch.findOne({off_id: param.off_id, userID: param.userID}, function(err2, doc2){
                        if(err2){
                            log.error('unwatch topic error: ' + err2.message);
                            callback(err2);
                        }else{
                            //由于该操作的目的就是取消关注，所以，如果关注表中有对应的记录就删除，没有对应的记录就不管了，反正关注的内容是不见了
                            if(doc2){
                                db.topicWatch.remove({_id: doc2._id});//移除关注的记录
                                //关注数减一，同时更新关注指数
                                db.offlineTopics.update({_id: _id}, {$inc: {watch: -1}, $set: {watchIndex: parseFloat(parseFloat(hot((doc.watch || 0) - 1, 0, new Date(doc.updateTime))))}});
                                //更新分日关注数
                                rankData({off_id: param.off_id, operate: 'watch', action: 'un'});
                            }
                            log.trace('unwatch topic success, off_id=' + param.off_id + ', userID=' + param.userID);
                            callback();
                            //记录操作
                            offlineOperate({userID: param.userID, operType: 'unwatchTopic', operID: param.off_id});
                        }
                    });
                }else{
                    //加入关注
                    db.topicWatch.findOne({off_id: param.off_id, userID: param.userID}, function(err2, doc2){
                        if(err2){
                            log.error('watch topic error: ' + err2.message);
                            callback(err2);
                        }else{
                            //由于该操作的目的就是加入关注，所以，如果关注表中有对应的记录就不管，没有对应的记录就加入一个，反正保证表中有关注记录就可以了
                            if(!doc2){
                                db.topicWatch.insert({off_id: param.off_id, userID: param.userID, time: (new Date()).getTime()});//增加一条关注记录
                                //关注数增加一，同时更新关注指数
                                db.offlineTopics.update({_id: _id}, {$inc: {watch: 1}, $set: {watchIndex: parseFloat(parseFloat(hot((doc.watch || 0) + 1, 0, new Date(doc.updateTime))))}});

                                //更新分日关注数
                                rankData({off_id: param.off_id, operate: 'watch'});
                            }
                            log.trace('watch topic success, off_id=' + param.off_id + ', userID=' + param.userID);
                            callback();
                            //记录操作
                            offlineOperate({userID: param.userID, operType: 'watchTopic', operID: param.off_id});
                        }
                    });
                }
            }else{
                //topic不存在，返回错误
                log.error('watch offline topic error: id not exists.');
                callback(new Error('关注离线问题失败，离线问题不存在！'));
            }
        }
    });
};


