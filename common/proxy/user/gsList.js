/**
 * Created by MengLei on 2016-05-10.
 */
"use strict";
const model = require('../../model');
const eventproxy = require('eventproxy');
const GSList = model.GSList;

/**
 * 用户登录或者开始接单
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {String} userID
 * @param {Function} [callback]
 */
exports.onStart = function (userID, callback) {
    if (!callback) {
        callback = function () {
        };
    }
    let ep = new eventproxy();
    ep.all('user', 'gs', (user, gs)=> {
        if (!user) {  //用户不存在
            return;
        }
        if (user.userInfo.teacher_info.verify_type != 'verified') {
            return; //用户教师资格未通过审核，不予添加纪录
        }
        if (!gs) {
            gs = new GSList({_id: userID});
        }
        gs.status = 'online';
        gs.channel = user.userInfo.teacher_info.channel;
        gs.gsList = [];
        for (let i = 0; i < user.userInfo.teacher_info.grades.length; i++) {
            for (let j = 0; j < user.userInfo.teacher_info.grades[i].subjects.length; j++) {
                gs.gsList.push(user.userInfo.teacher_info.grades[i].grade + user.userInfo.teacher_info.grades[i].subjects[j].subject);
            }
        }
        gs.seniorGSList = [];
        for (let i = 0; i < user.userInfo.teacher_info.senior_grades.length; i++) {
            for (let j = 0; j < user.userInfo.teacher_info.senior_grades[i].subjects.length; j++) {
                gs.seniorGSList.push(user.userInfo.teacher_info.senior_grades[i].grade + user.userInfo.teacher_info.senior_grades[i].subjects[j].subject);
            }
        }
        gs.specialGSList = [];
        if (user.userInfo.special_info && user.userInfo.special_info.subject) {
            gs.specialGSList = user.userInfo.special_info.subject;
        }
        gs.save(callback);
    });
    ep.fail(callback);
    GSList.findById(userID, ep.done('gs'));
    model.User.findById(userID, ep.done('user'));
};

/**
 * 用户主动注销或者停止接单
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {String} userID
 */
exports.onStop = function (userID) {
    GSList.findById(userID, (err, gs)=> {
        if (err) {
            return;
        }
        if (!!gs) {
            gs.status = 'offline';
            gs.save();
        }
    });
};

/**
 * 更新用户记录的过期时间
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {String} userID
 * @param {String} [status]
 */
exports.onUpdate = function (userID, status) {
    let setObj = {t: new Date()};
    if (status) {
        setObj['status'] = status;
    }
    GSList.findByIdAndUpdate(userID, {$set: setObj}, (err, doc)=> {
        if (err) {
            return;
        }
        if (!doc && status == 'online') {
            require('./gsList').onStart(userID);
        }
    });
};

/**
 * 删除用户年级科目记录
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {String} userID
 */
exports.onRemove = function (userID) {
    GSList.findByIdAndRemove(userID).exec();
};

/**
 * 根据年级科目获取对应userID列表
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param = {grade: '', subject: '', type: '', channel: ''}
 * @param {Function} callback
 */
exports.pushTeachers = function (param, callback) {
    let query = {status: 'online'};
    if (param.channel) {
        query['channel'] = param.channel;
    }
    if (param.grade == 'special') {
        query['specialGSList'] = param.subject;
    } else {
        if (param.type == 'senior') {
            query['seniorGSList'] = param.grade + param.subject;
        } else {
            query['gsList'] = param.grade + param.subject;
        }
    }
    GSList.find(query, {_id: 1}, (err, doc)=> {
        if (err) {
            return callback(err);
        }
        let list = [];
        for (let i = 0; i < doc.length; i++) {
            list.push(doc[i]._id.toString());
        }
        callback(null, list);
    });
};
