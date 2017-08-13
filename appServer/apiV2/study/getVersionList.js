/**
 * Created by MengLei on 2016-05-03.
 */
"use strict";
const proxy = require('./../../../common/proxy');
const result = require('./../../utils/result');

module.exports = function (req, res) {
    let param = {
        stage: req.body.stage,
        grade: req.body.grade,
        subject: req.body.subject,
        userType: 'student',
        city: req.body.city
    };
    if (req.body.action) {
        param['action'] = req.body.action;
    }
    if (req.body.startPos) {
        param['startPos'] = req.body.startPos;
    }
    if (req.body.pageSize) {
        param['pageSize'] = req.body.pageSize;
    }
    proxy.StudyVersion.getList(param, (err, doc)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        result(res, {statusCode: 900, list: doc});
    });
};
