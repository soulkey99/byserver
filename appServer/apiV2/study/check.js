/**
 * Created by MengLei on 2016-04-14.
 */
"use strict";
const proxy = require('./../../../common/proxy');
const result = require('./../../utils/result');

module.exports = function (req, res) {
    proxy.StudyExercise.check({
        userID: req.body.userID,
        e_id: req.body.e_id,
        q_id: req.body.q_id,
        choice_id: req.body.choice_id
    }, (err)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        result(res, {statusCode: 900});
    });
};

