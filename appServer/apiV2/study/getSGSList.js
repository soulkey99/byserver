/**
 * Created by MengLei on 2016-05-03.
 */
"use strict";
const db = require('./../../../config').db;
const objectId = require('mongojs').ObjectId;
const result = require('./../../utils/result');

module.exports = function (req, res) {
    db.byConfig.findOne({_id: new objectId('572066c12d1462a826a74e2c')}, (err, doc)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        if (!doc) {
            return result(res, {statusCode: 905, message: '配置信息不存在！'});
        }
        result(res, {statusCode: 900, list: doc.stageSubjectGrade});
    });
};
