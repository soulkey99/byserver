/**
 * Created by MengLei on 2016-04-14.
 */
"use strict";
const proxy = require('./../../../../common/proxy');
const result = require('./../../../utils/result');

module.exports = function (req, res) {
    proxy.StudyQuestion.editExtra({
        q_id: req.body.q_id,
        extra_id: req.body.extra_id,
        type: req.body.type
    }, (err)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        result(res, {statusCode: 900});
    });
};