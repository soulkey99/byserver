/**
 * Created by MengLei on 2016/3/1.
 */
"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const BaseModel = require('./../baseModel');

const MissionSchema = new Schema({
    _id: {type: Schema.Types.ObjectId},     //Object ID
    userID: {type: String},
    identifier: {type: String, default: ''},  //任务标识符（每项任务唯一）
    create_time: {type: Number},        //创建时间1
    finish_time: {type: Number},        //完成时间
    expire_time: {type: Number},        //过期时间
    current_process: {type: Number},    //任务奖励的当前领取进度
    status: {type: String},  //当前状态，默认进行中（pending进行中、success完成、fail失败、cancel取消）
    bonus: {type: Number, default: 0},      //完成任务积分奖励
    point: {type: Number, default: 0},      //完成任务绩点奖励
    intellectual: {type: Number, default: 0},   //完成任务智力奖励
    extra: {},  //附加字段
    condition: {}       //完成条件
});

const MissionRepoSchema = new Schema({
    _id: {type: Schema.Types.ObjectId},
    create_time: {type: Number},
    start_time: {type: Number},
    end_time: {type: Number},
    valid: {type: Boolean, default: false},
    type: {type: String, default: ''},
    name: {type: String, default: ''},
    avatar: {type: String, default: ''},
    desc: {type: String, default: ''}
});

MissionSchema.plugin(BaseModel);

MissionSchema.virtual('mission_id').get(function(){
    return this._id.toString();
});

MissionSchema.pre('save', function(next){
    if(!this.create_time){
        this.create_time = Date.now();
    }
    next();
});

MissionSchema.index({userID: 1});
MissionSchema.index({identifier: 1});
MissionSchema.index({create_time: -1});
MissionSchema.index({status: 1});

mongoose.model('GameMission', MissionSchema, 'gameMission');
mongoose.model('GameMissionRepo', MissionRepoSchema, 'gameMissionRepo');

