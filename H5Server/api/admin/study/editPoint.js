/**
 * Created by MengLei on 2016-04-15.
 */
"use strict";

const proxy = require('./../../../../common/proxy');
const result = require('./../../../utils/result');

module.exports = function (req, res) {
    proxy.StudyPoint.editPoint({
        p_id: req.body.p_id,
        type: req.body.type,
        stage: req.body.stage,
        grade: req.body.grade,
        subject: req.body.subject,
        title: req.body.title,
        content: req.body.content,
        pre: req.body.pre,
        next: req.body.next,
        related: req.body.related,
        remark: req.body.remark
    }, (err)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        result(res, {statusCode: 900});
    });
};
