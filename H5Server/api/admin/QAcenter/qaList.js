/**
 * Created by MengLei on 2015/9/19.
 */
"use strict";
const proxy = require('../../../../common/proxy');
var db = require('../../../../config').db;
var objectId = require('mongojs').ObjectId;
var result = require('../../../utils/result');
var eventproxy = require('eventproxy');
var log = require('./../../../../utils/log').h5;

//给定一个教师手机号或者一个学生手机号，或者兼有，根据开始时间和结束时间，返回相关的订单列表
module.exports = function (req, res) {
    // let param = {
    //     s_phone: req.body.s_phone,
    //     t_phone: req.body.t_phone,
    //     status: req.body.status,
    //     type: req.body.type,
    //     grade: req.body.grade,
    //     subject: req.body.subject,
    //     empty: req.body.empty,
    //     startTime: req.body.startTime,
    //     endTime: req.body.endTime,
    //     startPos: req.body.startPos, pageSize: req.body.pageSize,
    //     channel: req.body.channel,
    //     t_nick: req.body.t_nick,
    //     s_nick: req.body.s_nick,
    //     t_id: req.body.t_id,
    //     s_id: req.body.s_id
    // };
    // proxy.Order.getQAList(param, (err, list)=> {
    //     if (err) {
    //         return result(res, {statusCode: 905, message: err.message});
    //     }
    //     result(res, {statusCode: 900, list});
    // });
    // return;
    var start = parseInt(req.body.startPos || 1) - 1;
    var count = parseInt(req.body.pageSize || 10);
    var ep = new eventproxy();
    ep.all('t_conf', 's_info', 't_info', function (t_conf, s_info, t_info) {
        var o_query = {};
        if (s_info) {
            o_query['s_id'] = s_info.s_id;
        }
        if (t_info) {
            o_query['t_id'] = t_info.t_id;
        }
        if (req.body.startTime && req.body.endTime) {
            o_query['create_time'] = {$gte: parseFloat(req.body.startTime), $lte: parseFloat(req.body.endTime)};
        } else if (req.body.startTime) {
            o_query['create_time'] = {$gte: parseFloat(req.body.startTime)};
        } else if (req.body.endTime) {
            o_query['create_time'] = {$lte: parseFloat(req.body.endTime)};
        }
        if (req.body.status) {
            o_query['status'] = req.body.status;
        }
        if (req.body.empty == 'true') {
            o_query['$or'] = [{chat_msg: {$size: 2}}, {chat_msg: {$size: 2}}];
        }
        if (req.body.grade) {
            o_query['grade'] = req.body.grade;
        }
        if (req.body.subject) {
            o_query['subject'] = req.body.subject;
        }

        db.orders.find(o_query, {
            _id: 1,
            s_id: 1,
            t_id: 1,
            subject: 1,
            grade: 1,
            q_msg: 1,
            chat_msg: 1,
            create_time: 1,
            status: 1,
            start_time: 1,
            end_time: 1
        }).sort({create_time: -1}).skip(start < 0 ? 0 : start).limit(count).toArray(function (err, doc) {
            if (err) {
                //
            } else {
                var list = [];
                var idObj = {};
                var idList = [];
                for (var i = 0; i < doc.length; i++) {
                    list.push({
                        o_id: doc[i]._id.toString(),
                        s_id: doc[i].s_id,
                        s_phone: '',
                        s_nick: '',
                        s_avatar: '',
                        t_id: doc[i].t_id || '',
                        t_phone: '',
                        t_nick: '',
                        t_avatar: '',
                        t_name: '',
                        staff: false,
                        grade: doc[i].grade,
                        subject: doc[i].subject,
                        status: doc[i].status,
                        create_time: doc[i].create_time,
                        start_time: doc[i].start_time,
                        end_time: doc[i].end_time || 0,
                        q_count: doc[i].q_msg.length,
                        chat_count: doc[i].chat_msg.length
                    });
                    idObj[doc[i].s_id] = 1;
                    if (doc[i].t_id) {
                        idObj[doc[i].t_id] = 1;
                    }
                }
                var keys = Object.keys(idObj);
                for (var j = 0; j < keys.length; j++) {
                    idList.push(new objectId(keys[j]));
                }
                //查询t_id、s_id对应的信息，赋值给list
                db.users.find({_id: {$in: idList}}, {
                    _id: 1,
                    phone: 1,
                    nick: 1,
                    'userInfo.avatar': 1
                }, function (err2, doc2) {
                    if (err2) {
                        //
                    } else {
                        var t_phoneObj = {};
                        for (var i = 0; i < list.length; i++) {
                            for (var j = 0; j < doc2.length; j++) {
                                if (list[i].s_id == doc2[j]._id.toString()) {
                                    list[i].s_phone = doc2[j].phone;
                                    list[i].s_nick = doc2[j].nick;
                                    list[i].s_avatar = doc2[j].userInfo.avatar;
                                }
                                if (list[i].t_id == doc2[j]._id.toString()) {
                                    list[i].t_phone = doc2[j].phone;
                                    list[i].t_nick = doc2[j].nick;
                                    list[i].t_avatar = doc2[j].userInfo.avatar;
                                    list[i].t_name = '';
                                    list[i].staff = false;
                                    t_phoneObj[doc2[j].phone] = 1;
                                }
                            }
                        }
                        //查询所有的t_phone，是否属于内部人员
                        var t_phones = Object.keys(t_phoneObj);
                        db.userConf.find({phonenum: {$in: t_phones}, type: 'teacher'}, {
                            phonenum: 1,
                            name: 1
                        }, function (err3, doc3) {
                            if (err3) {
                                //
                            } else {
                                for (var i = 0; i < list.length; i++) {
                                    for (var j = 0; j < doc3.length; j++) {
                                        if (list[i].t_phone == doc3[j].phonenum) {
                                            list[i].t_name = doc3[j].name;
                                            list[i].staff = true;
                                        }
                                    }
                                }
                                result(res, {statusCode: 900, list: list});
                            }
                        });
                    }
                });
            }
        });
    });
    ep.fail(function (err) {
        result(res, {statusCode: 905, message: err.message});
    });
    if (req.body.t_phone) {
        db.userConf.findOne({phonenum: req.body.t_phone}, {name: 1, phonenum: 1}, function (err, doc) {
            if (err) {
                ep.emit('error', err);
            } else {
                ep.emit('t_conf', doc);
            }
        });
        db.users.findOne({phone: req.body.t_phone}, {
            _id: 1,
            nick: 1,
            phone: 1,
            'userInfo.avatar': 1
        }, function (err, doc) {
            if (err) {
                ep.emit('error', err);
            } else {
                if (doc) {
                    var info = {
                        t_id: doc._id.toString(),
                        phone: doc.phone,
                        nick: doc.nick,
                        avatar: doc.userInfo.avatar
                    };
                    ep.emit('t_info', info);
                } else {
                    ep.emit('t_info', null);
                }
            }
        })
    } else {
        ep.emit('t_conf', null);
        ep.emit('t_info', null);
    }
    if (req.body.s_phone) {
        db.users.findOne({phone: req.body.s_phone}, {
            _id: 1,
            nick: 1,
            phone: 1,
            'userInfo.avatar': 1
        }, function (err, doc) {
            if (err) {
                ep.emit('error', err);
            } else {
                if (doc) {
                    var info = {
                        s_id: doc._id.toString(),
                        phone: doc.phone,
                        nick: doc.nick,
                        avatar: doc.userInfo.avatar
                    };
                    ep.emit('s_info', info);
                } else {
                    ep.emit('s_info', null);
                }
            }
        })
    } else {
        ep.emit('s_info', null);
    }

};