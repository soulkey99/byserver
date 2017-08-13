/**
 * Created by MengLei on 2016/2/3.
 */


var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BaseModel = require('./../baseModel');

var GameLevelSchema = new Schema({
    _id: {type: Schema.Types.ObjectId},     //级别id
    create_time: {type: Number},
    status: {type: String, default: ''},    //当前关卡状态
    title: {type: String, default: ''},
    subTitle: {type: String, default: ''},
    seq: {type: Number},        //级别序号
    difficulty: {type: [Number]},   //选题难度级别，数组，可能有一些值（将来可能涉及出题概率）
    time: {type: Number},       //每道题时间长度
    quantity: {type: Number, default: 5},   //每局题目数量
    level: {type: Number},      //解锁需要的用户等级
    point: {type: Number},      //购买该关卡解锁需要的消耗的用户绩点（将来，还有可能用户技能）
    bonus: {type: Number},      //赌资，每局所押注的积分
    img: {type: String, default: ''},   //封面图
    background: {type: String, default: ''},  //游戏背景图
    background_ios: {type: String, default: ''}     //ios系统另外配置一张背景图
});

GameLevelSchema.plugin(BaseModel); //为了引入BaseModel

GameLevelSchema.virtual('level_id').get(function(){    //userID
    return this._id.toString();
});

//GameUserSchema.pre('update', function(next){
//
//    next();
//});
GameLevelSchema.index({seq: 1});

mongoose.model('GameLevel', GameLevelSchema, 'gameLevels');

