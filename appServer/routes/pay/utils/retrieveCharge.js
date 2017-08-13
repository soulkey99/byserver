/**
 * Created by MengLei on 2016/1/14.
 */
"use strict";
const config = require('../../../../config');
const log = require('../../../../utils/log');
const proxy = require('../../../../common/proxy');
const db = config.db;
let pingpp = require('pingpp')(config.pingxxKey_test);
const BCRESTAPI = require('beecloud-node-sdk');
const API = new BCRESTAPI();
API.registerApp(config.bcloud.app_id, config.bcloud.app_secret, config.bcloud.master_secret, config.bcloud.test_secret);
if (config.production_mode == 'true') {
    pingpp = require('pingpp')(config.pingxxKey_live);
}
if (process.env.NODE_ENV != 'production') {
    API.setSandbox(true);
}

module.exports = function (id, callback) {
    if (!callback) {
        callback = function () {
        };
    }
    proxy.Money.getMoneyInfoByChargeID(id, function (err, doc) {
        if (err) {
            return callback(err, true);
        }
        // log.trace('get money by charge id: ' + JSON.stringify(doc));
        if (!doc) {
            //无记录，不再继续
            return callback(null, false);
        }
        if (doc.status != 'pending') {
            //只要不是pending状态，就不再继续
            return callback(null, false);
        }
        if (doc.channel == 'alipay') {
            //继续获取charge状态
            pingpp.charges.retrieve(id, function (err, charge) {
                if (err) {
                    return callback(err, true);
                }
                // log.trace(`retrive charge: ${JSON.stringify(charge)}`);
                if (charge.paid) {
                    //已支付，做相应操作(给教师加余额，给学生扣积分)
                    doPaid(doc, callback);
                } else {
                    callback(null, true);
                }
            });
        } else {
        }
    });
};

function doPaid(doc, callback) {
    let setObj = {status: 'paid', client_status: 'success'};
    db.money.findAndModify({
        query: {_id: doc._id, status: 'pending'},
        update: {$set: setObj},
        new: true
    }, function (err2, doc2) {
        // log.trace(`modify money info: ${JSON.stringify(doc2)}`);
        if (err2) {
            return callback(err2, true);
        }
        if (!doc2) {  //之前就成功了
            return callback(null, false);
        }
        if (doc2.status == 'paid') {//这次修改成功的
            // console.log(JSON.stringify(doc2));
            if (doc2.type == 'rewardTeacher') {
                //这里，打赏并且确认成功，才真正给教师增加余额，并且扣除掉学生的积分
                proxy.User.incMoney(doc2.t_id, doc2.amount);
                if (doc2.bonus > 0) {//
                    //给学生端扣除对应的抵扣积分
                    proxy.Bonus.rewardTeacher({
                        userID: doc2.userID,
                        bonus: doc2.bonus,
                        o_id: doc2.o_id
                    }, function () {
                    });
                }
            } else if (doc2.type == 'charge') { //给学生端充值
                // log.trace(`charge for userID: ${doc2.userID}, amount: ${doc2.amount}`);
                proxy.User.incStudentMoney(doc2.userID, doc2.amount);
            } else if (doc2.type == 'gameBuyBonus') {  //游戏购买学分
                // log.trace(`add game bonus for userID: ${doc2.userID}, bonus: ${doc2.bonus}`);
                proxy.GameUserRecord.addBonus({
                    userID: doc2.userID,
                    bonus: doc2.bonus,
                    desc: doc2.subject
                });
            } else if (doc2.type == 'gameBuyStrength') { //游戏购买体力
                // log.trace(`add game strength for userID: ${doc2.userID}, strength: ${doc2.strength}`);
                proxy.GameUserRecord.addBonus({
                    userID: doc2.userID,
                    strength: doc2.strength,
                    desc: doc2.subject
                });
            }
            return callback(null, false);
        }
    });
}