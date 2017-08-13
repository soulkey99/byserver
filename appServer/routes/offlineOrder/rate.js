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

//支持、反对离线答案param={userID: '', answer_reply_id: '', answer_id: '', action: ''}，answer_reply_id和answer_id二选一，action可选，默认up，可传down
module.exports = function (req, res) {
    if (req.body.answer_id) {
        proxy.OfflineAnswer.rateAnswer(req.body.userID, req.body.answer_id, req.body.action, (err, doc)=> {
            if (err) {
                return result({statusCode: 905, message: err.message});
            }
            if (!doc) {
                return result({statusCode: 915, message: '离线问题答案ID不存在！'});
            }
            result(res, {
                statusCode: 900,
                ups: doc.ups.length,
                downs: doc.downs.length,
                up: (doc.ups.indexOf(req.body.userID) >= 0),
                down: (doc.downs.indexOf(req.body.userID) >= 0)
            });
        });
    } else if (req.body.answer_reply_id) {
        proxy.OfflineAnsReply.rateOfflineAnsReply(req.body.userID, req.body.answer_reply_id, req.body.action, (err, doc)=> {
            if (err) {
                return result(res, {statusCode: 905, message: err.message});
            }
            if (!doc) {
                return result(res, {statusCode: 915, message: '离线问题答案的回复不存在！'});
            }
            result(res, {
                statusCode: 900,
                ups: doc.ups.length,
                downs: doc.downs.length,
                up: (doc.ups.indexOf(req.body.userID) >= 0),
                down: (doc.downs.indexOf(req.body.userID) >= 0)
            })
        });
    } else {
        result(res, {statusCode: 919, message: '请上传答案或者回复的ID！'});
    }
    return;
    zrpc('orderServer', 'rate', param, function (err, resp) {
        if (err) {
            log.error('rate answer/reply error: ' + err.message);
            return result(res, {statusCode: 905, message: err.message});
        }
        log.trace('rate answer/reply request success.');
        result(res, {
            statusCode: 900,
            ups: resp.ups.length,
            downs: resp.downs.length,
            up: (resp.ups.indexOf(param.userID) >= 0),
            down: (resp.downs.indexOf(param.userID) >= 0)
        });
    });
};