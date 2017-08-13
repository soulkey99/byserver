/**
 * Created by MengLei on 2016/2/4.
 */

var config = require('../../../config');
var result = require('../../utils/result');
var dnode = require('../../../utils/dnodeClient');
var zrpc = require('../../../utils/zmqClient');

module.exports = function (req, res) {
    //获取游戏关卡
    zrpc('gameServer', 'request', {m: 'getLevels', body: {userID: req.body.userID}}, function(err, resp){
        if(err){
            result(res, {statusCode: 905, message: err.message});
        } else {
            result(res, {statusCode: 900, list: resp});
        }
    });
};
