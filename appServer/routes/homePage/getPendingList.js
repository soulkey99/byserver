/**
 * Created by MengLei on 2015/7/27.
 */
"use strict";
var config = require('../../../config');
var objectId = require('mongojs').ObjectId;
var result = require('../../utils/result');
var log = require('../../../utils/log').http;

//客户端主动拉取符合教师的题目
module.exports = function (req, res) {
    //
    var gradeSubjectArray = [];
    if (req.user && req.user.userInfo && req.user.userInfo.teacher_info && req.user.userInfo.teacher_info.grades) {
        for (let i = 0; i < req.user.userInfo.teacher_info.grades.length; i++) {
            for (let j = 0; j < req.user.userInfo.teacher_info.grades[i].subjects.length; j++) {
                gradeSubjectArray.push({
                    type: {$ne: 'senior'},
                    grade: req.user.userInfo.teacher_info.grades[i].grade,
                    subject: req.user.userInfo.teacher_info.grades[i].subjects[j].subject
                });
            }
        }
    }
    if (req.user && req.user.userInfo && req.user.userInfo.teacher_info && req.user.userInfo.teacher_info.senior_grades) {
        for (let i = 0; i < req.user.userInfo.teacher_info.senior_grades.length; i++) {
            for (let j = 0; j < req.user.userInfo.teacher_info.senior_grades[i].subjects.length; j++) {
                gradeSubjectArray.push({
                    type: 'senior',
                    grade: req.user.userInfo.teacher_info.senior_grades[i].grade,
                    subject: req.user.userInfo.teacher_info.senior_grades[i].subjects[j].subject
                });
            }
        }
    }

    if (gradeSubjectArray.length == 0) {
        //如果年级科目都没有选择，那么就没有符合的题目，直接返回空list即可，不需要进行下面的查询了
        result(res, {statusCode: 900, ordList: []});
        return;
    }

    var start = Number.parseInt(req.body.startPos || 1) - 1;
    var count = Number.parseInt(req.body.pageSize || 5);
    var query = {
        status: 'pending',
        $or: gradeSubjectArray,
        create_time: {$gte: ((new Date()).getTime() - config.pendingTime)}
    };
    // if (req.user.userInfo.teacher_info.senior_type == 'verified') {//付费教师接所有单或者只接付费单
    //     if (req.user.userInfo.teacher_info.order_type == 'senior') {
    //         query['type'] = 'senior';   //只接付费单，否则是所有单
    //     }
    // } else {    //没有付费资格认证的教师，只能接普通单
    //     query['type'] = {$ne: 'senior'};
    // }
    config.db.orders.find(query).skip(start < 0 ? 0 : start).limit(count).toArray(function (err, doc) {
        if (err) {
            log.error('get pending list error: ' + err.message);
            return result(res, {statusCode: 905, message: err.message});
        }
        log.debug('get pending list success.');
        if (doc.length > 0) {
            var idArray = [];
            for (var i = 0; i < doc.length; i++) {
                idArray.push(doc._id);
            }
            var incObj = {};
            incObj['uids.' + req.body.userID] = 1;
            config.db.push.update({_id: {$in: idArray}}, {$inc: {userID: 1}});
        }
        arrangeOrderList(doc, function (err2, doc2) {
            if (err2) {
                return result(res, {statusCode: 905, message: err2.message});
            }
            doc2.sort(function (a, b) {//排序，先发出的订单排在前面
                return a.create_time - b.create_time;
            });
            result(res, {statusCode: 900, ordList: doc2});
        });
    });
};


function arrangeOrderList(list, callback) {
    var idArray = [];
    for (var i = 0; i < list.length; i++) {
        //遍历列表中所有出现的s_id，组成一个数组，便于下面查询个人信息
        //由于都是pending状态的订单，所以只有s_id，没有t_id
        idArray.push(new objectId(list[i].s_id));
    }
    //查找出所有出现的s_id对应的userInfo
    config.db.users.find({_id: {$in: idArray}}, function (err2, doc2) {
        if (err2) {
            //handle error
            callback(err2);
        } else {
            for (var j = 0; j < list.length; j++) {
                for (var k = 0; k < doc2.length; k++) {
                    if (list[j].s_id == doc2[k]._id.toString()) {//将学生信息插入对应的订单中
                        list[j].s_info = {
                            nick: doc2[k].nick || '',
                            name: doc2[k].userInfo.name || '',
                            family_name: doc2[k].userInfo.family_name || '',
                            given_name: doc2[k].userInfo.given_name || '',
                            avatar: doc2[k].userInfo.avatar || ''
                        };
                    }
                }
            }
            callback(null, list);
        }
    });
}