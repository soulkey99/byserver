/**
 * Created by MengLei on 2016-04-20.
 */
"use strict";
const mongoose = require('mongoose');
const BaseModel = require('./baseModel');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

let TimeSchema = new Schema({
    minute: {type: Number, default: 0},
    hour: {type: Number, default: 0}
});

let SubjectSchema = new Schema({
    type: {type: String, default: 'subject'},
    subject: {type: String},
    duration: {type: Number, default: 600000},
    enable: {type: Boolean, default: true}, //是否开放状态
    imgsrc: {type: String},
    layout: {type: Number},
    valid_time: {
        need: {type: Boolean, default: false},  //是否启用定时开启功能
        days: {type: [Number], default: ['1', '2', '3', '4', '5']}, //可用星期
        start: {type: TimeSchema},  //开启时间
        end: {type: TimeSchema}     //结束时间
    },
    charge_info: {
        start: {type: Number, default: 0},  //起价费
        unit: {type: Number, default: 0},   //每分钟价格
        free: {type: Boolean, default: false}   //是否限免
    }
});

let GradeSchema = new Schema({
    grade: {type: String},
    enable: {type: Boolean, default: true},
    subjects: {type: [SubjectSchema], default: []},
    logo: {type: String, default: ''},
    type: {type: String, default: 'grade'},
    desc: {type: String, default: ''}
});

let GSSchema = new Schema({
    _id: {type: ObjectId},
    type: {type: String, default: 'gradeConfig'},
    channel: {type: String, default: null},
    gradeStr: {type: String, default: '普通学科'},
    subjectStr: {type: String, default: '特殊学科'},
    config: {type: [GradeSchema], default: []},
    subject: {type: [SubjectSchema], default: []}
});

GSSchema.plugin(BaseModel);

mongoose.model('GradeSubject', GSSchema, 'byConfig');
