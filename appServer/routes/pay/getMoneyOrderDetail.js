/**
 * Created by MengLei on 2015/5/13.
 */

var proxy = require('./../../../common/proxy');
var result = require('../../utils/result');
var log = require('../../../utils/log').http;

module.exports = function(req, res) {
    //获取账户消费订单明细
    proxy.Money.getDetail(req.body.money_id, function(err, doc){
        if(err){
            return result(res, {statusCode: 905, message: err.message});
        }
        log.trace('get money order detail success.');
        result(res, {statusCode: 900, detail: doc});
    });
};
