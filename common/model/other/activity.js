/**
 * Created by MengLei on 2016-05-04.
 */
"use strict";
var mongoose = require('mongoose');
var BaseModel = require('../baseModel');
var Schema = mongoose.Schema;

//广告model
var ActivitySchema = new Schema({
    _id: {type: Schema.Types.ObjectId},
    start: {type: Number, default: 0},
    end: {type: Number, default: 0},
    type: {type: String, default: 'activity'},
    valid: {type: Boolean, default: true},
    delete: {type: Boolean, default: false},
    img: {type: String, default: ''},
    img_grey: {type: String, default: ''},
    dest: {type: String, default: ''},
    title: {type: String, default: ''},
    desc: {type: String, default: ''},
    remark: {type: String, default: ''},
    top: {type: Boolean, default: false},
    createAt: {type: Number},
    updateAt: {type: Number}
});

ActivitySchema.plugin(BaseModel);


ActivitySchema.virtual('activity_id').get(function () {
    return this._id.toString();
});

ActivitySchema.virtual('status').get(function () {
    //status: notStarted未开始，pending进行中，finished已结束，deleted已删除，invalid不可用
    if (this.delete) {
        return 'deleted';
    }
    if (!this.valid) {
        return 'invalid';
    }
    if (Date.now() < this.start) {
        return 'notStarted';
    } else if (Date.now() < this.end) {
        return 'pending';
    } else {
        return 'finished';
    }
});

mongoose.model('Activity', ActivitySchema, 'activity');
