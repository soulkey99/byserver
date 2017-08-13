/**
 * Created by MengLei on 2016-05-03.
 */
"use strict";
const proxy = require('./../../../../common/proxy');
const result = require('./../../../utils/result');

module.exports = function (req, res) {
    let param = {
        sec_id: req.body.sec_id,
        q_id: req.body.q_id,
        action: req.body.action
    };
    proxy.StudyCatalog.editSectionQuestion(param, (err, doc)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        result(res, {statusCode: 900, info: doc.toObject({getters: true})});
    });
};
