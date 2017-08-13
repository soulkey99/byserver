/**
 * Created by MengLei on 2016-05-26.
 */
"use strict";
const mongoose = require('mongoose');
const BaseModel = require('../baseModel');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

let OfflineClickSchema = new Schema({
    _id: {type: ObjectId},
    data: {type: Object, default: {}}
});

let OfflineCollectSchema = new Schema({
    _id: {type: ObjectId},
    data: {type: Object, default: {}}
});

let OfflineWatchSchema = new Schema({
    _id: {type: ObjectId},
    data: {type: Object, default: {}}
});

let OfflineReplySchema = new Schema({
    _id: {type: ObjectId},
    data: {type: Object, default: {}}
});

mongoose.model('OfflineClick', OfflineClickSchema, 'offlineClick');
mongoose.model('OfflineCollect', OfflineCollectSchema, 'offlineCollect');
mongoose.model('OfflineWatch', OfflineWatchSchema, 'offlineWatch');
mongoose.model('OfflineReply', OfflineReplySchema, 'offlineReply');

