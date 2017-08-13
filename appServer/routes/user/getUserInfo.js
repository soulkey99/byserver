/**
 * Created by MengLei on 2015/5/31.
 */
"use strict";
const config = require('../../../config');
const objectId = require('mongojs').ObjectId;
const result = require('../../utils/result');
const log = require('../../../utils/log').http;
const proxy = require('../../../common/proxy');
const eventproxy = require('eventproxy');
const point2level = require('../../utils/point2level');

module.exports = function (req, res) {
    //通过用户id，获取用户信息(姓名，头像，教师积分等)
    proxy.User.getUserById(req.body.u_id || req.body.userID, (err, user)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        if (!user) {
            return result(res, {statusCode: 902, message: '用户不存在！'});
        }
        let info = {
            nick: user.nick,
            phone: user.phone,
            name: user.userInfo.name || '',
            family_name: '',
            given_name: '',
            gender: user.userInfo.gender || '',
            avatar: user.userInfo.avatar || '',
            bonus: user.userInfo.bonus || 0,
            address: user.userInfo.address,
            school: user.userInfo.school
        };
        if (user.userType == 'teacher') {
            info.teacher_info = {
                grades: user.userInfo.teacher_info.grades,
                verify_type: user.userInfo.teacher_info.verify_type || '',
                verify_desc: user.userInfo.teacher_info.verify_desc || '',
                point: user.userInfo.teacher_info.point || 0,
                senior_grades: user.userInfo.teacher_info.senior_grades,
                senior_type: user.userInfo.teacher_info.senior_type,
                order_type: user.userInfo.teacher_info.order_type,
                senior_grabbed: user.userInfo.teacher_info.senior_grabbed,
                senior_info: user.userInfo.teacher_info.senior_info.toObject()
            };
            info.teacher_info.level = point2level(info.teacher_info.point);  //星级
        }
        result(res, {statusCode: 900, info: info});
    });
};
