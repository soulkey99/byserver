/**
 * Created by MengLei on 2016/3/10.
 */
"use strict";
let result = require('../../utils/result');
let log = require('../../../utils/log');
let dnode = require('../../../utils/dnodeClient');
var zrpc = require('../../../utils/zmqClient');

module.exports = function (req, res) {
    //获取游戏任务列表
    zrpc('gameServer', 'request', {m: 'getMissionList', body: {userID: req.body.userID}}, function(err, resp){
        if(err){
            result(res, {statusCode: 905, message: err.message});
        } else {
            log.trace('get mission list response success');
            result(res, {statusCode: 900, list: resp});
        }
    });
};
