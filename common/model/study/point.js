/**
 * Created by MengLei on 2016/4/7.
 */
"use strict";
const mongoose = require('mongoose');
const BaseModel = require('../baseModel');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
//知识点
let PointSchema = new Schema({
    _id: {type: ObjectId},
    stage: {type: String},  //学段
    grade: {type: String},  //年级
    subject: {type: String},    //科目
    title: {type: String, default: ''},
    content: {type: String, default: ''},
    remark: {type: String, default: ''},
    type: {type: String},
    pre: {type: [ObjectId], default: []},   //前置知识点
    next: {type: [ObjectId], default: []},  //后置知识点
    related: {type: [ObjectId], default: []},//平行关联知识点
    createAt: {type: Number, default: 0},   //创建时间
    updateAt: {type: Number, default: 0}    //更新时间
});

PointSchema.plugin(BaseModel);

PointSchema.virtual('p_id').get(function () {
    return this._id.toString();
});

PointSchema.pre('save', function (next) {
    this.updateAt = Date.now();
    if (!this.createAt) {
        this.createAt = this.updateAt;
    }
    next();
});

mongoose.model('StudyPoint', PointSchema, 'studyPoint');

