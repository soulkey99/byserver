/**
 * Created by MengLei on 2016-04-15.
 */
"use strict";
const proxy = require('./../../../../common/proxy');
const result = require('./../../../utils/result');

module.exports = function (req, res) {
    proxy.StudyPoint.getExtra({
        p_id: req.body.p_id,
        limit: req.body.limit,
        type: req.body.type
    }, (err, doc)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        result(res, {statusCode: 900, list: doc});
    });
};
