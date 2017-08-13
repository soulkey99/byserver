/**
 * Created by MengLei on 2016-10-24.
 */
"use strict";
const proxy = require('./../../../../common/proxy');
const result = require('./../../../utils/result');

//删除整个问题，不可恢复
module.exports = function (req, res) {
    proxy.StudyQuestion.delFullQuestion(req.body.q_id, (err, doc)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        result(res, {statusCode: 900, q_id: req.body.q_id});
    });
};

