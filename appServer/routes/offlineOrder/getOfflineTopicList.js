/**
 * Created by MengLei on 2015/8/12.
 */
"use strict";
const config = require('../../../config');
const result = require('../../utils/result');
const proxy = require('../../../common/proxy');
const log = require('../../../utils/log').http;
const dnode = require('../../utils/dnodeClient');
const zrpc = require('../../../utils/zmqClient');

//获取离线问题列表，param={userID: '', grade: '', subject: '', tag: '', startPos: ''. pageSize: '', status: '', tab: ''}
module.exports = function (req, res) {
    var param = {
        userID: req.body.userID,
        startPos: req.body.startPos || '1',
        pageSize: req.body.pageSize || '10'
    };
    if (req.body.timestamp) {
        param.timestamp = req.body.timestamp;
    }
    if (req.body.grade) {
        param.grade = req.body.grade;
    }
    if (req.body.subject) {
        param.subject = req.body.subject;
    }
    if (req.body.tag) {
        param.tag = req.body.tag.split(',');
    }
    if (req.body.status) {
        param.status = req.body.status.split(',');
    }
    if (req.body.tab) {
        param.tab = req.body.tab;
    }
    if (req.body.section) {
        param.section = req.body.section;
    }
    proxy.OfflineTopic.getList(param, (err, list)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        result(res, {statusCode: 900, list});
    });
    // zrpc('orderServer', 'getOfflineTopicList', param, function (err, resp) {
    //     if (err) {
    //         //
    //         log.error('get offline topic list error: ' + err.message);
    //         result(res, {statusCode: 905, message: err.message});
    //     } else {
    //         log.trace('get offline topic list request success.');
    //         result(res, {statusCode: 900, list: resp});
    //     }
    // });
};
