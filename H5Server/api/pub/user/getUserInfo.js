/**
 * Created by MengLei on 2015/12/1.
 */

var result = require('./../../../utils/result');

//公众号用户获取自己的用户信息
module.exports = function(req, res){
    var resp = {
        statusCode: 900,
        userID: req.user._id.toString(),
        nick: req.user.nick,
        status: req.user.status,
        userInfo: req.user.userInfo,
        intro: req.user.intro,
        email: req.user.email
    };
    result(res, resp);
};
