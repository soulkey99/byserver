/**
 * Created by MengLei on 2016/2/3.
 */
"use strict";

let model = require('../../model');
let log = require('../../../utils/log').common;
let eventproxy = require('eventproxy');
let GameLevel = model.GameLevel;

/**
 * 根据userID查询此人当前状态
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {String} level_id  关卡id
 * @param {Function} callback 回调函数
 */
exports.getLevelByID = function(level_id, callback){
    GameLevel.findById(level_id, callback);
};


/**
 * 根据userID查询此人个性化关卡列表
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {param} param = {userID: userID, platform: ''}  用户id和用户操作系统
 * @param {Function} callback 回调函数
 */
exports.getLevelByUserID = function(param, callback) {
    log.trace('proxy, getLevelByUserID, userID: ' + param.userID + ', param: ' + JSON.stringify(param));
    let ep = new eventproxy();
    ep.all('userRecord', 'levels', function (userRecord, levels) {
        let list = [];
        for (let i = 0; i < levels.length; i++) {
            let obj = {
                level_id: levels[i].level_id,
                status: levels[i].status,
                title: levels[i].title,
                subTitle: levels[i].subTitle,
                img: levels[i].img,
                background: levels[i].background,
                seq: levels[i].seq,
                time: levels[i].time,
                bonus: levelBonus(levels[i].seq),
                point: levelPoint(levels[i].seq),
                quantity: levelQuantity(levels[i].seq),
                level: needUserLevel(levels[i].seq),
                valid: false
            };
            if(param.platform == 'ios'){ //对于ios，特殊配置一张背景图片
                obj.background = levels[i].background_ios;
            }
            if (obj.status == 'open' && userRecord.level >= obj.level) {
                obj.valid = true;
            }
            list.push(obj);
        }
        callback(null, list);
    });
    ep.fail(callback);
    GameLevel.find({}, {}, {sort: 'seq'}, ep.done('levels'));
    require('./userRecord').getRecordByUserID(param.userID, ep.done('userRecord'));
};

//输入关卡数，返回需要抵押的学分
function levelBonus(level){
    return floor((Math.pow((level - 1), 4) + 10) / 10 * ((level - 1) * 2 + 10) + 20, 20);
}
//输入关卡数，返回需要解锁用的绩点
function levelPoint(level){
    return Math.pow((level - 1), 2);
}
//输入关卡数，返回每一关题目数量
function levelQuantity(level){
    return level + 4;
}
//输入关卡数，返回所需用户等级
function needUserLevel(level) {
    if (level <= 1) {
        return 0;
    }
    return level * 2;
}
//floor算法，将参数num沿绝对值减小的方向去尾舍入，使其等于最接近的sig的倍数
function floor(num, sig){
    if(!sig){
        sig = 1;
    }
    return sig * Math.floor(num /sig);
}

