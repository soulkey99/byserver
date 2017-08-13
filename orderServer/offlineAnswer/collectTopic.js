/**
 * Created by MengLei on 2015/8/24.
 */

var db = require('../../config').db;
var config = require('../../config');
var objectId = require('mongojs').ObjectId;
var offlineOperate = require('./utils/offlineOperate');
var hot = require("hot-ranking");
var log = require('./../../utils/log').order;
var rankData = require('./rank/data');

//收藏话题,param={userID: '', off_id: '', action: ''}
module.exports = function(param, callback){
    //
    var _id = '';
    try{
        _id = new objectId(param.off_id);
    }catch(ex){
        log.error('collect topic error: id ' + ex.message);
        return callback(ex);
    }
    db.offlineTopics.findOne({_id: _id}, function(err, doc){
        if(err){
            log.error('collect topic error: ' + err.message);
            return callback(err);
        }else{
            if(doc){
                //topic存在
                if(param.action == 'un'){
                    //取消收藏
                    db.topicCollect.findOne({off_id: param.off_id, userID: param.userID}, function(err2, doc2){
                        if(err2){
                            log.error('uncollect topic error: ' + err2.message);
                            return callback(err2);
                        }else{
                            //由于该操作的目的就是取消收藏，所以，如果收藏表中有对应的记录就删除，没有对应的记录就不管了，反正收藏的内容是不见了
                            if(doc2){
                                db.topicCollect.remove({_id: doc2._id});//移除收藏的记录
                                //收藏数减一，同时更新收藏指数
                                db.offlineTopics.update({_id: _id}, {$inc: {collect: -1}, $set: {collectIndex: parseFloat(parseFloat(hot((doc.collect || 0) - 1, 0, new Date(doc.updateTime))))}});
                                //更新分日收藏数
                                rankData({off_id: param.off_id, operate: 'collect', action: 'un'});
                            }
                            log.trace('uncollect topic success, off_id=' + param.off_id + ', userID=' + param.userID);
                            callback();
                            //记录操作
                            offlineOperate({userID: param.userID, operType: 'uncollectTopic', operID: param.off_id});
                        }
                    });
                }else{
                    //加入收藏
                    db.topicCollect.findOne({off_id: param.off_id, userID: param.userID}, function(err2, doc2){
                        if(err2){
                            log.error('collect topic error: ' + err2.message);
                            return callback(err2);
                        }else{
                            //由于该操作的目的就是加入收藏，所以，如果收藏表中有对应的记录就不管，没有对应的记录就加入一个，反正保证表中有收藏记录就可以了
                            if(!doc2){
                                db.topicCollect.insert({off_id: param.off_id, userID: param.userID, time: (new Date()).getTime()});//增加一条收藏记录
                                //收藏数增加一，同时更新收藏指数
                                db.offlineTopics.update({_id: _id}, {$inc: {collect: 1}, $set: {collectIndex: parseFloat(parseFloat(hot((doc.collect || 0) + 1, 0, new Date(doc.updateTime))))}});

                                //更新分日收藏数
                                rankData({off_id: param.off_id, operate: 'collect'});
                            }
                            log.trace('collect topic success, off_id=' + param.off_id + ', userID=' + param.userID);
                            callback();
                            //记录操作
                            offlineOperate({userID: param.userID, operType: 'collectTopic', operID: param.off_id});
                        }
                    });
                }
            }else{
                //topic不存在，返回错误
                log.error('collect offline topic error: id not exists.');
                return callback(new Error('离线问题ID不存在！'));
            }
        }
    });
};

