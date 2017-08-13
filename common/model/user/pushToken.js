/**
 * Created by MengLei on 2015/12/8.
 */

var mongoose = require('mongoose');
var BaseModel = require('../baseModel');
var Schema = mongoose.Schema;

var PushTokenSchema = new Schema({
    _id: {type: Schema.Types.ObjectId},
    token: {type: String, default: ''},
    platform: {type: String, default: 'unknown'}
});

PushTokenSchema.plugin(BaseModel);

mongoose.model('PushToken', PushTokenSchema, 'pushTokens');
