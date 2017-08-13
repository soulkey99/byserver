/**
 * Created by MengLei on 2016/1/12.
 */

var proxy = require('./../../../common/proxy');
var result = require('../../utils/result');
var log = require('../../../utils/log').http;

//获取提现信息
module.exports = function(req, res) {
    var info = [];
    if (req.user.withdraw_info) {
        for (var i = 0; i < req.user.withdraw_info.length; i++) {
            info.push({
                type: req.user.withdraw_info[i].type,
                name: req.user.withdraw_info[i].name,
                id: req.user.withdraw_info[i].id,
                t: req.user.withdraw_info[i].t
            });
        }
        result(res, {statusCode: 900, info: info});
    } else {
        result(res, {statusCode: 900, info: info});
    }
};
