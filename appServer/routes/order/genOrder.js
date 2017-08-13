/**
 * Created by MengLei on 2015/3/5.
 */
"use strict";
const config = require('../../../config');
const result = require('../../utils/result');
const dnode = require('../../utils/dnodeClient');
const zrpc = require('../../../utils/zmqClient');
const log = require('../../../utils/log').http;

//下单，即时问题param={orderInfo: '', userID: ''}
module.exports = function (req, res) {
    config.db.orders.count({s_id: req.body.userID, status: 'pending'}, (err, count)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        if (count > 0) {
            log.error(`genOrder error, userID: ${req.body.userID}, pending count: ${count}`);
            return result(res, {statusCode: 929, message: '有订单尚未被接单，不能继续提问！'});
        }
        let param = {userID: req.body.userID, orderInfo: req.body.orderInfo};
        zrpc('orderServer', 'genOrder2', param, function (err, resp) {
            if (err) {
                return result(res, {statusCode: resp || 905, message: err.message});
            }
            result(res, {statusCode: 900, o_id: resp.o_id});
        });
    });
};
