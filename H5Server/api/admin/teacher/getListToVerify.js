/**
 * Created by MengLei on 2015/9/15.
 */
"use strict";
const db = require('./../../../../config').db;
const proxy = require('./../../../../common/proxy');
const result = require('./../../../utils/result');
const objectId = require('mongojs').ObjectId;
const log = require('./../../../../utils/log').h5;

//获取待认证的教师列表
module.exports = function (req, res) {
    let start = parseInt(req.body.startPos || 1) - 1;
    let count = parseInt(req.body.pageSize || 10);
    let sort = {'userInfo.create_time': -1};
    if (req.body.sort == 'asc') {
        sort = {'userInfo.create_time': 1};
    } else {
        sort = {'userInfo.create_time': -1};
    }

    //增加筛选条件
    let query = {'userInfo.teacher_info.verify_type': 'waitingVerify', userType: 'teacher'};
    if (req.body.startTime && req.body.endTime) {
        query['userInfo.create_time'] = {$gte: parseFloat(req.body.startTime), $lte: parseFloat(req.body.endTime)};
    } else if (req.body.startTime) {
        query['userInfo.create_time'] = {$gte: parseFloat(req.body.startTime)};
    } else if (req.body.endTime) {
        query['userInfo.create_time'] = {$lte: parseFloat(req.body.endTime)};
    }

    if (req.body.channel) {
        query['userInfo.teacher_info.channel'] = req.body.channel;
    }

    if (req.body.verify_type) {
        let list = req.body.verify_type.split(',');
        if (list.length == 1) { //如果只需要查一种状态，那么只用等号匹配即可，否则需要使用$in来进行匹配
            query['userInfo.teacher_info.verify_type'] = req.body.verify_type;
        } else {
            query['userInfo.teacher_info.verify_type'] = {$in: list};
        }
        if (req.body.verify_type == 'waitingVerify') {
            sort = {'userInfo.create_time': 1};
            delete(query['userInfo.create_time']);
        }
    }

    if (req.body.senior_type) {
        let list = req.body.senior_type.split(',');
        delete(query['userInfo.teacher_info.verify_type']);
        delete(query['userInfo.create_time']);  //如果是查询待认证付费教师列表，那么先暂时去掉时间限制
        if (list.length == 1) {
            if (req.body.senior_type == 'waitingVerify') {
                query['userInfo.teacher_info.verify_type'] = 'verified';
            }
            query['userInfo.teacher_info.senior_type'] = req.body.senior_type;
        } else {
            query['userInfo.teacher_info.senior_type'] = {$in: list};
        }
    }

    //如果输入参数是手机号或者昵称，那么只按照这种条件筛选，忽略其他各项条件
    if (req.body.t_phone) {
        query = {phone: {$regex: req.body.t_phone}, userType: {$in: ['teacher', 'student']}};
    }
    if (req.body.t_nick) {
        query = {nick: {$regex: req.body.t_nick}, userType: {$in: ['teacher', 'student']}};
    }

    proxy.User.getUsersByQuery(query, {
        skip: start,
        limit: count,
        sort: sort[Object.keys(sort)[0]].toString() + Object.keys(sort)[0]
    }, (err, doc)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        let list = [];
        for (let i = 0; i < doc.length; i++) {
            let item = {
                t_id: doc[i]._id.toString(),
                phone: doc[i].phone,
                nick: doc[i].nick,
                t_name: doc[i].userInfo.name,
                address: doc[i].userInfo.address,
                verify_type: doc[i].userInfo.teacher_info.verify_type,
                admin_reason: doc[i].userInfo.teacher_info.admin_reason,
                verify_desc: doc[i].userInfo.teacher_info.verify_desc,
                id_no: doc[i].userInfo.id_no,
                id_pic: doc[i].userInfo.teacher_info.id_pic,
                bonus: doc[i].userInfo.bonus,
                certificate_pic: doc[i].userInfo.teacher_info.certificate_pic,
                create_time: doc[i].userInfo.create_time,
                last_login: doc[i].userInfo.last_login,
                updateAt: doc[i].userInfo.teacher_info.updateAt,
                gender: doc[i].userInfo.gender,
                school: doc[i].userInfo.school,
                grades: doc[i].userInfo.teacher_info.grades,
                senior_type: doc[i].userInfo.teacher_info.senior_type,
                senior_grades: doc[i].userInfo.teacher_info.senior_grades,
                senior_pre_grades: [],
                order_type: doc[i].userInfo.teacher_info.order_type,
                teach_years: doc[i].userInfo.teacher_info.senior_info.teach_years,
                teach_feature: doc[i].userInfo.teacher_info.senior_info.teach_feature,
                honor_pics: doc[i].userInfo.teacher_info.senior_info.honor_pics,
                honors: doc[i].userInfo.teacher_info.senior_info.honors,
                channel: doc[i].userInfo.teacher_info.channel
            };
            if(item.senior_type == 'waitingVerify'){
                item.senior_pre_grades = doc[i].userInfo.teacher_info.senior_pre_grades;
            }
            list.push(item);
        }
        result(res, {statusCode: 900, teacherList: list});
    });
    // db.users.find(query, {
    //     'userInfo.student_info': 0,
    //     'authSign': 0,
    //     'userType': 0
    // }).sort(sort).skip((parseInt(start) - 1) < 0 ? 0 : (parseInt(start) - 1)).limit(parseInt(count)).toArray(function (err2, doc2) {
    //     if (err2) {
    //         //handle error
    //         log.error('query teacher list error: ' + err.message);
    //         result(res, {statusCode: 905, message: err.message});
    //     } else {
    //         //success
    //         log.trace('query teacher list success');
    //         var list = [];
    //         for (var i = 0; i < doc2.length; i++) {
    //             list.push({
    //                 t_id: doc2[i]._id.toString(),
    //                 phone: doc2[i].phone,
    //                 nick: doc2[i].nick,
    //                 name: doc2[i].userInfo.name,
    //                 verify_type: doc2[i].userInfo.teacher_info.verify_type,
    //                 admin_reason: doc2[i].userInfo.teacher_info.admin_reason,
    //                 verify_desc: doc2[i].userInfo.teacher_info.verify_desc,
    //                 id_no: doc2[i].userInfo.id_no,
    //                 id_pic: doc2[i].userInfo.teacher_info.id_pic,
    //                 bonus: doc2[i].userInfo.bonus,
    //                 certificate_pic: doc2[i].userInfo.teacher_info.certificate_pic,
    //                 create_time: doc2[i].userInfo.create_time,
    //                 last_login: doc2[i].userInfo.last_login,
    //                 gender: doc2[i].userInfo.gender,
    //                 grades: doc2[i].userInfo.teacher_info.grades
    //             });
    //             //doc2[i].t_id = doc2[i]._id.toString();
    //             //delete(doc2[i]._id);
    //         }
    //         result(res, {statusCode: 900, teacherList: list});
    //     }
    // });
};
