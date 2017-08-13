/**
 * Created by MengLei on 2015/11/26.
 */

var config = require('../../../config');
var objectId = require('mongojs').ObjectId;
var result = require('../../utils/result');
var db = config.db;
var proxy = require('../../../common/proxy');
var addMoney = require('./addMoney');
var ipAddr = require('../../../utils/ipAddr');
var log = require('../../../utils/log').http;
var cronJob = require('cron').CronJob;
const retrievePayStatus = require('./utils/retrievePayStatus');
var pingpp = require('pingpp')(config.pingxxKey_test);
if (config.production_mode == 'true') {
    pingpp = require('pingpp')(config.pingxxKey_live);
}

//打赏老师，通过pingxx进行付款
module.exports = function (req, res) {

    var _id = new objectId();
    try {
        _id = new objectId(req.body.o_id);
    } catch (ex) {
        result(res, {statusCode: 919, message: ex.message});
        return;
    }
    var amount = 0; //打赏金额
    var bonus = 0;  //积分抵扣数
    var money = 0;  //需要支付的钱数
    try {
        if (req.body.amount) {
            amount = parseInt(req.body.amount);
            if (amount.toString() == 'NaN') {
                throw new Error('amount exception');
            }
        }
        if (req.body.bonus) {
            bonus = parseInt(req.body.bonus);
            if (bonus.toString() == 'NaN') {
                bonus = 0;
            }
        }
    } catch (ex) {
        result(res, {statusCode: 955, message: '打赏数额不对！'});
        return;
    }
    var rate = 1;
    //先查询汇率信息
    db.byConfig.findOne({_id: 'rewardConfig'}, function (err3, doc3) {
        if (err3) {
            return result(res, {statusCode: 905, message: err3.message});
        }
        if (doc3) {
            rate = doc3.config.rate;
        }

        money = amount - bonus / rate; //实际需要支付金额
        money = parseInt(money.toFixed(0));   //处理一下，避免由于舍入误差造成问题
        if (money < 0) {
            result(res, {statusCode: 955, message: '支付数额不对，积分抵扣超出支付金额！'});
            return;
        }
        if ((bonus > 0) && (bonus > req.user.userInfo.bonus)) {
            result(res, {statusCode: 955, message: '抵扣失败，积分不足！'});
            return;
        }

        db.orders.findOne({_id: _id}, {s_id: 1, t_id: 1}, function (err, doc) {
            if (err) {
                result(res, {statusCode: 905, message: err.message});
            } else {
                if (doc) {
                    //
                    var item = {
                        _id: new objectId(),
                        userID: req.body.userID,
                        o_id: req.body.o_id,
                        t_id: doc.t_id,
                        type: 'rewardTeacher',
                        channel: req.body.channel || 'alipay',
                        amount: amount,
                        bonus: bonus,
                        money: money,
                        currency: 'cny',
                        subject: '打赏教师' + getDateString(),
                        status: 'pending',
                        client_status: 'pending',
                        createTime: (new Date()).getTime()
                    };
                    if (money > 0) {
                        if (item.channel == 'alipay') {
                            //如果积分不足以抵扣打赏金额，那么需要调用支付功能
                            pingpp.charges.create({
                                order_no: item._id.toString(),
                                app: {id: config.pingxxID_s},
                                channel: item.channel,
                                amount: money,
                                client_ip: ipAddr(req) || '127.0.0.1',
                                currency: 'cny',
                                subject: 'reward' + getDateString(),
                                body: 'reward' + getDateString()
                            }, function (err, charge) {
                                if (err) {
                                    log.error('create charge object error: ' + err.message);
                                    result(res, {statusCode: 905, message: err.message});
                                } else {
                                    item['charge'] = charge;
                                    //记录交易信息
                                    db.money.insert(item);
                                    //给客户端返回结果
                                    result(res, {
                                        statusCode: 900,
                                        needCharge: true,
                                        charge: charge,
                                        money_id: item._id.toString()
                                    });
                                    //启动查询动作
                                    new RetrieveCharge(charge.id);
                                }
                            });
                        } else {
                            db.money.save(item);
                            result(res, {
                                statusCode: 900,
                                needCharge: true,
                                money_id: item._id.toString(),
                                money: item.money,
                                title: item.subject,
                                channel: item.channel
                            });
                            new RetrieveCharge(item._id.toString());
                        }
                    } else {
                        //如果积分足以抵扣，那么就不需要支付了，记录交易信息
                        item.status = 'paid';
                        item.client_status = 'success';
                        db.money.insert(item);
                        //给学生端扣除对应的抵扣积分
                        proxy.Bonus.rewardTeacher({
                            userID: req.body.userID,
                            bonus: bonus,
                            o_id: req.body.o_id
                        }, function () {
                        });
                        //给教师端增加相应的余额
                        proxy.User.incMoney(doc.t_id, amount);
                        //给客户端返回结果
                        result(res, {statusCode: 900, needCharge: false});
                    }
                    //记录订单已被打赏
                    db.orders.update({_id: doc._id}, {$set: {money_id: item._id.toString()}});
                } else {
                    result(res, {statusCode: 913, message: '订单id不存在！'});
                }
            }
        });
    });
};


function RetrieveCharge(id) {
    if (!id) {
        return;
    }
    new cronJob(new Date(Date.now() + 15000), cronTick, null, true);
    this.times = 0;
    var self = this;

    function cronTick() {
        log.trace('retrieve charge times: ' + self.times);
        if (self.times > 10) {
            return;
        }
        self.times++;
        retrievePayStatus(id, function (err, doc) {
            if (err) {
                console.log('retrieve charge error: ' + err.message);
                //self.times--;   //出错了，本次获取不算，5秒后再获取一次
                new cronJob(new Date(Date.now() + 10000), cronTick, null, true);
                return;
            }
            if (doc) {
                console.log('retrieve result false, start timer again.');
                new cronJob(new Date(Date.now() + 10000), cronTick, null, true);
            }
        });
        // proxy.Money.getMoneyInfoByChargeID(id, function (err, doc) {
        //     log.trace('pay status: ' + doc.status);
        //     if (err) {
        //         return;
        //     }
        //     if (!doc) {
        //         return;
        //     }
        //     if (doc.status != 'pending') {
        //         //只要不是pending状态，就不再继续
        //         return;
        //     }
        //     //继续获取charge状态
        //     pingpp.charges.retrieve(id, function (err, charge) {
        //         if (err) {
        //             new cronJob(new Date(Date.now() + 5000), cronTick, null, true);
        //         } else {
        //             if (charge.paid) {
        //                 //已支付，做相应操作(给教师加余额，给学生扣积分)
        //                 doc.status = 'paid';
        //                 doc.client_status = 'success';
        //                 doc.save(function (err2, doc2) {
        //                     if (err2) {
        //                         return;
        //                     }
        //                     //这里，打赏并且确认成功，才真正给教师增加余额，并且扣除掉学生的积分
        //                     proxy.User.incMoney(doc2.t_id, doc2.amount);
        //                     if (doc2.bonus > 0) {//
        //                         //给学生端扣除对应的抵扣积分
        //                         proxy.Bonus.rewardTeacher({
        //                             userID: doc2.userID,
        //                             bonus: doc2.bonus,
        //                             o_id: doc2.o_id
        //                         }, function () {
        //                         });
        //                     }
        //                 });
        //             } else {
        //                 //未支付，下一次查询
        //                 new cronJob(new Date(Date.now() + 5000), cronTick, null, true);
        //             }
        //         }
        //     });
        // });
    }
}
function getDateString() {
    var t = new Date();
    var year = (t.getFullYear()).toString();
    var month = (t.getMonth() + 1).toString();
    var date = (t.getDate()).toString();
    month = month.length < 2 ? ( '0' + month) : month;
    date = date.length < 2 ? ( '0' + date) : date;
    return year + '-' + month + '-' + date;
}