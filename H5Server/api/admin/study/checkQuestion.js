/**
 * Created by MengLei on 2016-09-13.
 */
"use strict";
const proxy = require('./../../../../common/proxy');
const result = require('./../../../utils/result');

module.exports = function (req, res) {
    let param = {
        q_id: req.body.q_id,
        status: req.body.status,
        msg: req.body.msg
    };
    proxy.StudyQuestion.checkQuestion(param, (err, doc)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        if (!doc) {
            return result(res, {statusCode: 905, message: '问题不存在！'});
        }
        result(res, {statusCode: 900, q_id: doc.q_id});
    });
};
