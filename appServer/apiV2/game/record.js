/**
 * Created by MengLei on 2016/2/2.
 */

var result = require('../../utils/result');
var dnode = require('../../../utils/dnodeClient');
var zrpc = require('../../../utils/zmqClient');

//获取战绩
module.exports = function (req, res) {
    var param = {m: 'getRecord', body: {userID: req.body.userID}};
    zrpc('gameServer', 'request', param, function (err, resp) {
        if (err) {
            result(res, {statusCode: 905, message: err.message});
        } else {
            result(res, {statusCode: 900, record: resp});
        }
    });
};