/**
 * Created by MengLei on 2016-06-03.
 */
"use strict";
const config = require('../../../config');
const objectId = require('mongojs').ObjectId;
const co = require('co');
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

//用于游戏商城购买学分与体力
module.exports = function (req, res) {
    let _id = new objectId();
    let item = {
        _id: _id,
        userID: req.body.userID,
        type: '',
        channel: req.body.channel || 'alipay',
        amount: 0,
        money: 0,
        currency: 'cny',
        subject: '',
        status: 'pending',
        client_status: 'pending',
        createTime: Date.now()
    };
    if (req.body.bonus) { //购买学分
        item.type = 'gameBuyBonus';
        item.subject = '游戏中购买学分-' + getDateString();
        item.bonus = Number.parseInt(req.body.bonus);
        if (item.bonus == 500) {
            item.amount = 500;
            item.money = 500;
        } else if (item.bonus == 1050) {
            item.amount = 1000;
            item.money = 1000;
        } else if (item.bonus == 5750) {
            item.amount = 5000;
            item.money = 5000;
        } else {
            return result(res, {statusCode: 905, message: '输入数值有误！'});
        }
    } else if (req.body.strength) {    //购买体力
        item.type = 'gameBuyStrength';
        item.subject = '游戏中购买体力-' + getDateString();
        item.strength = Number.parseInt(req.body.strength);
        if (item.strength == 5) {
            item.amount = 100;
            item.money = 100;
        } else if (item.strength == 17) {
            item.amount = 300;
            item.money = 300;
        } else if (item.strength == 58) {
            item.amount = 1000;
            item.money = 1000;
        } else {
            return result(res, {statusCode: 905, message: '输入数值有误！'});
        }
    } else {
        return result(res, {statusCode: 905, message: '请输入购买的体力或者学分数额！'});
    }
    if (item.channel == 'alipay') {
        pingpp.charges.create({
            order_no: _id.toString(),
            app: {id: config.pingxxID_s},
            channel: item.channel,
            amount: item.money,
            client_ip: ipAddr(req) || '127.0.0.1',
            currency: item.currency,
            subject: 'gameBuy' + getDateString(),
            body: 'gameBuy' + getDateString()
        }, (err, charge) => {
            if (err) {
                log.error('game buy create charge object error: ' + err.message);
                return result(res, {statusCode: 905, message: err.message});
            }
            item.charge = charge;
            db.money.save(item, err => {
                if (err) {
                    return result(res, {statusCode: 905, message: err.message});
                }
                result(res, {statusCode: 900, charge: charge, money_id: item._id.toString()});
                new RetrieveCharge(item._id.toString());
            })
        })
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
                // self.times--;   //出错了，本次获取不算，5秒后再获取一次
                console.log('retrieve charge error: ' + err.message);
                new cronJob(new Date(Date.now() + 10000), cronTick, null, true);
                return;
            }
            if (doc) {
                console.log('retrieve result false, start timer again.');
                new cronJob(new Date(Date.now() + 10000), cronTick, null, true);
            }
        });
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
