/**
 * Created by MengLei on 2016/1/13.
 */
"use strict";
const proxy = require('./../../../common/proxy');
const eventproxy = require('eventproxy');
const result = require('../../utils/result');
const db = require('../../../config').db;
const objectId = require('mongojs').ObjectId;
const log = require('../../../utils/log').http;

//教师端提现
module.exports = function (req, res) {
    let param = {userID: req.body.userID, passwd: req.body.passwd};
    let ep = new eventproxy();
    ep.all('user', 'userConf', (user, userConf)=> {
        if (req.body.money && req.body.money <= user.userInfo.money_info.money) {
            param.money = req.body.money;
        } else {
            return result(res, {statusCode: 897, message: '提现失败，余额不足！'});
        }
        if (userConf && userConf.type == 'teacher') {
            return result(res, {statusCode: 899, message: '提现失败，政策限制禁止提现！'});
        }
        proxy.User.checkPayPasswd(param, function (err, doc) {
            if (err) {
                return result(res, {statusCode: 905, message: err.message});
            }
            if (!doc) {   //支付密码错误
                return result(res, {statusCode: 898, message: '提现失败，支付密码错误！'});
            }
            proxy.Money.monthWithdrawCount(param.userID, function (err2, doc2) {
                if (err2) {
                    return result(res, {statusCode: 905, message: err2.message});
                }
                if (doc2 > 0) {
                    return result(res, {statusCode: 899, message: '提现失败，本月提现超过规定次数！'});
                }
                proxy.Money.withdraw(param, function (err3, doc3) {
                    if (err3) {
                        return result(res, {statusCode: 905, message: err3.message});
                    }
                    return result(res, {statusCode: 900, money_id: doc3.money_id});
                });
            });
        });
    });
    ep.fail((err)=> {
        return result(res, {statusCode: 905, message: err.message});
    });
    db.userConf.findOne({phonenum: req.body.phone}, ep.done('userConf'));
    db.users.findOne({_id: new objectId(req.body.userID)}, {'userInfo.money_info': 1}, ep.done('user'));

};
