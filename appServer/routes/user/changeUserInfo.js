/**
 * Created by zhengyi on 15/2/25.
 */
"use strict";
const config = require('../../../config');
const proxy = require('./../../../common/proxy');
const result = require('../../utils/result');
const log = require('../../../utils/log').http;
const addBonus = require('../../utils/addBonus');
const ip = require('./../../../utils/ipAddr');
const dbLog = require('../../../utils/log').dbLog;

module.exports = function (req, res) {
    proxy.User.getUserById(req.body.userID, (err, user)=> {
        if (err) {
            log.error('change user info: ' + err.message);
            return result(res, {statusCode: 905, message: err.message});
        }
        if (!user) {
            return result(res, {statusCode: 902, message: '用户不存在！'});
        }
        if (user.userType != 'student' && user.userType != 'teacher') {
            return result(res, {statusCode: 904, message: '用户类型不正确！'});
        }
        if (req.body.nick != undefined) {
            //如果用户修改昵称，那么记录用户的修改行为
            var logInfo = {
                api: 'v1',
                userType: req.body.userType,
                platform: '',
                client: '',
                channel: '',
                ip: ip(req),
                old_nick: user.nick,
                new_nick: req.body.nick
            };
            if (req.headers.platform) {
                logInfo.platform = req.headers.platform.toLowerCase();
            }
            if (req.headers.client) {
                logInfo.client = req.headers.client.toLowerCase();
            }
            if (req.headers.channel) {
                logInfo.channel = req.headers.channel;
            }
            dbLog(req.body.userID, 'changeNick', logInfo);
            user.nick = req.body.nick;
        }
        if (req.body.intro != undefined) {    //个性签名
            user.intro = req.body.intro;
        }
        if (req.body.autoReply != undefined) {    //教师接单后的自动回复
            user.autoReply = req.body.autoReply;
        }
        if (req.body.name != undefined) {  //姓名
            user.userInfo.name = req.body.name;
            //console.log('set name: ' + req.body.name);
        }
        if (req.body.family_name != undefined) {  //姓名
            user.userInfo.family_name = req.body.family_name;
        }
        if (req.body.given_name != undefined) {  //姓名
            user.userInfo.given_name = req.body.given_name;
        }
        if (req.body.avatar != undefined) {  //姓名
            user.userInfo.avatar = req.body.avatar;
        }
        if (req.body.gender != undefined) {  //性别
            user.userInfo.gender = req.body.gender;
        }
        if (req.body.id_no != undefined) {  //身份证号
            user.userInfo.id_no = req.body.id_no;
        }
        if (req.body.age != undefined) {  //年龄
            user.userInfo.age = req.body.age;
        }
        if (req.body.birthday != undefined) {  //出生日期
            user.userInfo.birthday = req.body.birthday;
        }
        if (req.body.country != undefined) {  //国家
            user.userInfo.address.country = req.body.country;
        }
        if (req.body.province != undefined) {  //省份
            user.userInfo.address.province = req.body.province;
        }
        if (req.body.city != undefined) {  //城市
            user.userInfo.address.city = req.body.city;
        }
        if (req.body.region != undefined) {  //区
            user.userInfo.address.region = req.body.region;
        }
        if (req.body.address != undefined) {  //地址
            user.userInfo.address.address = req.body.address;
        }
        if (req.body.school != undefined) {  //
            user.userInfo.school = req.body.school;
        }
        if (user.userType == 'student') {  //如果用户类型是学生
            if (req.body.grade != undefined) {  //年级只是一个string，小学、初中、高中三种类型
                user.userInfo.student_info.grade = req.body.grade;
            }
        } else if (user.userType == 'teacher') {   //如果用户类型是教师
            if (req.body.grades != undefined) {  //年级这里传上来的是一个object
                try {
                    user.userInfo.teacher_info.grades = JSON.parse(req.body.grades);
                    user.userInfo.teacher_info.verify_type = 'waitingVerify';
                } catch (ex) {
                    log.error('change teacher info error: ' + ex.message);
                    return result(res, {statusCode: 942, message: '年级学科字段json解析失败！'});
                }
            }
        }
        //修改昵称和头像之后，增加一个完善信息积分
        if ((req.body.avatar != undefined) && (req.body.nick != undefined)) {
            addBonus(req.body.userID, '1');
        }
        user.save((err, doc)=> {
            if (err) {
                //handle error
                result(res, {statusCode: 905, message: 'modify userInfo error: ' + err.message});
            } else {
                //
                log.trace('change user info success. user id: ' + doc._id.toString());
                result(res, {statusCode: 900, nick: doc.nick, userInfo: doc.userInfo.toObject()});
            }
        });
    });
};