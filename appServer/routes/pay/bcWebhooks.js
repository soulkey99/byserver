/**
 * Created by MengLei on 2016-12-19.
 */
"use strict";
var config = require('../../../config');
var db = config.db;
var proxy = require('./../../../common/proxy');
var log = require('../../../utils/log').http;
var addMoney = require('./addMoney');
const retrievePayStatus = require('./utils/retrievePayStatus');

module.exports = function (req, res) {
    log.trace('log webhook: ' + JSON.stringify(req.body));
    console.log(JSON.stringify(req.body));
    req.body.hook_type = 'beecloud';
    db.webhooks.insert(req.body);
    retrievePayStatus(req.body.transaction_id);
    res.end('success');
};
/**
 *
 {
    "sign": "5c06c442b62f74c68e9cf6e161b269a0",
    "timestamp": "1482118924000",
    "channel_type": "ALI",
    "trade_success": true,
    "transaction_type": "PAY",
    "sub_channel_type": "test",
    "transaction_id": "test",
    "transaction_fee": "1",
    "optional": {
        "test": "test"
    },
    "message_detail": {
        "trade_status": "TRADE_SUCCESS",
        "trade_no": "test_trade_no",
        "out_trade_no": "test_out_trade_no",
        "buyer_email": "test_buyer_email",
        "total_fee": "0.10",
        "price": "0.10",
        "subject": "test",
        "discount": "0.00",
        "gmt_create": "2015-05-23 22:26:20",
        "notify_type": "test",
        "quantity": "1",
        "seller_id": "test",
        "buyer_id": "test",
        "use_coupon": "N",
        "notify_time": "2015-05-23 22:26:20",
        "body": "test",
        "seller_email": "test",
        "notify_id": "test",
        "sign_type": "RSA",
        "sign": "test"
    }
}
 */