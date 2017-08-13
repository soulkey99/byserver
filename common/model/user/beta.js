/**
 * Created by MengLei on 2016/2/3.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BaseModel = require('../baseModel');

var SubSchema = new Schema({
    game: {type: Boolean},
    withdraw: {type: Boolean},
    reward: {type: Boolean},
    purse: {type: Boolean}
}, {_id: false});
//用户测试数据记录表
var BetaSchema = new Schema({
    _id: {type: Schema.Types.ObjectId}, //记录id或者userID
    userID: {type: String},
    type: {type: String, default: 'user'},  //记录类型（个人配置user或者系统配置system）
    platform: {type: [String], default: []},     //系统
    userType: {type: [String], default: []},     //用户类型
    version: {type: [String], default: []},      //用户版本
    start_time: {type: Number}, //开始时间
    end_time: {type: Number},   //截止时间
    config: {type: SubSchema, default: {}}
}, {_id: false});

BetaSchema.plugin(BaseModel);   //引入BaseModel

BetaSchema.virtual('beta_id').get(function(){
    return this._id.toString();
});

if (!BetaSchema.options.toObject) BetaSchema.options.toObject = {};
BetaSchema.options.toObject.transform = function (doc, ret, options) {
    delete ret._id;
    delete ret.id;
    delete ret.config.id;
};

BetaSchema.pre('save', function(next){
    if(!this.create_time){
        this.create_time = Date.now();
    }
    next();
});

BetaSchema.index({userID: 1});

mongoose.model('Beta', BetaSchema, 'beta');
