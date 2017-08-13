/**
 * Created by MengLei on 2016/1/4.
 */

var mongoose = require('mongoose');
var BaseModel = require('./baseModel');
var Schema = mongoose.Schema;

var ChargeSchema = new Schema({
    id: {type: String},
    object: {type: String},
    created: {type: Number},
    livemode: {type: Boolean},
    paid: {type: Boolean},
    refunded: {type: Boolean},
    app: {type: String},
    channel: {type: String},
    order_no: {type: String},
    client_ip: {type: String},
    amount: {type: Number},
    amount_settle: {type: Number},
    currency: {type: String, default: 'cny'},
    subject: {type: String},
    body: {type: String},
    extra: {type: Object},
    time_paid: {type: Number},
    time_expire: {type: Number},
    time_settle: {type: Number},
    transaction_no: {type: String},
    refunds: [],
    amount_refunded: {type: Number},
    failure_code: {type: String},
    failure_msg: {type: String},
    metadata: {type: Object},
    credential: {type: Object},
    description: {type: String}
}, {_id: false});

var MoneySchema = new Schema({
    _id: {type: Schema.Types.ObjectId},
    userID: {type: String},
    o_id: {type: String},
    t_id: {type: String},
    type: {type: String, default: 'rewardTeacher'},
    channel: {type: String, default: 'alipay'},
    amount: {type: Number}, //订单金额
    rebate: {type: Number}, //提现的平台分成
    actual_pay: {type: Number},//提现的实际支付
    bonus: {type: Number, default: 0},  //抵扣积分
    money: {type: Number, default: 0},  //实际支付
    currency: {type: String, default: 'cny'},
    subject: {type: String},
    status: {type: String},
    client_status: {type: String},
    desc: {type: String},
    createTime: {type: Number},
    charge: {type: ChargeSchema, default: {}}
}, {_id: false});

MoneySchema.index({userID: 1});
MoneySchema.index({t_id: 1});
MoneySchema.index({o_id: 1});
MoneySchema.index({createTime: -1});

MoneySchema.plugin(BaseModel);

MoneySchema.virtual('money_id').get(function () {
    return this._id.toString();
});

MoneySchema.pre('save', function (next) {
    if (this.type == 'withdraw') {
        //this.charge = undefined;
    }
    if (!this.createTime) {
        this.createTime = Date.now();
    }
    next();
});

MoneySchema.methods.saveMoney = function (callback) {
    switch (this.type) {
        case 'seniorOrder':
        {//学生端减少余额，教师端增加余额
            require('../proxy').User.incStudentMoney(this.userID, 0 - this.amount);
            require('../proxy').User.incMoney(this.t_id, this.amount);
        }
            break;
        case 'withdraw':
        {
            require('../proxy').User.incWithdrawingMoney(this.userID, this.amount);
        }
            break;
        case 'charge':
        case 'rewardTeacher':
        default:
            return callback(new Error('暂未实现！'));
            break;
    }
    //保存记录，同时改变用户表上的信息
    //require('../proxy').User.incMoney(this.userID, this.amount);
    this.save(callback);
};

mongoose.model('Money', MoneySchema, 'money');
