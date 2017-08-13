/**
 * Created by MengLei on 2016-05-23.
 */
"use strict";
const proxy = require('./../../../common/proxy');
const result = require('./../../utils/result');

module.exports = function (req, res) {
    let param = {
        userID: req.body.userID,
        sec_id: req.body.sec_id,
        userType: 'student'
    };
    proxy.StudyCatalog.getSectionQuestion(param, (err, list)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        result(res, {statusCode: 900, list});
    });
};
