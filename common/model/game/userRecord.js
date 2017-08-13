/**
 * Created by MengLei on 2016/2/2.
 */
"use strict";
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let log = require('../../../utils/log').common;
let BaseModel = require('./../baseModel');

//用户游戏记录表
let GameUserRecordSchema = new Schema({
    _id: {type: Schema.Types.ObjectId}, //用户id
    create_time: {type: Number},    //创建世界
    level: {type: Number, default: 1},      //等级，从1开始
    point: {type: Number, default: 1},      //绩点，初始赠送1绩点
    strength: {type: Number, default: 5},   //体力
    strength_recover_time: {type: Number, default: 0},  //体力检查时间
    strength_recover_interval: {type: Number, default: 600000}, //体力恢复时间间隔，默认10分钟回复一点体力
    bonus: {type: Number, default: 100},  //学分
    total: {    //总数据
        intellectual: {type: Number, default: 0.0},   //脑力
        total: {type: Number, default: 0},  //总对战数
        finish: {type: Number, default: 0}, //完成对战数
        win: {type: Number, default: 0},    //胜利数
        draw: {type: Number, default: 0},    //平局数
        lose: {type: Number, default: 0},   //失败数
        correct_question: {type: Number, default: 0}    //回答正确问题数
    },
    weekly: {   //周数据，字段同上
        intellectual: {type: Number, default: 0.0},   //脑力
        total: {type: Number, default: 0},
        finish: {type: Number, default: 0},
        win: {type: Number, default: 0},
        draw: {type: Number, default: 0},
        lose: {type: Number, default: 0},
        correct_question: {type: Number, default: 0}
    },
    monthly: {  //月数据
        intellectual: {type: Number, default: 0.0},   //脑力
        total: {type: Number, default: 0},
        finish: {type: Number, default: 0},
        win: {type: Number, default: 0},
        draw: {type: Number, default: 0},
        lose: {type: Number, default: 0},
        correct_question: {type: Number, default: 0}
    }
});

let GameUserRecordHistorySchema = new Schema({
    _id: {type: Schema.Types.ObjectId}, //记录id
    userID: {type: String, default: ''},
    strength: {type: Number, default: 0},
    bonus: {type: Number, default: 0},
    point: {type: Number, default: 0},
    intellectual: {type: Number, default: 0},
    desc: {type: String, default: ''},
    battle_id: {type: String},
    t: {type: Number, default: 0}
});

GameUserRecordSchema.plugin(BaseModel); //为了引入BaseModel
GameUserRecordHistorySchema.plugin(BaseModel);

GameUserRecordSchema.virtual('userID').get(function(){    //userID
    return this._id.toString();
});

GameUserRecordSchema.statics.findOneRecord = function(query, callback) {
    let self = this;
    this.findOne(query, function (err, doc) {
        if (err) {
            return callback(err);
        }
        if (!doc) {
            log.trace('find one record null, query = ' + JSON.stringify(query));
            let record = new self({_id: query._id});
            return record.save(callback);
        }
        let level = calcLevel(doc.total.intellectual);
        if (doc.strength < 5) {
            //对于体力小于5的情况，先为其恢复体力（暂定10分钟恢复一点）
            let strength_recover = Math.floor((Date.now() - doc.strength_recover_time) / doc.strength_recover_interval);
            doc.strength += strength_recover;
            if (doc.strength > 5) {
                doc.strength = 5;
            }
            if (doc.strength < 5) {
                doc.strength_recover_time += strength_recover * doc.strength_recover_interval;
            } else {
                doc.strength_recover_time = Date.now();
            }
            if (doc.level != level) {
                doc.level = level;
            }
            return doc.save(callback);
        }
        if (doc.level != level) {
            doc.level = level;
            doc.save();
        }
        return callback(null, doc);
    });
};

GameUserRecordSchema.pre('save', function(next) {
    if (!this.create_time) {
        this.create_time = Date.now();
    }
    //if (this.strength < 5) {
    //    this.strength_recover_time = Date.now();
    //}
    next();
});
GameUserRecordHistorySchema.pre('save', function(next){
    this.t = Date.now();
    next();
});

GameUserRecordHistorySchema.index({userID: 1});
GameUserRecordHistorySchema.index({t: -1});
//GameUserSchema.index({expire: 1}, {expireAfterSeconds: 1});

mongoose.model('GameUserRecord', GameUserRecordSchema, 'userGameRecord');
mongoose.model('GameUserRecordHistory', GameUserRecordHistorySchema, 'userGameRecordHistory');


//已知脑力，计算用户等级
function calcLevel(target) {
    let i = 1;
    let intellectual = 0;
    while (true) {
        intellectual += floor((Math.pow((i - 1), 3) + 60) / 5 * ((i - 1) * 2 + 60) + 60, 50);
        if (target < intellectual) {
            return i;
        }
        i++;
    }
}

//floor算法
function floor(num ,sig) {
    if (!sig) {
        sig = 1;
    }
    return sig * Math.floor(num / sig);
}
