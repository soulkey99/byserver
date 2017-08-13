/**
 * Created by MengLei on 2015/12/23.
 */

var mongoose = require('mongoose');
var BaseModel = require('./baseModel');
var Schema = mongoose.Schema;

//type: 0：新用户注册奖励，1：完善个人资料，2：抢答，3：提问，4：回答获5星好评，5：问题被关注，6：答案被赞，
//7：签到得积分，8：邀请用户得积分，9：管理加分/扣分，10：关注用户，11：打赏老师减积分，12：被打赏得积分

var BonusSchema = new Schema({
    _id: {type: Schema.Types.ObjectId},
    userID: {type: String},
    bonus: {type: Number},
    type: {type: String},
    detail: {
        t: {type: Number},
        desc: {type: String},
        o_id: {type: String},
        u_id: {type: String},
        answer_id: {type: String},
        goodId: {type: String},
        goodName: {type: String},
        goodType: {type: String},
        deliver: {type: String},
        detail: {type: String}
    }
}, {_id: false});

BonusSchema.plugin(BaseModel);
BonusSchema.set('versionKey', false);

BonusSchema.pre('save', function(next) {
    if (!this.detail.t) {
        this.detail.t = Date.now();
    }
    next();
});

//定义保存积分的操作，只在非零的情况下才保存积分记录
BonusSchema.methods.saveBonus = function(callback) {
    if (this.bonus == 0) {
        callback(null, false);
    } else {
        //保存积分记录的时候，还要增加用户表中记录的积分
        require('../proxy').User.incBonus(this.userID, this.bonus);
        this.save(callback);
    }
};

BonusSchema.virtual('bonus_id').get(function(){
    return this._id.toString();
});

BonusSchema.index({userID: 1});
BonusSchema.index({'detail.t': -1});

mongoose.model('Bonus', BonusSchema, 'bonus');
