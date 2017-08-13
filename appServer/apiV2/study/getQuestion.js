/**
 * Created by MengLei on 2016-04-12.
 */
"use strict";

const proxy = require('./../../../common/proxy');
const result = require('./../../utils/result');

module.exports = function (req, res) {
    if(!req.body.q_id){
        return result(res, {statusCode: 905, message: '请输入q_id！'});
    }
    proxy.StudyQuestion.getQuestionByID(req.body.q_id, (err, doc)=>{
        if(err){
            return result(res, {statusCode: 905, message: err.message});
        }
        result(res, {statusCode: 900, info: doc.toObject({getters: true})});
    });
};
