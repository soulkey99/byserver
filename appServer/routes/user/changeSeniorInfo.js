/**
 * Created by MengLei on 2016/3/24.
 */
"use strict";

let proxy = require('../../../common/proxy');
let log = require('../../../utils/log').http;
let result = require('../../utils/result');

//申请付费教师
module.exports = function (req, res) {
    proxy.User.getUserById(req.body.userID, function (err, doc) {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        if (!doc) {
            return result(res, {statusCode: 902, message: '用户ID不存在！'});
        }
        if (doc.userInfo.teacher_info.verify_type != 'verified') {
            return result(res, {statusCode: 986, message: '尚未通过教师资格审核，无法申请成为付费教师！'});
        }
        if (req.body.province != undefined) {
            doc.userInfo.address.province = req.body.province;
        }
        if (req.body.city != undefined) {
            doc.userInfo.address.city = req.body.city;
        }
        if (req.body.school != undefined) {
            doc.userInfo.school = req.body.school;
            doc.userInfo.teacher_info.senior_type = 'waitingVerify';
            doc.userInfo.teacher_info.updateAt = Date.now();
        }
        if (req.body.senior_pre_grades != undefined) {
            doc.userInfo.teacher_info.senior_type = 'waitingVerify';
            doc.userInfo.teacher_info.senior_pre_grades = JSON.parse(req.body.senior_pre_grades);
            doc.userInfo.teacher_info.updateAt = Date.now();
        }
        if (req.body.teach_years != undefined) {
            doc.userInfo.teacher_info.senior_info.teach_years = req.body.teach_years;
            doc.userInfo.teacher_info.senior_type = 'waitingVerify';
            doc.userInfo.teacher_info.updateAt = Date.now();
        }
        if (req.body.teach_feature != undefined) {
            doc.userInfo.teacher_info.senior_info.teach_feature = req.body.teach_feature;
            doc.userInfo.teacher_info.senior_type = 'waitingVerify';
            doc.userInfo.teacher_info.updateAt = Date.now();
        }
        if (req.body.honor_pics != undefined) {
            doc.userInfo.teacher_info.senior_info.honor_pics = req.body.honor_pics.split(',');
            doc.userInfo.teacher_info.senior_type = 'waitingVerify';
            doc.userInfo.teacher_info.updateAt = Date.now();
        }
        //修改除order type接单类型之外的任何字段，都会导致审核状态变为待审核，需要再次审核通过之后才能接付费单
        if (req.body.order_type != undefined) {
            doc.userInfo.teacher_info.order_type = req.body.order_type;
        }
        doc.save(function (err2) {
            if (err2) {
                return result(res, {statusCode: 905, message: err2.message});
            }
            result(res, {statusCode: 900});
        });
    });
};
