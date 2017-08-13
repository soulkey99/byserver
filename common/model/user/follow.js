/**
 * Created by MengLei on 2016-05-30.
 */
"use strict";
const mongoose = require('mongoose');
const BaseModel = require('../baseModel');
const Schema = mongoose.Schema;

let UserFollowersSchema = new Schema({
    _id: {type: Schema.Types.ObjectId},
    list: {type: [String], default: []}
});

let UserFollowingSchema = new Schema({
    _id: {type: Schema.Types.ObjectId},
    list: {type: [String], default: []},
    pubList: {type: [String], default: []}
});

mongoose.model('UserFollowers', UserFollowersSchema, 'userFollowers');
mongoose.model('UserFollowing', UserFollowingSchema, 'userFollowing');
