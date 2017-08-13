/**
 * Created by MengLei on 2016-04-15.
 */
"use strict";
const proxy = require('./../../../../common/proxy');
const result = require('./../../../utils/result');

module.exports = function (req, res) {
    proxy.StudyPoint.getPointByID(req.body.p_id, (err, doc)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        if(!doc){
            return result(res, {statusCode: 905, message: '对应的知识点不存在！'});
        }
        result(res, {statusCode: 900, info: doc.toObject({getters: true})});
    });
};
