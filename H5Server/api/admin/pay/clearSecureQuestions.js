/**
 * Created by MengLei on 2016/2/17.
 */

var proxy = require('../../../../common/proxy');
var eventproxy = require('eventproxy');
var result = require('./../../../utils/result');

//管理员清空用户的密保问题
module.exports = function(req, res) {
    var ep = new eventproxy();
    ep.all('u_id', function (u_id) {
        proxy.User.clearSecureQuestions(u_id, function (err2) {
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
        return ep.emit('u_id', req.body.u_id);
    } else {
        proxy.User.getUserByPhone(req.body.phone, ep.done('u_id', function (doc) {
            if (!doc) {
                ep.unbind();
                return result(res, {statusCode: 902, message: '用户不存在！'});
            }
            return doc._id;
        }));
    }
};
