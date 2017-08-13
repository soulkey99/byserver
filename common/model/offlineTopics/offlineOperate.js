/**
 * Created by MengLei on 2016-05-30.
 */
"use strict";
const mongoose = require('mongoose');
const BaseModel = require('../baseModel');
const Schema = mongoose.Schema;

let OfflineOperateSchema = new Schema({
    _id: {type: Schema.ObjectId},
    userID: {type: String},
    operType: {type: String},
    operID: {type: String},
    time: {type: Number},
    display: {type: Boolean, default: true}
});

OfflineOperateSchema.plugin(BaseModel);

OfflineOperateSchema.pre('save', function (next) {
    // mongoose.model('OfflineOperate').update({userID: this.userID, operType: this.operType, operID: this.operID, time: {$gte: Date.now()-86400000, $lte: Date.now() - 1500}}, {$set: {display: false}}, {multi: true}).exec();
    if (!this.time) {
        this.time = Date.now();
    }
    next();
});

mongoose.model('OfflineOperate', OfflineOperateSchema, 'offlineOperate');
