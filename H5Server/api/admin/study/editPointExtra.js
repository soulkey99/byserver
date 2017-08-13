/**
 * Created by MengLei on 2016-04-15.
 */
"use strict";
const proxy = require('./../../../../common/proxy');
const result = require('./../../../utils/result');

module.exports = function (req, res) {
    proxy.StudyPoint.editExtra({
        p_id: req.body.p_id,
        type: req.body.type,
        extra_id: req.body.extra_id
    }, (err)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        result(res, {statusCode: 900});
    });
};
