/**
 * Created by MengLei on 2016/1/5.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BaseModel = require('./../baseModel');

var GameUserSchema = new Schema({
    _id: {type: Schema.Types.ObjectId},
    status: {type: String, default: 'waiting'},
    level: {type: Number, default: 1},  //用户游戏关卡
    closing: {type: Boolean, default: false},
    expire: {type: Date}
});

GameUserSchema.plugin(BaseModel); //为了引入BaseModel

GameUserSchema.virtual('userID').get(function(){    //userID
    return this._id.toString();
});

//GameUserSchema.pre('update', function(next){
//
//    next();
//});

GameUserSchema.index({expire: 1}, {expireAfterSeconds: 1});

mongoose.model('GameUser', GameUserSchema, 'gameUsers');

