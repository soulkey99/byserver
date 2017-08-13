/**
 * Created by MengLei on 2016/2/3.
 */

var config = require('../../../config');
var result = require('../../utils/result');
var dnode = require('../../../utils/dnodeClient');
var zrpc = require('../../../utils/zmqClient');

module.exports = function (req, res) {
    //回答问题
    zrpc('gameServer', 'request', {m: 'getStrength', body: {userID: req.body.userID, battle_id: req.body.battle_id}}, function(err, resp){
        if(err){
            result(res, {statusCode: 905, message: err.message});
        } else {
            result(res, {statusCode: 900, result: resp});
        }
    });
};

