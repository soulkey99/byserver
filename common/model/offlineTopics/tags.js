/**
 * Created by MengLei on 2016-05-25.
 */
"use strict";
const mongoose = require('mongoose');
const BaseModel = require('../baseModel');
const hot = require("hot-ranking");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

let TagsSchema = new Schema({
    _id: {type: ObjectId},
    tag: {type: String},
    count: {type: Number, default: 0},
    userID: {type: String, default: ''},
    createTime: {type: Number, default: 0},
    updateTime: {type: Number, default: 0}
});

TagsSchema.plugin(BaseModel);
TagsSchema.index({tag: 1});

mongoose.model('OfflineTags', TagsSchema, 'offlineTags');
