/**
 * Created by MengLei on 2016-04-21.
 */
"use strict";
const proxy = require('./../../../../common/proxy');
const result = require('./../../../utils/result');

module.exports = function (req, res) {//{q_id: '', choice_id: '', content: '', correct: '', hint: '', flag: '', action: '', next: ''}
    let param = {
        userID: req.body.userID,
        q_id: req.body.q_id,
        choice_id: req.body.choice_id,
        content: req.body.content,
        correct: req.body.correct,
        hint: req.body.hint,
        flag: req.body.flag,
        action: req.body.action,
        next: req.body.next
    };
    proxy.StudyQuestion.editChoice(param, (err, doc)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        result(res, {statusCode: 900, info: doc.toObject({getters: true})});
    });
};
