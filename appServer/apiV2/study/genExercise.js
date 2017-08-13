/**
 * Created by MengLei on 2016-04-19.
 */
"use strict";
const proxy = require('./../../../common/proxy');
const result = require('./../../utils/result');

module.exports = function (req, res) {
    let param = {
        userID: req.body.userID,
        type: req.body.type,
        sec_id: req.body.sec_id,
        q_id: req.body.q_id
    };
    proxy.StudyExercise.genExercise(param, (err, doc)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        result(res, {statusCode: 900, info: doc.toObject({getters: true})});
    });
};
