/**
 * Created by MengLei on 2015/12/10.
 */
"use strict";
const mongoose = require('mongoose');
const BaseModel = require('../baseModel');
const Schema = mongoose.Schema;

let TopicCollectSchema = new Schema({
    _id: {type: Schema.Types.ObjectId},
    off_id: {type: String, default: ''},
    userID: {type: String, default: ''},
    time: {type: Number, default: 0}
});

TopicCollectSchema.plugin(BaseModel);

TopicCollectSchema.pre('save', function (next) {
    if (!this.time) {
        this.time = Date.now();
    }
    next();
});

TopicCollectSchema.index({off_id: 1});
TopicCollectSchema.index({userID: 1});

mongoose.model('TopicCollect', TopicCollectSchema, 'topicCollect');

