/**
 * Created by MengLei on 2015/3/5.
 */

var config = require('../../../config');
var result = require('../../utils/result');
var log = require('../../../utils/log').http;
var dnode = require('../../utils/dnodeClient');
var zrpc = require('../../../utils/zmqClient');

//取消订单，param={userID: '', o_id: ''}
module.exports = function (req, res) {
    var param = {o_id: req.body.o_id, userID: req.body.userID};
    zrpc('orderServer', 'cancelOrder2', param, function (err, resp) {
        if (err) {
            return result(res, {statusCode: resp || 905, message: err.message});
        }
        result(res, {statusCode: 900});
    });
};
