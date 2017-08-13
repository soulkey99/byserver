/**
 * Created by MengLei on 2016-04-27.
 */
"use strict";
const mongoose = require('mongoose');
const BaseModel = require('../baseModel');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

let VersionSchema = new Schema({
    _id: {type: ObjectId},
    stage: {type: String, default: ''},
    grade: {type: String, default: ''},
    subject: {type: String, default: ''},
    city: {type: [String], default: []},
    version: {type: String, default: ''},
    title: {type: String, default: ''},
    intro: {type: String, default: ''},
    cover: {type: String, default: ''},
    remark: {type: String, default: ''},
    type: {type: String, default: 'book', enum: ['book', 'exercise']},
    createAt: {type: Number, default: 0},   //创建时间
    updateAt: {type: Number, default: 0}    //更新时间
}, {timestamps: 1, id: false});

VersionSchema.plugin(BaseModel);

VersionSchema.virtual('ver_id').get(function () {
    return this._id.toString();
});

VersionSchema.pre('save', function (next) {
    this.updateAt = Date.now();
    if (!this.createAt) {
        this.createAt = this.updateAt;
    }
    next();
});

mongoose.model('StudyVersion', VersionSchema, 'studyMaterialVersion');
