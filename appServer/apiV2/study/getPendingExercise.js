/**
 * Created by MengLei on 2016-05-18.
 */
"use strict";
const proxy = require('./../../../common/proxy');
const result = require('./../../utils/result');

module.exports = function (req, res) {
    let param = {
        userID: req.body.userID,
        q_id: req.body.q_id,
        sec_id: req.body.sec_id
    };
    proxy.StudyExercise.checkPending(param, (err, info)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        result(res, {statusCode: 900, info});
    });
};
