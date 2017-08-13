/**
 * Created by MengLei on 2015/5/11.
 */

var config = require('../../../config');
var result = require('../../utils/result');
var log = require('../../../utils/log').http;
var dnode = require('../../utils/dnodeClient');

module.exports = function (req, res) {
    //订单追加小费
    var http = require('http');
    var o_id = req.body.o_id;
    var addPrice = req.body.addPrice;
    dnode('orderServer', 'addOrderPrice', {o_id: o_id, addPrice: addPrice, userID: req.body.userID}, function(err, resp){
        if(err){
            result(res, {statusCode: 905, message: err});
        }else {
            result(res, resp);
        }
    });
};