/**
 * Created by MengLei on 2015/3/25.
 */

var config = require('../../../config');
var result = require('../../utils/result');
var log = require('../../../utils/log').http;
var proxy = require('../../../common/proxy');
var eventproxy = require('eventproxy');
var point2level = require('../../utils/point2level');

module.exports = function (req, res) {
    proxy.Order.getOrderDetail(req.body.o_id, req.body.userID, function(err, doc){
        if(err){
            return result(res, {stautsCode: 905, message: err.message});
        }
        if(!doc){
            return result(res, {statusCode: 913, message: '订单o_id不存在！'});
        }
        result(res, {statusCode: 900, orderInfo: doc});
    });
};