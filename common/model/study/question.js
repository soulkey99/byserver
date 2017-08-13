/**
 * Created by MengLei on 2016/4/7.
 */
"use strict";
const mongoose = require('mongoose');
const BaseModel = require('../baseModel');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
//问题
//问题和选项都使用一个html片段来进行格式化展示，这样可以保证图文混排的展示方式比较简单
let ChoiceSchema = new Schema({
    content: {type: String, default: ''},   //选项内容
    action: {type: String, default: ''},  //选项类型（next：下一题，question：提示审题，hint：弹hint字段，result：到结果页）
    correct: {type: Boolean},   //是否正确答案
    flag: {type: String, default: ''},  //标识
    hint: {type: String, default: ''},  //提示
    remark: {type: String, default: ''},
    next: {type: ObjectId}   //下一题id
});

let QuestionSchema = new Schema({
    _id: {type: ObjectId},
    stage: {type: String},  //学段（只有题干才有）
    grade: {type: String},  //年级（只有题干才有）
    subject: {type: String},    //科目（只有题干才有）
    root_id: {type: ObjectId},     //如果是过程或者结论，那么它属于的题干的id，题干没有此字段
    next: {type: ObjectId}, //如果是根，那么下一步要进行的题目id
    type: {type: String, default: 'root'},  //类型，root题干，prepare准备理解，procedure解题过程，conclusion结论，review回顾
    content: {type: String, default: ''},   //内容
    choice: {type: [ChoiceSchema], default: []},    //选项
    point: {type: [ObjectId], default: []},     //相关知识点id list
    related: {type: [ObjectId], default: []},    //相关题目id list
    enhance: {type: [ObjectId], default: []},    //相关提高题id list
    difficulty: {type: Number, default: 1},     //题目难度
    remark: {type: String, default: ''},    //备注
    userID: {type: ObjectId},   //录入者ID
    status: {type: String, enum: ['pending', 'verified', 'fail'], default: 'pending'},
    msg: {type: String, default: ''},    //错误信息
    createAt: {type: Number, default: 0},   //创建时间
    updateAt: {type: Number, default: 0}    //更新时间
});

QuestionSchema.plugin(BaseModel);

ChoiceSchema.virtual('choice_id').get(function () {
    return this._id.toString();
});
QuestionSchema.virtual('q_id').get(function () {
    return this._id.toString();
});

QuestionSchema.pre('save', function (next) {
    switch (this.type) {
        case 'root':
            delete(this.root_id);
            delete(this.choice);
            delete(this.choice_id);
            break;
        case 'prepare':
        case 'procedure':
        case 'conclusion':
            delete(this.stage);
            delete(this.grade);
            delete(this.class);
            delete(this.point);
            delete(this.related);
            delete(this.enhance);
            delete(this.status);
            break;
    }
    this.updateAt = Date.now();
    if (!this.createAt) {
        this.createAt = this.updateAt;
    }
    next();
});

mongoose.model('StudyQuestion', QuestionSchema, 'studyQuestions');
