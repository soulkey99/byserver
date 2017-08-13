/**
 * Created by MengLei on 2016-04-13.
 */
"use strict";

const proxy = require('./../../../../common/proxy');
const result = require('./../../../utils/result');


module.exports = function (req, res) {
    proxy.StudyQuestion.editQuestion({
        userID: req.body.userID,
        q_id: req.body.q_id,
        prev_id: req.body.prev_id,
        choice_id: req.body.choice_id,
        type: req.body.type,
        stage: req.body.stage,
        grade: req.body.grade,
        subject: req.body.subject,
        content: req.body.content,
        choice: req.body.choice,
        point: req.body.point,
        related: req.body.related,
        enhance: req.body.enhance,
        remark: req.body.remark,
        extend: req.body.extend,
        difficulty: req.body.difficulty
    }, (err, doc)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        result(res, {statusCode: 900, info: doc.toObject({getters: true})});
    });
};

