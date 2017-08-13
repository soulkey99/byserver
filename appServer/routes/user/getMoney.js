/**
 * Created by MengLei on 2015/4/21.
 */
"use strict";
var proxy = require('./../../../common/proxy');
var result = require('../../utils/result');
var log = require('../../../utils/log').http;

module.exports = function (req, res) {
    //获取账户余额
    proxy.User.getUserById(req.body.userID, (err, user)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        if (user.userType == 'teacher') {
            var money_info = {
                money: 0,
                withdrawing: 0,
                withdrawn: 0
            };
            if (user.userInfo.money_info) {
                money_info = user.userInfo.money_info.toObject();
            }
            proxy.User.checkSecure({userID: req.body.userID}, function (err, doc) {
                if (err) {
                    return result(res, {statusCode: 905, message: err.message});
                }
                var withdraw_info = user.withdraw_info.toObject();
                result(res, {
                    statusCode: 900,
                    money_info: money_info,
                    has_withdraw_info: withdraw_info.length > 0,
                    has_pay_passwd: doc.passwd,
                    has_secure_questions: doc.questions
                });
            });
        } else {
            result(res, {statusCode: 900, money: user.userInfo.money});
        }
    });
};
