/**
 * Created by MengLei on 2016/3/17.
 */
"use strict";
let config = require('../../../config');
let result = require('../../utils/result');
var zrpc = require('../../../utils/zmqClient');
let log = require('../../../utils/log').http;

//下单，即时问题param={orderInfo: '', userID: ''}
module.exports = function (req, res) {
    let param = {userID: req.body.userID, o_id: req.body.o_id};
    zrpc('orderServer', 'getPerformance', param, function (err, resp) {
        if (err) {
            return result(res, {statusCode: resp || 905, message: err.message});
        }
        log.trace('get order performance response success.');
        resp['statusCode'] = 900;
        result(res, resp);
    });
};