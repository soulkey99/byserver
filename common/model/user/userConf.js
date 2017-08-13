/**
 * Created by MengLei on 2016-05-23.
 */
"use strict";
const mongoose = require('mongoose');
const BaseModel = require('../baseModel');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

let ConfSchema = new Schema({
    _id: {type: ObjectId},
    phonenum: {type: String, default: ''},
    name: {type: String, default: ''},
    desc: {type: String, default: ''},
    type: {type: String, default: ''},
    smscode: {type: String},
    status: {type: String, default: 'normal'},
    grabConf: {
        posibility: {type: Number, default: 1},
        status: {type: String, default: 'normal'}
    },
    expire: {type: Date},
    delete: {type: Boolean, default: false}
});
ConfSchema.plugin(BaseModel);
ConfSchema.index({phonenum: 1});
ConfSchema.index({expire: 1}, {expireAfterSeconds: 60});

mongoose.model('UserConf', ConfSchema, 'userConf');

