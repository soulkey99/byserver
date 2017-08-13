/**
 * Created by MengLei on 2016-05-10.
 */
"use strict";
const mongoose = require('mongoose');
const BaseModel = require('../baseModel');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

let gsSchema = new Schema({
    _id: {type: ObjectId},  //对应用户userID
    status: {type: String, default: ''},    //用户状态
    channel: {type: String, default: ''},   //用户渠道标记
    gsList: {type: [String], default: []},  //用户的科目列表
    seniorGSList: {type: [String], default: []},    //收费科目列表
    specialGSList: {type: [String], default: []},   //特殊科目列表
    t: {type: Date} //过期时间
});

gsSchema.pre('save', function (next) {
    this.t = new Date();
    next();
});

gsSchema.index({gsList: 1});
gsSchema.index({seniorGSList: 1});
gsSchema.index({specialGSList: 1});
gsSchema.index({t: 1}, {expireAfterSeconds: 604800});   //推题过期时间设置为7天

mongoose.model('gsList', gsSchema, 'gsList');
