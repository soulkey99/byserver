/**
 * Created by MengLei on 2016-06-14.
 */
"use strict";
const proxy = require('./../../../common/proxy');
const result = require('./../../utils/result');

module.exports = function (req, res) {
    proxy.StudyExercise.getReview(req.body.e_id, (err, info)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        result(res, {statusCode: 900, info});
    });
};
