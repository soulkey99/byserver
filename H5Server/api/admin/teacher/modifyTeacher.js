/**
 * Created by MengLei on 2015/11/16.
 */
"use strict";
const db = require('./../../../../config').db;
const proxy = require('./../../../../common/proxy');
const result = require('./../../../utils/result');
const objectId = require('mongojs').ObjectId;
const log = require('./../../../../utils/log').h5;

//由管理员直接给教师设置认证信息
module.exports = function (req, res) {
    proxy.User.getUserById(req.body.t_id, (err, doc)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        if (!doc) {
            return result(res, {statusCode: 902, message: '用户不存在！'});
        }
        if (req.body.id_pic != undefined) {
            doc.userInfo.teacher_info.id_pic = req.body.id_pic;
        }
        if (req.body.certificate_pic != undefined) {
            doc.userInfo.teacher_info.certificate_pic = req.body.certificate_pic;
        }
        if (req.body.verify_desc != undefined) {
            doc.userInfo.teacher_info.verify_desc = req.body.verify_desc;
        }
        if (req.body.verify_type != undefined) {
            doc.userInfo.teacher_info.verify_type = req.body.verify_type;
        }
        if (req.body.name != undefined) {
            doc.userInfo.name = req.body.name;
        }
        if (req.body.senior_type != undefined) {
            doc.userInfo.teacher_info.senior_type = req.body.senior_type;
            if (req.body.senior_type == 'verified') {
                doc.userInfo.teacher_info.senior_pre_grades = [];
            }
        }
        if (req.body.order_type != undefined) {
            doc.userInfo.teacher_info.order_type = req.body.order_type;
        }
        if (req.body.teach_years != undefined) {
            doc.userInfo.teacher_info.senior_info.teach_years = req.body.teach_years;
        }
        if (req.body.teach_feature != undefined) {
            doc.userInfo.teacher_info.senior_info.teach_feature = req.body.teach_feature;
        }
        if (req.body.honors != undefined) {
            doc.userInfo.teacher_info.senior_info.honors = req.body.honors.split(',');
        }
        if (req.body.channel != undefined) {
            doc.userInfo.teacher_info.channel = req.body.channel;
        }
        if (req.body.admin_reason != undefined) {
            doc.userInfo.teacher_info.admin_reason = req.body.admin_reason;
        }
        if (req.body.grades != undefined) {
            try {
                doc.userInfo.teacher_info.grades = JSON.parse(req.body.grades);
            } catch (ex) {
                return result(res, {statusCode: 942, message: 'JSON解析错误，' + ex.message});
            }
        }
        if (req.body.senior_grades != undefined) {
            try {
                doc.userInfo.teacher_info.senior_grades = JSON.parse(req.body.senior_grades);
            } catch (ex) {
                return result(res, {statusCode: 942, message: 'JSON解析错误，' + ex.message});
            }
        }
        doc.save((err2)=> {
            if (err2) {
                return result(res, {statusCode: 905, message: err2.message});
            }
            result(res, {statusCode: 900});
        });
    });
    // var _id = new objectId();
    // try {
    //     _id = new objectId(req.body.t_id);
    // } catch (ex) {
    //     log.error('set certificate error: ' + ex.message);
    //     result(res, {statusCode: 919, message: 't_id: ' + ex.message});
    //     return;
    // }
    // var setObj = {};
    // if (req.body.id_pic != undefined) {
    //     setObj['userInfo.teacher_info.id_pic'] = req.body.id_pic;
    // }
    // if (req.body.certificate_pic != undefined) {
    //     setObj['userInfo.teacher_info.certificate_pic'] = req.body.certificate_pic;
    // }
    // if (req.body.verify_desc != undefined) {
    //     setObj['userInfo.teacher_info.verify_desc'] = req.body.verify_desc;
    // }
    // if (req.body.verify_type != undefined) {
    //     setObj['userInfo.teacher_info.verify_type'] = req.body.verify_type;
    // }
    // if (req.body.name != undefined) {
    //     setObj['userInfo.name'] = req.body.name;
    // }
    // if (req.body.grades != undefined) {
    //     try {
    //         setObj['userInfo.teacher_info.grades'] = JSON.parse(req.body.grades);
    //     } catch (ex) {
    //         return result(res, {statusCode: 942, message: 'JSON解析错误，' + ex.message});
    //     }
    // }
    // db.users.findAndModify({query: {_id: _id}, update: {$set: setObj}, fields: {_id: 1}}, function (err, doc) {
    //     if (err) {
    //         result(res, {statusCode: 905, message: err.message});
    //     } else {
    //         if (doc) {
    //             result(res, {statusCode: 900});
    //         } else {
    //             result(res, {statusCode: 902, message: 't_id不存在！'});
    //         }
    //     }
    // });
};
