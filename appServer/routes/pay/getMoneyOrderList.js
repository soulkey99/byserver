/**
 * Created by MengLei on 2015/5/11.
 */

var proxy = require('./../../../common/proxy');
var result = require('../../utils/result');
var log = require('../../../utils/log').http;

//获取资金订单列表
module.exports = function(req, res) {
    var param = {userID: req.body.userID, userType: req.body.userType, startPos: req.body.startPos, pageSize: req.body.pageSize, startTime: req.body.startTime, endTime: req.body.endTime, type: req.body.type, status: req.body.status};
    //获取账户资金记录
    proxy.Money.getMoneyList(param, function(err, doc){
        if(err){
            return result(res, {statusCode: 905, message: err.message});
        }
        log.trace('get money order list success');
        result(res, {statusCode: 900, list: doc});
    });
};
