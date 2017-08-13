/**
 * Created by MengLei on 2016/1/29.
 */

var mongoose = require('mongoose');
var BaseModel = require('./baseModel');
var Schema = mongoose.Schema;

//广告model
var ADSchema = new Schema({
    _id: {type: Schema.Types.ObjectId},
    start: {type: Number, default: 0},
    end: {type: Number, default: 0},
    type: {type: String, default: ''},
    platform: {type: [String], default: []},
    userType: {type: [String], default: []},
    valid: {type: Boolean, default: false},
    desc: {type: String, default: ''},
    content: {
        action: {type: String},
        link: {type: String, default: ''},
        text: {type: String, default: ''},
        pic: {type: String, default: ''},
        goodName: {type: String}
    },
    seq: {type: Number, default: 999},
    resolution: {type: String, default: 'iphone5'}
});

ADSchema.plugin(BaseModel);
ADSchema.set('versionKey', false);

ADSchema.virtual('ad_id').get(function(){
    return this._id.toString();
});

mongoose.model('Advertise', ADSchema, 'advertise');

