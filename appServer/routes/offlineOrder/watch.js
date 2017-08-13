/**
 * Created by MengLei on 2015/8/26.
 */
"use strict";
const config = require('../../../config');
const result = require('../../utils/result');
const proxy = require('../../../common/proxy');
const log = require('../../../utils/log').http;
const dnode = require('../../utils/dnodeClient');
const zrpc = require('../../../utils/zmqClient');

//关注离线问答，param={userID: '', off_id: '', action: ''}
module.exports = function (req, res) {
    if (req.body.action == 'un') {
        proxy.TopicWatch.removeWatch(req.body.off_id, req.body.userID, handleCB);
    } else {
        proxy.TopicWatch.addWatch(req.body.off_id, req.body.userID, handleCB);
    }
    function handleCB(err, doc) {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        if (!doc) {
            return result(res, {statusCode: 914, message: '离线问题不存在！'});
        }
        result(res, {statusCode: 900});
    }
    // var param = {
    //     userID: req.body.userID,
    //     off_id: req.body.off_id
    // };
    // if (req.body.action) {
    //     param.action = req.body.action;
    // }
    // zrpc('orderServer', 'watchTopic', param, function (err, resp) {
    //     if (err) {
    //         //
    //         log.error('watch offline topic error: ' + err.message);
    //         result(res, {statusCode: 905, message: err});
    //     } else {
    //         log.trace('watch offline topic request success. off_id=' + param.off_id);
    //         result(res, {statusCode: 900});
    //     }
    // });
};