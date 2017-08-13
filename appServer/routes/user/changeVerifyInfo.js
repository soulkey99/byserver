/**
 * Created by MengLei on 2015/3/31.
 */
"use strict";
const db = require('../../../config').db;
const eventproxy = require('eventproxy');
const proxy = require('../../../common/proxy');
const result = require('../../utils/result');
const objectId = require('mongojs').ObjectId;
const log = require('../../../utils/log').http;

//教师，修改认证信息
module.exports = function (req, res) {
    //
    let ep = new eventproxy();
    ep.all('user', 'userConf', (user, userConf)=> {
        if (!user) {
            return result(res, {statusCode: 902, message: '用户不存在！'});
        }
        if (userConf && userConf.type == 'teacher') {
            user.userInfo.teacher_info.verify_type = 'verified';
        } else {
            user.userInfo.teacher_info.verify_type = 'waitingVerify';
            if (user.userInfo.teacher_info.senior_type == 'verified') {
                user.userInfo.teacher_info.senior_type = 'waitingVerify';//修改教师认证信息，同时付费教师信息也重新需要审核
            }
        }
        user.userInfo.teacher_info.updateAt = Date.now();
        if (req.body.name != undefined) {
            user.userInfo.name = req.body.name;
        }
        if (req.body.id_pic != undefined) {
            user.userInfo.teacher_info.id_pic = req.body.id_pic;
        }
        if (req.body.id_no != undefined) {
            user.userInfo.id_no = req.body.id_no;
        }
        if (req.body.certificate_pic != undefined) {
            user.userInfo.teacher_info.certificate_pic = req.body.certificate_pic;
        }
        if (req.body.verify_desc != undefined) {
            user.userInfo.teacher_info.verify_desc = req.body.verify_desc;
        }
        if (req.body.grades != undefined) {  //年级这里传上来的是一个object
            try {
                user.userInfo.teacher_info.grades = JSON.parse(req.body.grades);
            } catch (ex) {
                log.error('change verify info, grades info error: ' + ex.message);
                return result(res, {statusCode: 942, message: '年级学科字段json解析失败！'});
            }
        }
        user.save((err)=> {
            if (err) {
                return result(res, {statusCode: 905, message: err.message});
            }
            result(res, {statusCode: 900});
        });
    });
    ep.fail((err)=> {
        return result(res, {statusCode: 905, message: err.message});
    });
    proxy.User.getUserById(req.body.userID, ep.done('user'));
    db.userConf.findOne({phonenum: req.user.phone, type: 'teacher', delete: false}, ep.done('userConf'));
    // proxy.User.getUserById(req.body.userID, (err, doc)=> {
    //     if (err) {
    //         return result(res, {statusCode: 905, message: err.message});
    //     }
    //     if (!doc) {
    //         return result(res, {statusCode: 902, message: '用户不存在！'});
    //     }
    //     if (req.userConf && req.userConf.type == 'teacher') {
    //         doc.userInfo.teacher_info.verify_type = 'verified';
    //     } else {
    //         doc.userInfo.teacher_info.verify_type = 'waitingVerify';
    //         if (doc.userInfo.teacher_info.senior_type == 'verified') {
    //             doc.userInfo.teacher_info.senior_type = 'waitingVerify';//修改教师认证信息，同时付费教师信息也重新需要审核
    //         }
    //     }
    //     doc.userInfo.teacher_info.updateAt = Date.now();
    //     if (req.body.id_pic != undefined) {
    //         doc.userInfo.teacher_info.id_pic = req.body.id_pic;
    //     }
    //     if (req.body.id_no != undefined) {
    //         doc.userInfo.id_no = req.body.id_no;
    //     }
    //     if (req.body.certificate_pic != undefined) {
    //         doc.userInfo.teacher_info.certificate_pic = req.body.certificate_pic;
    //     }
    //     if (req.body.verify_desc != undefined) {
    //         doc.userInfo.teacher_info.verify_desc = req.body.verify_desc;
    //     }
    //     doc.save((err2)=> {
    //         if (err2) {
    //             return result(res, {statusCode: 905, message: err2.message});
    //         }
    //         result(res, {statusCode: 900});
    //     });
    // });
};
