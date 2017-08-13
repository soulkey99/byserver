/**
 * Created by MengLei on 2016-04-18.
 */
"use strict";
const mongoose = require('mongoose');
const BaseModel = require('../baseModel');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
//
let StepSchema = new Schema({
    q_id: {type: ObjectId},
    type: {type: String},
    choice_id: {type: ObjectId},
    t: {type: Number}
});

let ExerciseSchema = new Schema({
    _id: {type: ObjectId},
    userID: {type: ObjectId},
    type: {type: String, default: 'study'},   //练习类型，type=exercise练习，exam测试，study诱导式学习
    point: {type: Number, default: 0},  //得分
    status: {type: String, default: 'pending'}, //状态，pending进行中，finished完成
    sec_id: {type: ObjectId},   //节id
    q_id: {type: ObjectId},     //对于诱导式问题，记录root id
    step: {type: [StepSchema], default: []},    //中间步骤
    remark: {type: String, default: ''},    //备注
    createAt: {type: Number, default: 0},   //创建时间
    updateAt: {type: Number, default: 0}    //最后操作时间
});

ExerciseSchema.plugin(BaseModel);

StepSchema.virtual('step_id').get(function () {
    return this._id.toString();
});

ExerciseSchema.virtual('e_id').get(function () {
    return this._id.toString();
});

StepSchema.pre('save', function (next) {
    if(!this.t) {   //添加步骤的时间戳
        this.t = Date.now();
    }
    next();
});

ExerciseSchema.pre('save', function (next) {
    this.updateAt = Date.now();
    if (!this.createAt) {
        this.createAt = this.updateAt;
    }
    next();
});

ExerciseSchema.index({userID: 1});
ExerciseSchema.index({sec_id: 1});
ExerciseSchema.index({q_id: 1});
ExerciseSchema.index({createAt: -1});
ExerciseSchema.index({updateAt: -1});

mongoose.model('StudyExercise', ExerciseSchema, 'studyExercise');

