/**
 * Created by MengLei on 2016/3/1.
 */
"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const BaseModel = require('./../baseModel');

const AchievementSchema = new Schema({
    _id: {type: Schema.Types.ObjectId},     //Object ID
    userID: {type: String},
    create_time: {type: Number},        //创建时间
    finish_time: {type: Number},        //完成时间
    status: {type: String, default: 'pending'},  //当前状态，默认进行中（pending进行中、success完成、fail失败、cancel取消）
    type: {type: String, default: ''},      //任务类型（每日任务、活动任务等。。。）
    name: {type: String, default: ''},      //任务名称
    avatar: {type: String, default: ''},    //任务图片
    desc: {type: String, default: ''},      //任务描述
    expire: {type: Number},
    bonus: {type: Number, default: 0},      //完成任务积分奖励
    intellectual: {type: Number, default: 0},   //完成任务智力奖励
    extra: {},  //附加字段
    condition: {}       //完成条件
});

AchievementSchema.plugin(BaseModel);

AchievementSchema.virtual('ach_id').get(function(){
    return this._id.toString();
});

AchievementSchema.pre('save', function(next){
    if(!this.create_time){
        this.create_time = Date.now();
    }
    next();
});

AchievementSchema.index({userID: 1});
AchievementSchema.index({create_time: -1});
AchievementSchema.index({status: 1});

mongoose.model('GameAchievement', AchievementSchema, 'gameAchievement');
