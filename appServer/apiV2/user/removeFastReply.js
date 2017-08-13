/**
 * Created by MengLei on 2016/3/16.
 */
"use strict";
let proxy = require('./../../../common/proxy');
let result = require('../../utils/result');
let log = require('../../../utils/log').http;

//获取用户快速回复列表
module.exports = function(req, res) {
    if(!req.body.fr_id){
        return result(res, {statusCode: 905, message: '请上传快速回复fr_id！'});
    }
    proxy.FastReply.removeFastReply(req.body.userID, req.body.fr_id, function (err, doc) {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        if (!doc) {
            return result(res, {statusCode: 905, message: '快速回复id不存在，编辑失败！'});
        }
        result(res, {statusCode: 900});
    });
};
