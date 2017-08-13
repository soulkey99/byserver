/**
 * Created by MengLei on 2015/12/10.
 */
"use strict";
const model = require('../../model');
const objectId = require('mongoose').Types.ObjectId;
const eventproxy = require('eventproxy');
const TopicCollect = model.TopicCollect;
const User = require('./../user/user');
const Topic = require('./offlineTopic');

/**
 * 根据userID和off_id查询用户是否收藏
 * Callback:
 * - err, 数据库异常
 * - doc, 是否收藏
 * @param {String} off_id 离线问题ID
 * @param {String} userID 用户userID
 * @param {Function} callback 回调函数
 */
exports.isCollect = function (off_id, userID, callback) {
    TopicCollect.findOne({off_id: off_id, userID: userID}, function (err, doc) {
        if (err) {
            callback(err);
        } else {
            callback(null, !!doc);
        }
    });
};

/**
 * 根据userID和off_id查询增加一条离线问题的收藏记录
 * Callback:
 * - err, 数据库异常
 * - doc, 是否关注
 * @param {String} id 离线问题ID
 * @param {String} userID 用户userID
 * @param {Function} callback 回调函数
 */
exports.addCollect = function (id, userID, callback) {
    Topic.getOfflineTopicByID(id, (err, topic)=> {
        if (err) {
            return callback(err);
        }
        if (!topic) {
            return callback();
        }
        TopicCollect.findOne({off_id: id, userID: userID}, (err, collect)=> {
            if (err) {
                return callback(err);
            }
            if (collect) { //如果收藏过，那么直接返回即可
                return callback(null, topic);
            }
            //没收藏过，那么增加收藏
            collect = new TopicCollect({off_id: id, userID: userID});
            topic.collect++;
            let ep = new eventproxy();
            ep.all('collect', 'topic', ()=> {
                return callback(null, topic);
            });
            ep.fail(callback);
            collect.save(ep.done('collect'));
            topic.save(ep.done('topic'));
        });
    });
};

/**
 * 根据userID和off_id查询删除一条离线问题的收藏记录
 * Callback:
 * - err, 数据库异常
 * - doc, 是否关注
 * @param {String} id 离线问题ID
 * @param {String} userID 用户userID
 * @param {Function} callback 回调函数
 */
exports.removeCollect = function (id, userID, callback) {
    Topic.getOfflineTopicByID(id, (err, topic)=> {
        if (err) {
            return callback(err);
        }
        if (!topic) {
            return callback();
        }
        TopicCollect.findOne({off_id: id, userID: userID}, (err, collect)=> {
            if (err) {
                return callback(err);
            }
            if (!collect) {   //如果没收藏过，那么直接返回topic
                return callback(null, topic);
            }
            //如果返回过，那么收藏数减一，移除收藏，再返回结果
            topic.collect--;
            let ep = new eventproxy();
            ep.all('collect', 'topic', ()=> {
                return callback(null, topic);
            });
            topic.save(ep.done('topic'));
            collect.remove(ep.done('collect'));
        });
    });
};

/**
 * 根据userID获取收藏的离线问题列表（支持分页）
 * Callback:
 * - err, 数据库异常
 * - doc, 问题列表
 * @param {Object} param = {userID: '', u_id: '', startPos: '', pageSize: ''}
 * @param {Function} callback 回调函数
 */
exports.getCollectedTopics = function (param, callback) {
    let start = Number.parseInt(param.startPos || '1') - 1;
    let count = Number.parseInt(param.pageSize || '10');
    TopicCollect.find({userID: param.u_id || param.userID}).sort({time: -1}).skip((start < 1 ? 1 : start) - 1).limit(count).exec(function (err, collects) {
        if (err) {
            return callback(err);
        }
        if (collects.length == 0) {
            return callback(null, []);
        }
        let off_ids = [];
        for (let i = 0; i < collects.length; i++) {
            off_ids.push(collects[i].off_id);
        }
        model.OfflineTopic.find({_id: {$in: off_ids}}, (err, topics)=> {
            if (err) {
                return callback(err);
            }
            for (let i = 0; i < collects.length; i++) {
                for (let j = 0; j < topics.length; j++) {
                    if (collects[i].off_id == topics[j].off_id) {
                        topics[j].time = collects[i].time;
                    }
                }
            }
            topics.sort((a, b)=>b.time - a.time);
            Topic.topicList(topics, param.userID, callback);
        });
    });
};
