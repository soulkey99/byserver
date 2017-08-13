/**
 * Created by MengLei on 2016/3/15.
 */
"use strict";
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let BaseModel = require('../baseModel');

let FastReplySchema = new Schema({
    _id: {type: Schema.Types.ObjectId},
    userID: {type: String},
    name: {type: String, default: ''},
    content: {
        msg: {type: String, default: ''},
        type: {type: String, default: ''},
        time: {type: Number, default: 0},
        orientation: {type: String, default: 'portrait'}
    },
    createAt: {type: Number, default: 0},
    updateAt: {type: Number, default: 0}
});

FastReplySchema.index({createAt: -1});
FastReplySchema.index({userID: 1});
FastReplySchema.virtual('fr_id').get(function(){
    return this._id.toString();
});
FastReplySchema.plugin(BaseModel);

FastReplySchema.pre('save', function(next){
    if(!this.createAt){
        this.createAt = Date.now();
    }
    this.updateAt = Date.now();
    next();
});

mongoose.model('FastReply', FastReplySchema, 'fastReply');
