/**
 * Created by MengLei on 2015/12/21.
 */
"use strict";
const mongoose = require('mongoose');
const BaseModel  = require('../baseModel');
const Schema = mongoose.Schema;

let MsgStatusSchema = new Schema({
    _id: {type: Schema.Types.ObjectId},
    msgid: {type: String},
    userID: {type: String},
    read: {type: Boolean},
    time: {type: Number}
});

MsgStatusSchema.plugin(BaseModel);

mongoose.model('MsgStatus', MsgStatusSchema, 'msgStatus');
