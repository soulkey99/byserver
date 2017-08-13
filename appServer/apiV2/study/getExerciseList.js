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
        startPos: req.body.startPos,
        pageSize: req.body.pageSize
    };
    if (req.body.stage) {
        param['stage'] = req.body.stage;
    }
    if (req.body.grade) {
        param['grade'] = req.body.grade;
    }
    if (req.body.subject) {
        param['subject'] = req.body.subject;
    }
    proxy.StudyExercise.getList(param, (err, list)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        result(res, {statusCode: 900, list});
    });
};

