/**
 * Created by MengLei on 2016/2/24.
 */

var proxy = require('../../../../common/proxy');
var eventproxy = require('eventproxy');
var result = require('./../../../utils/result');

//管理员设置用户支付状态
module.exports = function(req, res) {
    var param = {
        u_id: req.body.u_id,
        money_id: req.body.money_id,
        transaction_no: req.body.transaction_no,
        status: req.body.status,
        desc: req.body.desc
    };
    proxy.Money.adminSetMoneyStatus(param, function (err, doc) {
        if(err){
            return result(res, {statusCode: 905, message: err.message});
        }
        if(!doc){
            return result(res, {statusCode: 905, message: '支付订单id不存在！'});
        }
        return result(res, {statusCode: 900});
    });
};

