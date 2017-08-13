/**
 * Created by MengLei on 2015/5/19.
 */
"use strict";
const config = require('../../../config');
const objectId = require('mongojs').ObjectId;
const result = require('../../utils/result');
const db = config.db;
const ipAddr = require('../../../utils/ipAddr');
const log = require('../../../utils/log').http;
const cronJob = require('cron').CronJob;
var retrieveCharge = require('./utils/retrieveCharge');
const retrievePayStatus = require('./utils/retrievePayStatus');
var pingpp = require('pingpp')(config.pingxxKey_test);
const proxy = require('../../../common/proxy');
if (config.production_mode == 'true') {
    pingpp = require('pingpp')(config.pingxxKey_live);
}
const BCRESTAPI = require('beecloud-node-sdk');
const API = new BCRESTAPI();
API.registerApp(config.bcloud.app_id, config.bcloud.app_secret, config.bcloud.master_secret, config.bcloud.test_secret);
if (process.env.NODE_ENV != 'production') {
    API.setSandbox(true);//开启测试模式 不设置就是不开启
}

module.exports = function (req, res) {
    //
    var _id = new objectId();
    //如果传递了订单id，那么就取订单id，否则生成一个新的订单id
    if (req.body.money_id) {
        try {
            _id = new objectId(req.body.money_id);
        } catch (ex) {
            log.error('charge, input money_id error: ' + ex.message);
            result(res, {statusCode: 919, message: ex.message});
            return;
        }
    }
    //该区域两个if判断为游戏商城做兼容，当充值数值以 _t 结尾的时候，认为是兼容游戏商城购买体力，
    //当充值数值以 _f 结尾的时候，认为是游戏商城购买学分，分别添加对应参数并同时跳转对应的功能，而不进行充值的购买。
    if (req.body.amount.lastIndexOf('_t') >= 0) {
        req.body.strength = Number.parseInt(req.body.amount);
        return require('./gameBuy')(req, res);
    }
    if (req.body.amount.lastIndexOf('_f') >= 0) {
        req.body.bonus = Number.parseInt(req.body.amount);
        return require('./gameBuy')(req, res);
    }
    var amount = 0;
    try {
        amount = parseInt(req.body.amount);
    } catch (ex) {
        log.error('charge, input amount error: ' + ex.message);
        result(res, {statusCode: 905, message: '输入充值数额有误！'});
        return;
    }
    if ([500, 1000, 2000, 5000, 10000, 20000].indexOf(amount) < 0) {
        return result(res, {statusCode: 905, message: '输入充值金额有误！'});
    }
    var item = {
        _id: _id,
        userID: req.body.userID,
        type: 'charge',
        channel: req.body.channel || 'alipay',
        amount: amount,
        money: amount,
        currency: 'cny',
        subject: '学生端充值-' + getDateString(),
        status: 'pending',
        client_status: 'pending',
        createTime: (new Date()).getTime()
    };
    //几款优惠政策
    if (amount == 2000) {
        item.money = 1500;
        // if (Date.now() > new Date('2016-06-01 00:00:00').getTime()) {//六月一号活动价格
        //     item.money = 1000;
        // }
    } else if (amount == 10000) {
        item.money = 9000;
    } else if (amount == 20000) {
        item.money = 18000;
    }
    if (item.channel == 'alipay') {
        pingpp.charges.create({
            order_no: _id.toString(),
            app: {id: config.pingxxID_s},
            channel: item.channel,
            amount: item.money,
            client_ip: ipAddr(req) || '127.0.0.1',
            currency: item.currency,
            subject: 'charge' + getDateString(),
            body: 'charge' + getDateString()
        }, function (err, charge) {
            if (err) {
                log.error('create charge object error: ' + err.message);
                return result(res, {statusCode: 905, message: err.message});
            }
            item.charge = charge;
            db.money.save(item);
            result(res, {
                statusCode: 900,
                charge: charge,
                money_id: item._id.toString(),
                money: item.money,
                title: item.subject,
                channel: item.channel
            });
            //启动查询动作
            new RetrieveCharge(item._id.toString());
        });
    } else {
        db.money.save(item);
        result(res, {
            statusCode: 900,
            money_id: item._id.toString(),
            money: item.money,
            title: item.subject,
            channel: item.channel
        });
        new RetrieveCharge(item._id.toString());
    }
};

function RetrieveCharge(id) {
    if (!id) {
        return;
    }
    new cronJob(new Date(Date.now() + 15000), cronTick, null, true);
    this.times = 0;
    var self = this;

    function cronTick() {
        console.log('retrieve charge times: ' + self.times);
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
        // return;
        // proxy.Money.getMoneyInfoByChargeID(id, function (err, doc) {
        //     console.log('pay status: ' + doc.status);
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
        //         if (err) {//查询出错了，5秒钟后下次查询，本次查询不计数
        //             self.times--;
        //             return new cronJob(new Date(Date.now() + 5000), cronTick, null, true);
        //         }
        //         if (charge.paid) {
        //             //已支付，给学生加余额
        //             doc.status = 'paid';
        //             doc.client_status = 'success';
        //             doc.save(function (err2, doc2) {
        //                 if (err2) {
        //                     return;
        //                 }
        //                 //这里，打赏并且确认成功，才真正给学生增加余额
        //                 proxy.User.incStudentMoney(doc2.userID, doc2.amount);
        //             });
        //         } else {
        //             //未支付，10秒后下一次查询
        //             new cronJob(new Date(Date.now() + 10000), cronTick, null, true);
        //         }
        //     });
        // });
    }
}

//test({body:{o_id: '555cb69bd4863cb8543ad0a5', amount: 10}}, {end: function(str){console.log(str); }, setHeader: function(){}});
function getDateString() {
    var t = new Date();
    var year = (t.getFullYear()).toString();
    var month = (t.getMonth() + 1).toString();
    var date = (t.getDate()).toString();
    month = month.length < 2 ? ( '0' + month) : month;
    date = date.length < 2 ? ( '0' + date) : date;
    return year + '-' + month + '-' + date;
}

function bcloud_charge(req, res) {
    //
}