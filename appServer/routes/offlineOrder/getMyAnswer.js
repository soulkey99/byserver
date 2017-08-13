/**
 * Created by MengLei on 2015/8/31.
 */
"use strict";
const config = require('../../../config');
const result = require('../../utils/result');
const proxy = require('../../../common/proxy');
const log = require('../../../utils/log').http;
const dnode = require('../../utils/dnodeClient');
const zrpc = require('../../../utils/zmqClient');

//获取我回复过的离线问答，param={userID: '', u_id: '', startPos: '', pageSize: '', tab: 'time/collect/watch/reply'}
//如果传u_id，则取u_id的，否则获取我的
module.exports = function (req, res) {
    var param = {
        userID: req.body.userID
    };
    if (req.body.startPos) {
        param.startPos = req.body.startPos;
    }
    if (req.body.pageSize) {
        param.pageSize = req.body.pageSize;
    }
    if (req.body.tab) {
        param.tab = req.body.tab;
    }
    if (req.body.u_id) {
        param.u_id = req.body.u_id;
    }
    proxy.OfflineAnswer.getMyOfflineAnswers(param, (err, list)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        result(res, {statusCode: 900, list});
    });
    // zrpc('orderServer', 'getMyAnswer', param, function (err, resp) {
    //     if (err) {
    //         //
    //         log.error('get my offline topic error: ' + err.message);
    //         result(res, {statusCode: 905, message: err.message});
    //     } else {
    //         log.trace('get my offline topic request success.');
    //         result(res, {statusCode: 900, list: resp});
    //     }
    // });
};
