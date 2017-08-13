/**
 * Created by MengLei on 2016/3/24.
 */
"use strict";

let zrpc = require('../../../utils/zmqClient');
let result = require('../../utils/result');

//付费订单开始计费
module.exports = function (req, res) {
    let param = {userID: req.body.userID, o_id: req.body.o_id};
    zrpc('orderServer', 'transferOrderType', param, function (err, resp) {
        if(err){
            return result(res, {statusCode: resp || 905, message: err.message});
        }
        result(res, {statusCode: 900, o_id: resp.o_id});
    });
};
