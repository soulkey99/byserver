/**
 * Created by MengLei on 2015/12/10.
 */
"use strict";
const model = require('../../model');
const objectId = require('mongoose').Types.ObjectId;
const eventproxy = require('eventproxy');
const AnswerCollect = model.AnswerCollect;
const User = require('../user/user');
const OfflineAnswer = require('./offlineAnswer');

/**
 * 根据userID和answer_id查询用户是否收藏
 * Callback:
 * - err, 数据库异常
 * - doc, 是否收藏
 * @param {String} answer_id 离线答案ID
 * @param {String} userID 用户userID
 * @param {Function} callback 回调函数
 */
exports.isCollect = function (answer_id, userID, callback) {
    AnswerCollect.findOne({answer_id: answer_id, userID: userID}, function (err, doc) {
        if (err) {
            callback(err);
        } else {
            callback(null, !!doc);
        }
    });
};

/**
 * 根据userID和answer_id查询增加一条离线答案的收藏记录
 * Callback:
 * - err, 数据库异常
 * - doc, 是否关注
 * @param {String} id 离线答案ID
 * @param {String} userID 用户userID
 * @param {Function} callback 回调函数
 */
exports.addCollect = function (id, userID, callback) {
    OfflineAnswer.getOfflineAnswerByID(id, function (err, doc) {
        if (err) {
            return callback(err);
        }
        if (!doc) {   //离线答案不存在，返回空
            return callback();
        }
        AnswerCollect.findOne({answer_id: id, userID: userID}, function (err2, doc2) {
            if (err2) {
                callback(err2);
            } else {
                if (doc2) {
                    //已经收藏过，直接返回成功就可以了，同时返回answer
                    return callback(null, doc);
                }
                //没有收藏过，那么收藏数加一，加收藏，然后再返回结果
                var collect = new AnswerCollect({answer_id: id, userID: userID});
                doc.collect++;
                var ep = new eventproxy();
                ep.all('collect', 'answer', function () {
                    return callback(null, doc);
                });
                ep.fail(callback);
                collect.save(ep.done('collect'));
                doc.save(ep.done('answer'));
            }
        });
    });
};

/**
 * 根据userID和answer_id查询删除一条离线答案的收藏记录
 * Callback:
 * - err, 数据库异常
 * - doc, 是否关注
 * @param {String} id 离线答案ID
 * @param {String} userID 用户userID
 * @param {Function} callback 回调函数
 */
exports.removeCollect = function (id, userID, callback) {
    OfflineAnswer.getOfflineAnswerByID(id, function (err, doc) {
        if (err) {
            return callback(err);
        }
        if (!doc) {   //离线答案不存在，返回空
            return callback();
        }
        AnswerCollect.findOne({answer_id: id, userID: userID}, function (err2, doc2) {
            if (err2) {
                callback(err2);
            } else {
                if (!doc2) {
                    //没有收藏过，直接返回成功就可以了，同时返回answer
                    return callback(null, doc);
                }
                //曾经收藏过，那么收藏数减一，移除收藏，然后再返回结果
                doc.collect--;
                var ep = new eventproxy();
                ep.all('collect', 'answer', function () {
                    return callback(null, doc);
                });
                ep.fail(callback);
                doc2.remove(ep.done('collect'));
                doc.save(ep.done('answer'));
            }
        });
    });
};

/**
 * 根据userID获取收藏的离线答案列表（支持分页）
 * Callback:
 * - err, 数据库异常
 * - doc, 问题列表
 * @param {Object} param = {userID: '', u_id: '', startPos: '', pageSize: ''}
 * @param {Function} callback 回调函数
 */
exports.getCollectedAnswers = function (param, callback) {
    let start = Number.parseInt(param.startPos || '1') - 1;
    let count = Number.parseInt(param.pageSize || '10');
    AnswerCollect.find({userID: param.u_id || param.userID}).sort({time: -1}).skip((start < 1 ? 1 : start) - 1).limit(count).exec(function (err, collects) {
        if (err) {
            return callback(err);
        }
        if (collects.length == 0) {
            return callback(null, []);
        }
        let answer_ids = [];
        for (let i = 0; i < collects.length; i++) {
            answer_ids.push(collects[i].answer_id);
        }
        model.OfflineAnswer.find({_id: {$in: answer_ids}}, (err, answers)=>{
            if(err){
                return callback(err);
            }
            for (let i = 0; i < collects.length; i++) {
                for (let j = 0; j < answers.length; j++) {
                    if (collects[i].off_id == answers[j].off_id) {
                        answers[j].time = collects[i].time;
                    }
                }
            }
            answers.sort((a, b)=>b.time - a.time);
            OfflineAnswer.answerList(answers, param.userID, callback);
        });
    });
};
