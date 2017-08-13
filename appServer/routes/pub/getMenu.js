/**
 * Created by MengLei on 2015/11/27.
 */

var result = require('../../utils/result');
var log = require('../../../utils/log').http;
var dnode = require('../../utils/dnodeClient');

//获取公众号菜单
module.exports = function(req, res) {
    var param = {
        userID: req.body.userID,
        pub_id: req.body.pub_id
    };
    dnode('orderServer', 'getPubMenu', param, function (err, resp) {
        if (err) {
            result(res, {statusCode: 905, message: err});
        } else {
            log.trace('get pub history request success.');
            result(res, resp);
        }
    });
};
