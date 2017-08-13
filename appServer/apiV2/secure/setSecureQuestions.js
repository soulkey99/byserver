/**
 * Created by MengLei on 2016/1/20.
 */

var proxy = require('../../../common/proxy');
var result = require('../../utils/result');

//设置支付密码
module.exports = function(req, res) {
    var param = {userID: req.body.userID, answer1: req.body.answer1, answer2: req.body.answer2, answer3: req.body.answer3};
    proxy.User.setSecureQuestions(param, function (err) {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        result(res, {statusCode: 900});
    });
};
