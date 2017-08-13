/**
 * Created by MengLei on 2016/2/25.
 */

var proxy = require('../../../../common/proxy');
var eventproxy = require('eventproxy');
var result = require('./../../../utils/result');

//管理员端清空用户的提现信息
module.exports = function(req, res) {
    var ep = new eventproxy();
    ep.all('user', function (user) {
        if (!user) {
            return result(res, {statusCode: 902, message: '用户不存在！'});
        }
        user.withdraw_info = [];
        user.save(function (err2) {
            if (err2) {
                return result(res, {statusCode: 905, message: err2.message});
            }
            return result(res, {statusCode: 900});
        });
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
