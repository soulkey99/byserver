/**
 * Created by MengLei on 2016/2/25.
 */

var proxy = require('../../../../common/proxy');
var eventproxy = require('eventproxy');
var result = require('./../../../utils/result');

//管理员端获取用户的提现
module.exports = function(req, res) {
    var ep = new eventproxy();
    ep.all('user', function (user) {
        if (!user) {
            return result(res, {statusCode: 902, message: '用户不存在！'});
        }
        return result(res, {statusCode: 900, info: user.withdraw_info.toObject()});
    });
    ep.fail(function (err) {
        return result(res, {statusCode: 905, message: err.message});
    });
    if (req.body.u_id) {
        proxy.User.getUserById(req.body.u_id, ep.done('user'));
    } else {
        proxy.User.getUserByPhone(req.body.phone, ep.done('user'));
    }
};
