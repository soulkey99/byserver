/**
 * Created by MengLei on 2016/1/15.
 */

var proxy = require('../../../../common/proxy');
var eventproxy = require('eventproxy');
var result = require('./../../../utils/result');

//管理员端获取支付订单列表
module.exports = function(req, res) {
    var param = {
        startPos: req.body.startPos,
        pageSize: req.body.pageSize,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        type: req.body.type,
        channel: req.body.channel,
        status: req.body.status
    };
    var ep = new eventproxy();
    ep.all('param', function (param) {
        proxy.Money.getAdminMoneyList(param, function (err, doc, total) {
            if (err) {
                return result(res, {statusCode: 905, message: err.message});
            }
            result(res, {statusCode: 900, list: doc, total: total});
        });
    });
    ep.fail(function (err) {
        return result(res, {statusCode: 905, message: err.message});
    });
    if (req.body.phone) {
        proxy.User.getUserByPhone(req.body.phone, ep.done('param', function(doc){
            if(doc){
                param.u_id = doc._id.toString();
            }
            return param;
        }));
    }else{
        ep.emit('param', param);
    }
};
