/**
 * Created by MengLei on 2015/8/14.
 */

var config = require('../../../config');
var result = require('../../utils/result');
var dnode = require('../../utils/dnodeClient');
var log = require('../../../utils/log').http;
var zrpc = require('../../../utils/zmqClient');

//结束订单，param={o_id: '', userID: ''}
module.exports = function (req, res) {
    var param = {o_id: req.body.o_id, userID: req.body.userID};
    zrpc('orderServer', 'endOrder2', param, function (err, resp) {
        if (err) {
            return result(res, {statusCode: resp || 905, message: err.message});
        }
        result(res, {statusCode: 900});
    });
};
