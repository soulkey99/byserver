/**
 * Created by MengLei on 2015/12/21.
 */
"use strict";
const mongoose = require('mongoose');
const BaseModel = require('../baseModel');
const Schema = mongoose.Schema;

let MsgboxSchema = new Schema({
    _id: {type: Schema.Types.ObjectId},
    from: {type: String},
    to: {type: String},
    type: {type: String, default: ''},
    detail: {type: Object, default: {}},
    time: {type: Number},
    display: {type: Boolean, default: true},
    delete: {type: Boolean, default: false},
    read: {type: Boolean}
});

MsgboxSchema.plugin(BaseModel);

//MsgboxSchema.pre('save', function(next){
//    //广播类消息没有read字段，其他消息默认设置为false
//    switch (this.type){
//        case 'broadcast':
//        case 'broadcast_t':
//        case 'broadcast_s':
//            break;
//        default:
//            this.read = false;
//            break;
//    }
//    next();
//});

MsgboxSchema.virtual('msgid').get(function(){
    return this._id.toString();
});

mongoose.model('Msgbox', MsgboxSchema, 'msgbox');
