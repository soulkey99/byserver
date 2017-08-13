/**
 * Created by MengLei on 2015/12/10.
 */
"use strict";
const mongoose = require('mongoose');
const BaseModel = require('../baseModel');
const hot = require("hot-ranking");
const Schema = mongoose.Schema;

let OfflineAnsReplySchema = new Schema({
    _id: {type: Schema.Types.ObjectId},
    author_id: {type: String, default: ''},
    off_id: {type: String, default: ''},
    reply_id: {type: String, default: ''},
    answer_id: {type: String, default: ''},
    msg: {type: String, default: ''},
    ups: {type: [String], default: []},
    downs: {type: [String], default: []},
    createTime: {type: Number, default: 0},
    updateTime: {type: Number, default: 0},
    delete: {type: Boolean, default: false},
    upIndex: {type: Number, default: 0}
});

OfflineAnsReplySchema.plugin(BaseModel);

OfflineAnsReplySchema.pre('save', function (next) {
    if (!this.createTime) {
        this.createTime = Date.now();
    }
    if (!this.updateTime) {
        this.updateTime = Date.now();
    }
    this.upIndex = parseFloat(hot(this.ups.length, this.downs.length, new Date(this.createTime)));
    next();
});

OfflineAnsReplySchema.virtual('answer_reply_id').get(function () {
    return this._id.toString();
});

mongoose.model('OfflineAnsReply', OfflineAnsReplySchema, 'offlineAnsReply');

