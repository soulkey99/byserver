/**
 * Created by MengLei on 2016-05-03.
 */
"use strict";
const proxy = require('./../../../../common/proxy');
const result = require('./../../../utils/result');

module.exports = function (req, res) {
    proxy.StudyVersion.editVersion({
        ver_id: req.body.ver_id,
        action: req.body.action,
        stage: req.body.stage,
        grade: req.body.grade,
        subject: req.body.subject,
        city: req.body.city,
        version: req.body.version,
        title: req.body.title,
        intro: req.body.intro,
        type: req.body.type,
        cover: req.body.cover,
        remark: req.body.remark
    }, (err, doc)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        result(res, {statusCode: 900, info: doc.toObject({getters: true})});
    });
};
