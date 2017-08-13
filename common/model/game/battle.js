/**
 * Created by MengLei on 2016/1/6.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BaseModel = require('./../baseModel');

var SubUserSchema = new Schema({
    userID: {type: String},
    choice: {type: String},
    answer: {type: String},
    time: {type: Number},
    point: {type: Number}
}, {_id: false});

var SubSchema = new Schema({
    question_id: {type: String},
    users: [SubUserSchema]
}, {_id: false});


var BattleSchema = new Schema({
    _id: {type: Schema.Types.ObjectId},
    status: {type: String, default: 'waiting'},
    level: {type: Number, default: 1},  //对战所属关卡
    createTime: {type: Number},
    users: {type: [String]},
    questions: [SubSchema],
    winner: {type: String}
}, {_id: false});

BattleSchema.plugin(BaseModel);

BattleSchema.pre('save', function(next){
    if(!this.createTime){
        this.createTime = Date.now();
    }
    next();
});

BattleSchema.virtual('battle_id').get(function(){
    if(this._id) {
        return this._id.toString();
    }else{
        return '';
    }
});

mongoose.model('Battle', BattleSchema, 'battle');
