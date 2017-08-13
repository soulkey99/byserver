/**
 * Created by MengLei on 2016-04-15.
 */
"use strict";
const proxy = require('./../../../../common/proxy');
const result = require('./../../../utils/result');

module.exports = function (req, res) {
    proxy.StudyPoint.getList({
        startPos: req.body.startPos,
        pageSize: req.body.pageSize,
        query: req.body.query,
        stage: req.body.stage,
        grade: req.body.grade,
        subject: req.body.subject
    }, (err, doc)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        result(res, {statusCode: 900, list: doc});
    });
};
