/**
 * Created by MengLei on 2016/3/30.
 */
"use strict";
const proxy = require('../../../common/proxy');
const eventproxy = require('eventproxy');
const db = require('../../../config').db;
const log = require('../../../utils/log').http;
const result = require('../../utils/result');


module.exports = function (req, res) {
    let gsList = [];    //记录教师的年级学科组合的列表
    let pendingSeniorGSList = [];   //记录教师正在申请中的年级学科组合列表
    let seniorGSList = [];  //记录教师的已申请的付费资格的年级学科组合的列表

    for (let i = 0; i < req.user.userInfo.teacher_info.senior_grades.length; i++) {
        for (let j = 0; j < req.user.userInfo.teacher_info.senior_grades[i].subjects.length; j++) {
            seniorGSList.push({
                grade: req.user.userInfo.teacher_info.senior_grades[i].grade,
                subject: req.user.userInfo.teacher_info.senior_grades[i].subjects[j].subject
            });
        }
    }

    for (let i = 0; i < req.user.userInfo.teacher_info.senior_pre_grades.length; i++) {
        for (let j = 0; j < req.user.userInfo.teacher_info.senior_pre_grades[i].subjects.length; j++) {
            pendingSeniorGSList.push({
                grade: req.user.userInfo.teacher_info.senior_pre_grades[i].grade,
                subject: req.user.userInfo.teacher_info.senior_pre_grades[i].subjects[j].subject
            });
        }
    }

    for (let i = 0; i < req.user.userInfo.teacher_info.grades.length; i++) {
        for (let j = 0; j < req.user.userInfo.teacher_info.grades[i].subjects.length; j++) {
            let canPush = true;
            for (let k = 0; k < seniorGSList.length; k++) {
                if (seniorGSList[k].grade == req.user.userInfo.teacher_info.grades[i].grade && seniorGSList[k].subject == req.user.userInfo.teacher_info.grades[i].subjects[j].subject) {
                    canPush = false;
                }
            }
            for (let k = 0; k < pendingSeniorGSList.length; k++) {
                if (pendingSeniorGSList[k].grade == req.user.userInfo.teacher_info.grades[i].grade && pendingSeniorGSList[k].subject == req.user.userInfo.teacher_info.grades[i].subjects[j].subject) {
                    canPush = false;
                }
            }
            if (canPush) {
                gsList.push({
                    grade: req.user.userInfo.teacher_info.grades[i].grade,
                    subject: req.user.userInfo.teacher_info.grades[i].subjects[j].subject,
                    process: 0
                });
            }
        }
    }
    let ep = new eventproxy();
    ep.fail((err) => {
        return result(res, {statusCode: 905, message: err.message});
    });
    ep.after('item', gsList.length, (list)=> {
        for (let i = 0; i < gsList.length; i++) {
            gsList[i].process = Math.floor(list[i].total / 3);
            if (list[i].total >= 300 && list[i].avg_stars < 4.5) {
                gsList.process = 95;
            } else if (list[i].total >= 300 && list[i].avg_stars >= 4.5) {
                gsList[i].process = 100;
            } else if (gsList[i].process > 95) {
                gsList[i].process = 95;
            }
            if (gsList[i].process >= 100) {
                gsList[i].process = 100;
            }
        }
        return result(res, {statusCode: 900, gsList: gsList, seniorGSList: seniorGSList, pendingSeniorGSList: pendingSeniorGSList});
    });
    for (let i = 0; i < gsList.length; i++) {
        db.orders.find({
            t_id: req.body.userID,
            grade: gsList[i].grade,
            subject: gsList[i].subject,
            status: 'finished'
        }, {stars: 1}).sort({create_time: -1}).skip(0).limit(1000).toArray(ep.group('item', (doc)=> {
            let all_stars = 0;
            for (let i = 0; i < doc.length; i++) {
                all_stars += Number.parseInt(doc[i].stars || 4);
            }
            return {total: doc.length, avg_stars: all_stars / doc.length};
        }));
    }
};
