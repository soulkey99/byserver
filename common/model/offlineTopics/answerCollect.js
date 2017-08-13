/**
 * Created by MengLei on 2015/12/10.
 */
"use strict";
const mongoose = require('mongoose');
const BaseModel = require('../baseModel');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

let AnswerCollectSchema = new Schema({
    _id: {type: ObjectId},
    answer_id: {type: String, default: ''},
    userID: {type: String, default: ''},
    time: {type: Number, default: 0}
});

AnswerCollectSchema.plugin(BaseModel);

AnswerCollectSchema.pre('save', function (next) {
    if (!this.time) {
        this.time = Date.now();
    }
    next();
});

AnswerCollectSchema.index({answer_id: 1});
AnswerCollectSchema.index({userID: 1});

mongoose.model('AnswerCollect', AnswerCollectSchema, 'answerCollect');
