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

//获取我提出的离线问答，param={userID: '', u_id: '', startPos: '', pageSize: '', tab: 'time/collect/watch/reply'}
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
    if (req.body.type) {
        //type=reply，获取我回答过的离线提问列表
        param.type = req.body.type;
    }
    //如果传u_id，那么就取u_id对应的信息，否则取userID对应的信息
    if (req.body.u_id) {
        param.u_id = req.body.u_id;
    }
    proxy.OfflineTopic.getMyOfflineTopics(param, (err, list)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        result(res, {statusCode: 900, list});
    });

    // zrpc('orderServer', 'getMyOrder', param, function (err, resp) {
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
