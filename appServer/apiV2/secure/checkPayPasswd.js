/**
 * Created by MengLei on 2016/1/20.
 */

var proxy = require('../../../common/proxy');
var result = require('../../utils/result');

//校验支付密码
module.exports = function(req, res) {
    var param = {userID: req.body.userID, passwd: req.body.passwd};
    proxy.User.checkPayPasswd(param, function (err) {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        result(res, {statusCode: 900});
    });
};

