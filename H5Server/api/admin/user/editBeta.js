/**
 * Created by MengLei on 2016/2/4.
 */

var result = require('./../../../utils/result');
var log = require('../../../../utils/log').h5;
var eventproxy = require('eventproxy');
var proxy = require('../../../../common/proxy');

//编辑beta配置
module.exports = function(req, res) {
    if (req.body.action == 'remove') {
        proxy.Beta.removeBeta(req.body.beta_id, function (err) {
            if (err) {
                return result(res, {statusCode: 905, message: err.message});
            }
            result(res, {statusCode: 900});
        });
    } else {
        if (!req.body.u_id) {
            return result(res, {statusCode: 902, message: 'u_id参数为空！'});
        }
        var param = {
            userID: req.body.u_id,
            start_time: req.body.start_time,
            end_time: req.body.end_time,
            platform: req.body.platform,
            userType: req.body.userType,
            config: req.body.config
        };
        if (req.body.beta_id) {
            param.beta_id = req.body.beta_id;
        }
        proxy.Beta.editBeta(param, function (err) {
            if (err) {
                return result(res, {statusCode: 905, message: err.message});
            }
            result(res, {statusCode: 900});
        });
    }
};
