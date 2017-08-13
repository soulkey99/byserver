/**
 * Created by MengLei on 2016-06-15.
 */
"use strict";
const proxy = require('./../../../common/proxy');
const result = require('./../../utils/result');

module.exports = function (req, res) {
    proxy.StudyExercise.cancel({
        userID: req.body.userID,
        e_id: req.body.e_id
    }, (err)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        result(res, {statusCode: 900});
    });
};
