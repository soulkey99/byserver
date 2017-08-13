/**
 * Created by MengLei on 2016-06-16.
 */
"use strict";

const proxy = require('../../../common/proxy');
const result = require('../../utils/result');

module.exports = function (req, res) {
    proxy.Money.getMoneyInfoByID(req.body.money_id, (err, money) => {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        if (!money) {
            return result(res, {statusCode: 956, message: '支付订单ID不存在！'});
        }
        result(res, {
            statusCode: 900,
            money_id: req.body.money_id,
            charge: money.charge,
            money: money.money,
            title: money.subject,
            channel: money.channel
        });
    })
};
