/**
 * Created by MengLei on 2016-09-21.
 */
"use strict";
const mongoose = require('mongoose');
const BaseModel = require('./../baseModel');
const Schema = mongoose.Schema;

let AdminSchema = new Schema({
    _id: {type: Schema.Types.ObjectId},
    userName: {type: String, default: ''},
    userPwd: {type: String, default: ''},
    nick: {type: String, default: ''}
}, {timestamps: 1});

AdminSchema.plugin(BaseModel);

mongoose.model('Admin', AdminSchema, 'admins');
