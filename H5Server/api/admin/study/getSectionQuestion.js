/**
 * Created by MengLei on 2016-05-03.
 */
"use strict";
const proxy = require('./../../../../common/proxy');
const result = require('./../../../utils/result');

module.exports = function (req, res) {
    let param = {
        sec_id: req.body.sec_id,
        limit: req.body.limit
    };
    proxy.StudyCatalog.getSectionQuestion(param, (err, doc)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        result(res, {statusCode: 900, list: doc});
    });
};
