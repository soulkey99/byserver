/**
 * Created by MengLei on 2015/8/12.
 */
"use strict";
const config = require('../../../config');
const proxy = require('../../../common/proxy');
const result = require('../../utils/result');
const log = require('../../../utils/log').http;
const dnode = require('../../utils/dnodeClient');
const zrpc = require('../../../utils/zmqClient');

//获取某条离线问答的答案的列表param={userID: '', off_id: '', startPos: '', pageSize: '', sort: 'asc/desc'}
//获取某条离线问答的答案的回复列表param={userID: '', answer_id: '', startPos: '', pageSize: ''}
module.exports = function (req, res) {
    var param = {
        userID: req.body.userID,
        startPos: req.body.startPos || '1',
        pageSize: req.body.pageSize || '10'
    };
    if (req.body.off_id) {//获取离线答案列表
        if (req.body.sort) {
            param.sort = req.body.sort;
        }
        param.off_id = req.body.off_id;
        proxy.OfflineAnswer.getList(param, (err, list)=> {
            if (err) {
                return result(res, {statusCode: 905, message: err.message});
            }
            result(res, {statusCode: 900, list});
        });
        // zrpc('orderServer', 'getOfflineAnswerList', param, function (err, resp) {
        //     if (err) {
        //         //
        //         log.error('reply offline answer list error: ' + err.message);
        //         result(res, {statusCode: 905, message: err.message});
        //     } else {
        //         log.trace('reply offline answer list request success.');
        //         result(res, {statusCode: 900, list: resp});
        //     }
        // });
    } else if (req.body.answer_id) {//获取离线评论列表
        param.answer_id = req.body.answer_id;
        proxy.OfflineAnsReply.getList(param, (err, list)=> {
            if (err) {
                return result(res, {statusCode: 905, message: err.message});
            }
            result(res, {statusCode: 900, list});
        });
        // zrpc('orderServer', 'getOfflineReplyList', param, function (err, resp) {
        //     if (err) {
        //         //
        //         log.error('get offline reply list error: ' + err.message);
        //         result(res, {statusCode: 905, message: err.message});
        //     } else {
        //         log.trace('get offline reply list request success.');
        //         result(res, {statusCode: 900, list: resp});
        //     }
        // });
    } else {
        result(res, {statusCode: 919, message: '未上传离线问题ID或者离线答案ID！'});
    }
};