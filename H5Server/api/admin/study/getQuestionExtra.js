/**
 * Created by MengLei on 2016-04-15.
 */
"use strict";
const proxy = require('./../../../../common/proxy');
const result = require('./../../../utils/result');

module.exports = function (req, res) {
    let param = {
        type: req.body.type,
        q_id: req.body.q_id
    };
    if (req.body.limit) {
        param['limit'] = req.body.limit;
    }
    proxy.StudyQuestion.getExtra(param, (err, doc)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        result(res, {statusCode: 900, list: doc});
    });
};
