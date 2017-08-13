/**
 * Created by MengLei on 2016-04-26.
 */
"use strict";
const mongoose = require('mongoose');
const BaseModel = require('../baseModel');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
//知识点
let ChapterSchema = new Schema({
    _id: {type: ObjectId},
    ver_id: {type: ObjectId},   //对应的教材版本
    title: {type: String, default: ''},
    remark: {type: String, default: ''},
    type: {type: String, default: 'chapter'},
    sections: {type: [ObjectId]},
    seq: {type: Number, default: 0},
    createAt: {type: Number, default: 0},   //创建时间
    updateAt: {type: Number, default: 0}    //更新时间
});

ChapterSchema.plugin(BaseModel);

ChapterSchema.virtual('cha_id').get(function () {
    return this._id.toString();
});

ChapterSchema.pre('save', function (next) {
    this.updateAt = Date.now();
    if (!this.createAt) {
        this.createAt = this.updateAt;
    }
    next();
});

mongoose.model('StudyChapter', ChapterSchema, 'studyMaterialChapter');

let SectionSchema = new Schema({
    _id: {type: ObjectId},
    title: {type: String, default: ''},
    remark: {type: String, default: ''},
    type: {type: String, default: 'section'},
    seq: {type: Number, default: 0},
    questions: {type: [ObjectId], default: []},   //节下的所属问题
    createAt: {type: Number, default: 0},   //创建时间
    updateAt: {type: Number, default: 0}    //更新时间
});

SectionSchema.plugin(BaseModel);

SectionSchema.virtual('sec_id').get(function () {
    return this._id.toString();
});

SectionSchema.pre('save', function (next) {
    this.updateAt = Date.now();
    if (!this.createAt) {
        this.createAt = this.updateAt;
    }
    next();
});

mongoose.model('StudySection', SectionSchema, 'studyMaterialSection');


//以下代码供录入学段年级科目使用
// let GradeSchema = new Schema({
//     gradeName: {type: String, default: ''}
// }, {_id: false});
// let SubjectSchema = new Schema({
//     subjectName: {type: String, default: ''},
//     grades: {type: [GradeSchema], default: []}
// }, {_id: false});
// let StageSchema = new Schema({
//     stageName: {type: String, default: ''},
//     subjects: {type: [SubjectSchema], default: []}
// }, {_id: false});
// let SSGSchema = new Schema({
//         stageSubjectGrade: {type: [StageSchema], default: []}
//     }
// );
//
// mongoose.model('SSG', SSGSchema, 'studyCatalog');