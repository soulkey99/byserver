/**
 * Created by MengLei on 2015/8/19.
 */
"use strict";
const config = require('../../../config');
const proxy = require('../../../common/proxy');
const result = require('../../utils/result');
const log = require('../../../utils/log').http;
const dnode = require('../../utils/dnodeClient');
const zrpc = require('../../../utils/zmqClient');

//直接生成离线问答订单param={userID: '', grade: '', subject: '', topic: '', tag: '', q_msg: []}
module.exports = function (req, res) {
    //
    var param = {
        userID: req.body.userID,
        topic: req.body.topic,
        grade: req.body.grade || '',
        subject: req.body.subject || ''
    };
    if (req.body.tag) {
        param.tag = req.body.tag.split(',');
    }
    if (req.body.q_msg) {
        try {
            param.q_msg = JSON.parse(req.body.q_msg);
        } catch (ex) {
            log.error('gen offline topic, parse q_msg error: ' + ex.message);
            result(res, {statusCode: 942, message: 'q_msg解析失败！'});
            return;
        }
    } else {
        log.error('gen offline topic error, q_msg null');
        result(res, {statusCode: 943, message: 'q_msg null.'});
        return;
    }
    proxy.OfflineTopic.createOfflineTopic(param, (err, doc)=> {
        if (err) {
            log.error('gen offline topic error: ' + err.message);
            return result(res, {statusCode: 905, message: err.message});
        }
        result(res, {statusCode: 900, off_id: doc.off_id});
    });
    // zrpc('orderServer', 'genOfflineTopic', param, function (err, resp) {
    //     if (err) {
    //         //
    //         log.error('gen offline topic error: ' + err.message);
    //         result(res, {statusCode: 905, message: err});
    //     } else {
    //         log.trace('gen offline topic request success.');
    //         result(res, {statusCode: 900, off_id: resp._id.toString()});
    //     }
    // });
};
