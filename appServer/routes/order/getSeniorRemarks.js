/**
 * Created by MengLei on 2016/4/7.
 */
"use strict";

let proxy = require('../../../common/proxy');
let log = require('../../../utils/log').http;
let result = require('../../utils/result');

module.exports = function (req, res) {
    if (!req.body.t_id) {
        return result(res, {statusCode: 982, message: '没有传教师ID！'});
    }
    let param = {t_id: req.body.t_id, startPos: req.body.startPos, pageSize: req.body.pageSize};
    proxy.Order.getSeniorRemarks(param, (err, list)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        result(res, {statusCode: 900, list});
    });
};
