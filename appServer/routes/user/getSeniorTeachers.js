/**
 * Created by MengLei on 2016/3/24.
 */
"use strict";

let proxy = require('../../../common/proxy');
let log = require('../../../utils/log').http;
let result = require('../../utils/result');

//获取付费教师列表
module.exports = function (req, res) {
    let start = parseInt(req.body.startPos || '1') - 1;
    let count = parseInt(req.body.pageSize || '10');
    proxy.User.getUsersByQuery({
        $and: [{'userInfo.teacher_info.senior_grades': {$ne: []}}, {'userInfo.teacher_info.senior_grades': {$ne: null}}],
        'userInfo.teacher_info.senior_type': {$in: ['verified', 'waitingVerify', 'fail']}
    }, {
        skip: start,
        limit: count
    }, function (err, doc) {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        let list = [];
        for (let i = 0; i < doc.length; i++) {
            list.push({
                userID: doc[i].userID,
                nick: doc[i].nick,
                avatar: doc[i].userInfo.avatar,
                honors: doc[i].userInfo.teacher_info.senior_info.honors,
                senior_grabbed: doc[i].userInfo.teacher_info.senior_grabbed
            });
        }
        result(res, {statusCode: 900, list: list});
    });
};
