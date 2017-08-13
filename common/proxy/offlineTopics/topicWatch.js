/**
 * Created by MengLei on 2015/12/10.
 */
"use strict";
const model = require('../../model');
const objectId = require('mongoose').Types.ObjectId;
const eventproxy = require('eventproxy');
const TopicWatch = model.TopicWatch;
const User = require('./../user/user');
const Topic = require('./offlineTopic');

/**
 * 根据userID和off_id查询用户是否关注
 * Callback:
 * - err, 数据库异常
 * - doc, 是否关注
 * @param {String} off_id 离线问题ID
 * @param {String} userID 用户userID
 * @param {Function} callback 回调函数
 */
exports.isWatch = function(off_id, userID, callback){
    TopicWatch.findOne({off_id: off_id, userID: userID}, function(err,doc){
        if(err){
            callback(err);
        }else{
            callback(null, !!doc);
        }
    });
};

/**
 * 根据userID和off_id查询增加一条关注记录
 * Callback:
 * - err, 数据库异常
 * - doc, 是否关注
 * @param {String} off_id 离线问题ID
 * @param {String} userID 用户userID
 * @param {Function} callback 回调函数
 */
exports.addWatch = function(off_id, userID, callback){
    Topic.getOfflineTopicByID(off_id, function(err, doc){
        if(err){
            return callback(err);
        }
        if(!doc){   //topic不存在，返回空
            callback();
        }
        TopicWatch.findOne({off_id: off_id, userID: userID}, function(err2, doc2){
            if(err2){
                callback(err2);
            }else{
                if(doc2){
                    //已经关注过，直接返回成功就可以了，同时返回topic
                    return callback(null, doc);
                }
                //没有关注过，那么关注数加一，加关注，然后再返回结果
                var watch = new TopicWatch({off_id: off_id, userID: userID});
                doc.watch ++;
                var ep = new eventproxy();
                ep.all('watch', 'topic', function(){
                    return callback(null, doc);
                });
                ep.fail(callback);
                watch.save(ep.done('watch'));
                doc.save(ep.done('topic'));
            }
        });
    });
};

/**
 * 根据userID和off_id查询删除一条关注记录
 * Callback:
 * - err, 数据库异常
 * - doc, 是否关注
 * @param {String} off_id 离线问题ID
 * @param {String} userID 用户userID
 * @param {Function} callback 回调函数
 */
exports.removeWatch = function(off_id, userID, callback){
    Topic.getOfflineTopicByID(off_id, function(err, doc){
        if(err){
            return callback(err);
        }
        if(!doc){   //topic不存在，返回空
            callback();
        }
        TopicWatch.findOne({off_id: off_id, userID: userID}, function(err2, doc2){
            if(err2){
                callback(err2);
            }else{
                if(!doc2){
                    //本来就没有关注过，直接返回成功就可以了，同时返回topic
                    return callback(null, doc);
                }
                //曾经关注过，那么关注数减一，取消关注，然后再返回结果
                doc.watch --;
                var ep = new eventproxy();
                ep.all('watch', 'topic', function(){
                    return callback(null, doc);
                });
                ep.fail(callback);
                doc2.remove(ep.done('watch'));
                doc.save(ep.done('topic'));
            }
        });
    });
};

/**
 * 根据userID获取关注的离线问题列表（支持分页）
 * Callback:
 * - err, 数据库异常
 * - doc, 问题列表
 * @param {Object} param = {userID: '', u_id: '', startPos: '', pageSize: ''}
 * @param {Function} callback 回调函数
 */
exports.getWatchedTopics = function(param, callback){
    let start = Number.parseInt(param.startPos || '1') - 1;
    let count = Number.parseInt(param.pageSize || '10');
    TopicWatch.find({userID: param.u_id || param.userID}).sort({time: -1}).skip((start < 1 ? 1 : start) - 1).limit(count).exec(function (err, watches) {
        if (err) {
            return callback(err);
        }
        if (watches.length == 0) {
            return callback(null, []);
        }
        let off_ids = [];
        for (let i = 0; i < watches.length; i++) {
            off_ids.push(watches[i].off_id);
        }
        model.OfflineTopic.find({_id: {$in: off_ids}}, (err, topics)=> {
            if (err) {
                return callback(err);
            }
            for (let i = 0; i < watches.length; i++) {
                for (let j = 0; j < topics.length; j++) {
                    if (watches[i].off_id == topics[j].off_id) {
                        topics[j].time = watches[i].time;
                    }
                }
            }
            topics.sort((a, b)=>b.time - a.time);
            Topic.topicList(topics, param.userID, callback);
        });
    });
};
