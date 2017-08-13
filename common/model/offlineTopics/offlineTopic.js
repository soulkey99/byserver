/**
 * Created by MengLei on 2015/12/4.
 */
"use strict";
const mongoose = require('mongoose');
const BaseModel = require('../baseModel');
const hot = require("hot-ranking");
const Schema = mongoose.Schema;

let Q_MsgSchema = new Schema({
    msg: {type: String, default: ''},
    type: {type: String, default: ''},
    time: {type: Number, default: 0},
    orientation: {type: String, default: 'portrait'},
    seq: {type: Number, default: 1},
    logo: {type: String, default: ''}
}, {_id: false});

let OfflineTopicSchema = new Schema({
    _id: {type: Schema.Types.ObjectId},
    author_id: {type: String, default: ''},
    grade: {type: String, default: ''},
    subject: {type: String, default: ''},
    tag: {type: [String], default: []},
    topic: {type: String, default: ''},
    section: {type: String, default: 'default'},
    q_msg: {type: [Q_MsgSchema], default: []},
    o_id: {type: String, default: null},
    createTime: {type: Number, default: 0},
    updateTime: {type: Number, default: 0},
    lastReplyTime: {type: Number, default: 0},
    lastReplyID: {type: String, default: ''},
    recommend: {type: Boolean, default: false},
    visit: {type: Number, default: 0},
    collect: {type: Number, default: 0},
    watch: {type: Number, default: 0},
    reply: {type: Number, default: 0},
    visitIndex: {type: Number, default: 0},
    collectIndex: {type: Number, default: 0},
    watchIndex: {type: Number, default: 0},
    replyIndex: {type: Number, default: 0},
    delete: {type: Boolean, default: false},
    bonus: {type: Number, default: 0},
    status: {type: String, default: 'open'},
    judgeTime: {type: Number, default: 0},
    judgeAnswerID: {type: String, default: ''}
});

OfflineTopicSchema.plugin(BaseModel);

OfflineTopicSchema.pre('save', function (next) {
    if (!this.createTime) {
        this.createTime = Date.now();
    }
    if (!this.updateTime) {
        this.updateTime = Date.now();
    }
    this.visitIndex = parseFloat(hot(this.visit, 0, new Date(this.updateTime)));
    this.collectIndex = parseFloat(hot(this.collect, 0, new Date(this.updateTime)));
    this.watchIndex = parseFloat(hot(this.watch, 0, new Date(this.updateTime)));
    this.replyIndex = parseFloat(hot(this.reply, 0, new Date(this.updateTime)));
    next();
});

OfflineTopicSchema.virtual('off_id').get(function () {
    return this._id.toString();
});

OfflineTopicSchema.set('toObject', {getters: true});
OfflineTopicSchema.index({createTime: -1});
OfflineTopicSchema.index({author_id: 1});
OfflineTopicSchema.index({section: 1});

mongoose.model('OfflineTopic', OfflineTopicSchema, 'offlineTopics');
