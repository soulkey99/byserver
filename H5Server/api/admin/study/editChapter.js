/**
 * Created by MengLei on 2016-05-03.
 */
"use strict";
const proxy = require('./../../../../common/proxy');
const result = require('./../../../utils/result');

module.exports = function (req, res) {
    let param = {
        cha_id: req.body.cha_id,
        action: req.body.action,
        ver_id: req.body.ver_id,
        title: req.body.title,
        remark: req.body.remark,
        sections: req.body.sections,
        seq: req.body.seq
    };
    proxy.StudyCatalog.editChapter(param, (err, doc)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        result(res, {statusCode: 900, info: doc.toObject({getters: true})});
    });
};
