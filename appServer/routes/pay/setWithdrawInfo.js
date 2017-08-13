/**
 * Created by MengLei on 2016/1/12.
 */

var result = require('../../utils/result');
var checkSMSCode = require('../../../utils/checkSMSCode');
var eventproxy = require('eventproxy');
var proxy = require('../../../common/proxy');

//设置提现账户
module.exports = function(req, res) {
    if (!req.body.type) {
        return result(res, {statusCode: 959, message: '绑定、解绑提现账户失败，账户类型为空！'});
    }
    var param = {
        userID: req.body.userID,
        type: req.body.type
    };
    var ep = new eventproxy();
    ep.all('checksms', function (sms) {
        if (sms) { //成功，可以继续
            proxy.User.setWithdrawInfo(param, function (err) {
                if (err) {
                    return result(res, {statusCode: 905, message: err.message});
                }
                return result(res, {statusCode: 900});
            });
        } else { //短信验证失败，返回错误
            return result(res, {statusCode: 959, message: '绑定、解绑提现账户失败，短信验证码错误！'});
        }
    });
    ep.fail(function (err) {
        return result(res, {statusCode: 905, message: err.message});
    });
    if (req.body.action == 'un') {
        param['action'] = 'un';
        //解绑不需要验证，直接返回成功即可
        return ep.emit('checksms', true);
    } else {
        if (!req.body.smscode) {
            return result(res, {statusCode: 959, message: '绑定、解绑提现账户失败，请输入短信验证码！'});
        }
        if (!req.body.withdrawID) {
            return result(res, {statusCode: 959, message: '绑定、解绑提现账户失败，账户id为空！'});
        }
        if (!req.body.withdrawName) {
            return result(res, {statusCode: 959, message: '绑定、解绑提现账户失败，账户名为空！'});
        }
        param['id'] = req.body.withdrawID;
        param['name'] = req.body.withdrawName;
        checkSMSCode(req.user.phone, req.body.smscode, ep.done('checksms', function(resp){
            return !resp.code;
        }));
    }
};
