/**
 * Created by MengLei on 2015/8/12.
 */

var config = require('../../../config');
var result = require('../../utils/result');
var log = require('../../../utils/log').http;
var dnode = require('../../utils/dnodeClient');
var zrpc = require('../../../utils/zmqClient');

//从普通订单转为自由答订单param={userID: '', o_id: '', topic: ''}
module.exports = function(req, res){
    var param = {
        userID: req.body.userID,
        topic: req.body.topic,
        o_id: req.body.o_id
    };
    zrpc('orderServer', 'transferFromOrder', param, function(err, resp){
        if(err){
            //
            log.error('transfer from order error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        }else{
            log.trace('transfer from order request success.');
            result(res, {statusCode: 900, detail: resp});
        }
    });
};

