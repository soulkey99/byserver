/**
 * Created by MengLei on 2016-04-19.
 */
"use strict";
const proxy = require('./../../../common/proxy');
const result = require('./../../utils/result');

module.exports = function (req, res) {
    let param = {
        q_id: req.body.q_id,
        type: req.body.type
    };
    if (req.body.limit) {
        param['limit'] = req.body.limit;
    }
    proxy.StudyQuestion.getExtra(param, (err, list)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        result(res, {statusCode: 900, list});
    });
};

