/**
 * Created by MengLei on 2016/2/4.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BaseModel = require('../baseModel');

//分享数据记录表
var ShareSchema = new Schema({
    _id: {type: Schema.Types.ObjectId}, //分享id
    type: {type: String},  //记录类型
    userID: {type: String},     //用户ID
    operID: {type: String},     //被操作的id
    param: {type: Object},      //一些参数
    t: {type: Number}      //用户版本
});

ShareSchema.plugin(BaseModel);   //引入BaseModel

ShareSchema.virtual('shareId').get(function(){
    return this._id.toString();
});

ShareSchema.pre('save', function(next){
    if(!this.t){
        this.t = Date.now();
    }
    next();
});

mongoose.model('Share', ShareSchema, 'share');
