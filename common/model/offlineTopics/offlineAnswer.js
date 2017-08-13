/**
 * Created by MengLei on 2015/12/10.
 */
"use strict";
const mongoose = require('mongoose');
const BaseModel = require('../baseModel');
const hot = require("hot-ranking");
const Schema = mongoose.Schema;

let MsgSchema = new Schema({
    msg: {type: String, default: ''},
    type: {type: String, default: ''},
    time: {type: Number, default: 0},
    orientation: {type: String, default: 'portrait'},
    seq: {type: Number, default: 1},
    logo: {type: String, default: ''}
}, {_id: false});

let OfflineAnswerSchema = new Schema({
    _id: {type: Schema.Types.ObjectId},
    author_id: {type: String, default: ''},
    off_id: {type: String, default: ''},
    reply_id: {type: String, default: ''},
    msg: {type: [MsgSchema], default: []},
    ups: {type: [String], default: []},
    downs: {type: [String], default: []},
    upIndex: {type: Number, default: 0},
    reply: {type: Number, default: 0},
    replyIndex: {type: Number, default: 0},
    collect: {type: Number, default: 0},
    collectIndex: {type: Number, default: 0},
    createTime: {type: Number, default: 0},
    updateTime: {type: Number, default: 0},
    delete: {type: Boolean, default: false}
});

OfflineAnswerSchema.plugin(BaseModel);

OfflineAnswerSchema.pre('save', function (next) {
    if (!this.createTime) {
        this.createTime = Date.now();
    }
    if (!this.updateTime) {
        this.updateTime = Date.now();
    }
    this.upIndex = parseFloat(hot(this.ups.length, this.downs.length, new Date(this.createTime)));
    this.replyIndex = parseFloat(hot(this.reply, 0, new Date(this.createTime)));
    this.collectIndex = parseFloat(hot(this.collect, 0, new Date(this.createTime)));
    next();
});

OfflineAnswerSchema.virtual('answer_id').get(function () {
    return this._id.toString();
});

mongoose.model('OfflineAnswer', OfflineAnswerSchema, 'offlineAnswers');