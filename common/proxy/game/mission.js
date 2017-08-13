/**
 * Created by MengLei on 2016/3/1.
 */
"use strict";

const model = require('../../model');
const Mission = model.GameMission;

/**
 * 根据mission_id查询记录
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {String} mission_id 任务id
 * @param {Function} callback 回调函数
 */
exports.getMissionByID = function(mission_id, callback){
    Mission.findOne({_id: mission_id}, callback);
};

/**
 * 获取用户的今日任务列表
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {Object} param = {userID: '', mission_id: ''}
 * @param {Function} callback 回调函数
 */
exports.getUserTodayMission = function(param, callback){
    if(!param.userID){
        return callback(new Error('userID不能为空！'));
    }
    let t = new Date();
    let t1 = t.setHours(0,0,0,0);
    let t2 = t.setHours(23, 59, 59, 999);
    Mission.find({userID: param.userID, create_time: {$gte: t1, $lt: t2}}, callback);
};

/**
 * 为用户增加一条任务记录
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {Object} param = {userID: '', mission_id: ''}
 * @param {Function} callback 回调函数
 */
exports.addMissionRecord = function(param, callback){
    if(!param.userID){
        return callback(new Error('userID不能为空！'));
    }
    let t = new Date();
    let t1 = t.setHours(0,0,0,0);
    let t2 = t.setHours(23, 59, 59, 999);
    Mission.find({userID: param.userID, create_time: {$gte: t1, $lt: t2}}, callback);
};

/**
 * 根据identifier获取用户今日的任务情况
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {Object} param = {userID: '', identifier: ''}
 * @param {Function} callback 回调函数
 */
exports.getUserTodayMissionItem = function(param, callback){
    if(!param.userID){
        return callback(new Error('userID不能为空！'));
    }
    if(!param.identifier){
        return callback(new Error('identifier不能为空！'));
    }
    var t = new Date();
    var t1 = t.setHours(0,0,0,0);
    var t2 = t.setHours(23, 59, 59, 999);
    //一天一个用户一个identifier的任务记录只能有一个
    Mission.findOne({userID: param.userID, identifier: param.identifier, create_time: {$gte: t1, $lt: t2}}, callback);
};

/**
 * 记录用户任务执行情况，以及任务中奖励积分、绩点、脑力情况
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {Object} param = {userID: '', mission_id: '', bonus: '', point: '', intellectual: '', current_process: ''}
 */
exports.setMission = function(param) {
    if (!param.userID) {
        return;
    }
    if(!param.identifier){
        return;
    }
    var t = new Date();
    var t1 = t.setHours(0, 0, 0, 0);
    var t2 = t.setHours(23, 59, 59, 999);
    Mission.findOne({
        userID: param.userID,
        identifier: param.identifier,
        create_time: {$gte: t1, $lt: t2}
    }, function (err, mission) {
        if (err) {
            return callback(err);
        }
        if (!mission) {
            mission = new Mission({userID: param.userID, identifier: param.identifier});
        }
        if (param.current_process) {
            mission.current_process = param.current_process;
        }
        if (param.bonus) {
            mission.bonus += param.bonus;
        }
        if (param.point) {
            mission.point += param.point;
        }
        if (param.intellectual) {
            mission.intellectual += param.intellectual;
        }
        mission.save();
    });
};


