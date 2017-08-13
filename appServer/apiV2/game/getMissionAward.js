/**
 * Created by MengLei on 2016/3/11.
 */
"use strict";
let result = require('../../utils/result');
let log = require('../../../utils/log').http;
let dnode = require('../../../utils/dnodeClient');
var zrpc = require('../../../utils/zmqClient');

module.exports = function (req, res) {
    //获取游戏任务奖励
    zrpc('gameServer', 'request', {m: 'getMissionAward', body: {userID: req.body.userID, identifier: req.body.identifier}}, function(err, resp){
        if(err){
            result(res, {statusCode: 905, message: err.message});
        } else {
            log.trace('get mission award response success');
            result(res, {statusCode: 900, award: resp});
        }
    });
};

