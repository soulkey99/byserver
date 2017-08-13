/**
 * Created by MengLei on 2016/3/15.
 */
"use strict";
let proxy = require('./../../../common/proxy');
let result = require('../../utils/result');
let log = require('../../../utils/log').http;

//获取用户快速回复列表
module.exports = function(req, res) {
    proxy.FastReply.editFastReply(req.body, function (err, doc) {
        if (err) {
            log.error('edit fast reply error: ' + err.message);
            return result(res, {statusCode: 905, message: err.message});
        }
        if (!doc) {
            log.error('edit fast reply error, fr_id ' + req.body.fr_id + 'not exists.');
            return result(res, {statusCode: 905, message: '快速回复id不存在，编辑失败！'});
        }
        result(res, {statusCode: 900, fr_id: doc.fr_id});
    });
};
