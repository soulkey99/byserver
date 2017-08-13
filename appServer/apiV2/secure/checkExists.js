/**
 * Created by MengLei on 2016/1/20.
 */

var proxy = require('../../../common/proxy');
var result = require('../../utils/result');

//检查是否设置过支付密码、密保问题
module.exports = function(req, res) {
    var param = {userID: req.body.userID};
    proxy.User.checkSecure(param, function (err, doc) {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        result(res, {statusCode: 900, info: doc});
    });
};
