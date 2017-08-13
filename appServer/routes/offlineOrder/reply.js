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

//回复自由答param={userID: '', off_id: '', msg: [], reply_id: ''}，msg结构：[{msg: '消息内容', type: '消息类型', orientation: '图片方向', time: '语音时长', seq: '消息顺序，从1开始'}, {...}, {...}, ...]
//回复自由答的回复，param={userID: '', off_id: '', answer_id: '', reply_id: '', msg: ''}，限制只能是纯文本
module.exports = function (req, res) {
    var param = {
        userID: req.body.userID,
        off_id: req.body.off_id,
        msg: req.body.msg
    };
    if (req.body.reply_id) {
        param.reply_id = req.body.reply_id;
    }

    if (req.body.action == 'modify') {
        //修改编辑
        if (req.body.answer_id) {
            //编辑自由答的答案
            param.answer_id = req.body.answer_id;
            proxy.OfflineAnswer.editAnswer(param, (err, resp)=> {
                if (err) {
                    return result(res, {statusCode: resp || 905, message: err.message});
                }
                result(res, {statusCode: 900, answer_id: resp.answer_id});
            });
            // zrpc('orderServer', 'reply', param, function (err, resp) {
            //     if (err) {
            //         //
            //         log.error('reply offline answer error: ' + err.message);
            //         result(res, {statusCode: 905, message: err.message});
            //     } else {
            //         log.trace('reply offline answer request success.');
            //         result(res, {statusCode: 900, answer_id: resp._id.toString()});
            //     }
            // });
        }
    } else {
        if (req.body.answer_id) {
            //回复自由答的回复
            param.answer_id = req.body.answer_id;
            proxy.OfflineAnsReply.editReply(param, (err, resp)=> {
                if (err) {
                    return result(res, {statusCode: resp || 905, message: err.message});
                }
                result(res, {statusCode: 900, answer_reply_id: resp.answer_reply_id});
            });
            // zrpc('orderServer', 'replyReply', param, function (err, resp) {
            //     if (err) {
            //         //
            //         log.error('reply offline answer error: ' + err.message);
            //         result(res, {statusCode: 905, message: err.message});
            //     } else {
            //         log.trace('reply offline answer request success.');
            //         result(res, {statusCode: 900, answer_reply_id: resp._id.toString()});
            //     }
            // });
        } else {
            //回复自由答
            proxy.OfflineAnswer.editAnswer(param, (err, resp)=> {
                if (err) {
                    return result(res, {statusCode: resp || 905, message: err.message});
                }
                result(res, {statusCode: 900, answer_id: resp.answer_id});
            });
            // zrpc('orderServer', 'reply', param, function (err, resp) {
            //     if (err) {
            //         //
            //         log.error('reply offline topic error: ' + err.message);
            //         result(res, {statusCode: 905, message: err.message});
            //     } else {
            //         log.trace('reply offline topic request success.');
            //         result(res, {statusCode: 900, answer_id: resp._id.toString()});
            //     }
            // });
        }
    }
};