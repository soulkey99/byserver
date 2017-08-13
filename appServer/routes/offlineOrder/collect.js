/**
 * Created by MengLei on 2015/8/25.
 */
"use strict";
const config = require('../../../config');
const result = require('../../utils/result');
const proxy = require('../../../common/proxy');
const log = require('../../../utils/log').http;
const dnode = require('../../utils/dnodeClient');
const zrpc = require('../../../utils/zmqClient');

//收藏离线问答，param={userID: '', off_id: '', action: ''}
//收藏离线问答的答案，param={userID: '', answer_id: '', action: ''}
module.exports = function (req, res) {
    if (req.body.off_id) {
        if (req.body.action == 'un') {
            proxy.TopicCollect.removeCollect(req.body.off_id, req.body.userID, handleCB);
        } else {
            proxy.TopicCollect.addCollect(req.body.off_id, req.body.userID, handleCB);
        }
    } else if (req.body.answer_id) {
        if (req.body.action == 'un') {
            proxy.AnswerCollect.removeCollect(req.body.answer_id, req.body.userID, handleCB);
        } else {
            proxy.AnswerCollect.addCollect(req.body.answer_id, req.body.userID, handleCB);
        }
    } else {
        return result(res, {statusCode: 919, message: '离线问题的ID或者离线答案的ID不能为空！'});
    }
    function handleCB(err, doc) {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        if (!doc) {
            if (req.body.off_id) {
                return result(res, {statusCode: 914, message: '离线问题不存在！'});
            } else {
                return result(res, {statusCode: 915, message: '离线问题答案不存在！'});
            }
        }
        result(res, {statusCode: 900});
    }

    //
    // var param = {
    //     userID: req.body.userID
    // };
    // if (req.body.action) {
    //     param.action = req.body.action;
    // }
    // if (req.body.off_id) {
    //     param.off_id = req.body.off_id;
    //     dnode('orderServer', 'collectTopic', param, function (err, resp) {
    //         if (err) {
    //             //
    //             log.error('collect offline topic error: ' + err.message);
    //             result(res, {statusCode: 905, message: err.message});
    //         } else {
    //             log.trace('collect offline topic request success. off_id=' + param.off_id);
    //             result(res, {statusCode: 900});
    //         }
    //     });
    // } else if (req.body.answer_id) {
    //     param.answer_id = req.body.answer_id;
    //     dnode('orderServer', 'collectAnswer', param, function (err, resp) {
    //         if (err) {
    //             //
    //             log.error('collect offline answer error: ' + err.message);
    //             result(res, {statusCode: 905, message: err.message});
    //         } else {
    //             log.trace('collect offline answer request success. off_id=' + param.off_id);
    //             result(res, {statusCode: 900});
    //         }
    //     });
    // } else {
    //     log.error('collect offline off_id or answer_id null.');
    //     result(res, {statusCode: 919});
    // }
};
