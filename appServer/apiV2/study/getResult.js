/**
 * Created by MengLei on 2016-04-19.
 */
"use strict";
const proxy = require('./../../../common/proxy');
const result = require('./../../utils/result');

module.exports = function (req, res) {
    proxy.StudyExercise.getResult(req.body.e_id, (err, doc)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        result(res, {statusCode: 900, info: doc});
    });
};
