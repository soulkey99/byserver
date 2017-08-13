/**
 * Created by MengLei on 2016-04-13.
 */
"use strict";
const proxy = require('./../../../../common/proxy');
const result = require('./../../../utils/result');

module.exports = function (req, res) {
    proxy.StudyQuestion.editNext({
        q_id: req.body.q_id,
        choice_id: req.body.choice_id,
        next: req.body.next
    }, (err)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        result(res, {statusCode: 900});
    });
};
