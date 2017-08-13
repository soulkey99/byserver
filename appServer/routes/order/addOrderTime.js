/**
 * Created by MengLei on 2015/8/17.
 */

var config = require('../../../config');
var result = require('../../utils/result');
var log = require('../../../utils/log').http;
var dnode = require('../../utils/dnodeClient');
var zrpc = require('../../../utils/zmqClient');


//订单增加答题时间(仅学生)，param={userID: '', o_id: '', addTime: ''}
module.exports = function (req, res) {
    var param = {o_id: req.body.o_id, addTime: parseFloat(req.body.addTime), userID: req.body.userID};
    zrpc('orderServer', 'addOrderTime', param, function (err, resp) {
        if (err) {
            result(res, {statusCode: resp || 905, message: err.message});
        } else {
            result(res, {statusCode: 900});
        }
    });
};
