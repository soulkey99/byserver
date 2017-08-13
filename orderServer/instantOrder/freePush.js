/**
 * Created by MengLei on 2015/8/13.
 */
"use strict";
const db = require('../../config').db;
const config = require('../../config');
const objectId = require('mongojs').ObjectId;
const proxy = require('../../common/proxy');
const log = require('./../../utils/log').order;
const dnode = require('../utils/dnodeClient');
const zrpc = require('../../utils/zmqClient');

//对自由抢单的问题进行推送
var freePush = function (o_id) {
    proxy.Order.getOrderDetail(o_id, '', function (err, orderInfo) {
        if (err) {
            return log.error('free push, get order detail error, o_id: ' + o_id + ', error: ' + err.message);
        }
        if(orderInfo.grade == 'special'){   //推送特殊订单
            let query = {'userType': 'teacher', 'status': 'online', 'userInfo.special_info.subject': orderInfo.subject};
            return pushWithQuery(query, orderInfo);
        }
        db.userConf.find({type: 'teacher', delete: false}, {phonenum: 1}, function (err, doc) {
            if (err) {
                return log.error('free push, find full time teacher error: ' + err.message);
            }
            var t_list = [];    //内部教师的手机号
            for (var i = 0; i < doc.length; i++) {
                t_list.push(doc[i].phonenum);
            }
            //查询条件，query1：外部教师，query2：内部教师，query3：外部渠道教师。
            var query1 = {"status": "online", "userType": "teacher", phone: {$nin: t_list}, "userInfo.teacher_info.channel": {$in: [null, ""]}};
            var query2 = {"status": "online", "userType": "teacher", phone: {$in: t_list}};
            var query3 = {"status": "online", "userType": "teacher", phone: {$nin: t_list}, "userInfo.teacher_info.channel": {$nin: [null, ""]}};

            // //搜索分三种情况，1、只有年级，2、只有科目，3、既有年级也有科目(直接放到付费订单和免费订单的搜索逻辑中)
            // if (orderInfo.grade) {
            //     if (orderInfo.subject) {  //年级科目都有
            //         query1["userInfo.teacher_info.grades"] = {
            //             $elemMatch: {
            //                 grade: orderInfo.grade,
            //                 subjects: {$elemMatch: {subject: orderInfo.subject}}
            //             }
            //         };
            //         query2["userInfo.teacher_info.grades"] = {
            //             $elemMatch: {
            //                 grade: orderInfo.grade,
            //                 subjects: {$elemMatch: {subject: orderInfo.subject}}
            //             }
            //         };
            //     } else {    //只有年级
            //         query1["userInfo.teacher_info.grades"] = {$elemMatch: {grade: orderInfo.grade}};
            //         query2["userInfo.teacher_info.grades"] = {$elemMatch: {grade: orderInfo.grade}};
            //     }
            // } else {
            //     if (orderInfo.subject) {    //只有科目
            //         query1["userInfo.teacher_info.grades"] = {$elemMatch: {subjects: {$elemMatch: {subject: orderInfo.subject}}}};
            //         query2["userInfo.teacher_info.grades"] = {$elemMatch: {subjects: {$elemMatch: {subject: orderInfo.subject}}}};
            //     }
            // }

            //付费订单只推送三星以上的教师，即积分170分以上的教师
            // if (orderInfo.price > 0) {
            //     query1["stars"] = {$gte: 170};
            //     query2["stars"] = {$gte: 170};
            // }

            //patch20150911，只给9月7日之前注册的老师，以及9月7日之后注册并提交了身份证或者资格证的老师推送订单
            //query['$or'] = [{'userInfo.create_time': {$lte: 1441584000000}}, {'userInfo.teacher_info.id_pic': {$ne: ''}, 'userInfo.teacher_info.certificate_pic': {$ne: ''}}];

            //patch20151019：9月7日之前注册的教师以及9月7日之后注册并审核通过的教师才推题
            //query['$or'] = [{'userInfo.create_time': {$lte: 1441584000000}}, {'userInfo.teacher_info.verify_type': 'verified'}];

            //patch final：最终目标是只给审核通过的教师推题
            query1['userInfo.teacher_info.verify_type'] = 'verified';
            //query2不需要加这个过滤，因为都是自己内部的专职老师
            //query3['userInfo.teacher_info.verify_type'] = 'verified';
            //query3是外部的渠道教师，也要增加这个限制
            query3['userInfo.teacher_info.verify_type'] = 'verified';

            //付费订单只推送付费教师，免费订单推送免费老师和部分付费教师
            if (orderInfo.type == 'senior') {
                //query1['userInfo.teacher_info.senior_type'] = 'verified';   //仅认证过的付费教师
                //query2['userInfo.teacher_info.senior_type'] = 'verified';
                //后来修改了规则，付费订单默认推所有付费老师的付费科目配置中符合条件的科目
                //并且是认证的学科才能推送
                query1["userInfo.teacher_info.senior_grades"] = {
                    $elemMatch: {
                        grade: orderInfo.grade,
                        subjects: {$elemMatch: {subject: orderInfo.subject}}
                    }
                };
                query2["userInfo.teacher_info.senior_grades"] = {
                    $elemMatch: {
                        grade: orderInfo.grade,
                        subjects: {$elemMatch: {subject: orderInfo.subject}}
                    }
                };
                query3["userInfo.teacher_info.senior_grades"] = {
                    $elemMatch: {
                        grade: orderInfo.grade,
                        subjects: {$elemMatch: {subject: orderInfo.subject}}
                    }
                };
            } else {    //所有未通过付费认证的教师，以及选择了接受所有题目的通过付费认证的教师
                query1["userInfo.teacher_info.grades"] = {
                    $elemMatch: {
                        grade: orderInfo.grade,
                        subjects: {$elemMatch: {subject: orderInfo.subject}}
                    }
                };
                query2["userInfo.teacher_info.grades"] = {
                    $elemMatch: {
                        grade: orderInfo.grade,
                        subjects: {$elemMatch: {subject: orderInfo.subject}}
                    }
                };
                query3["userInfo.teacher_info.grades"] = {
                    $elemMatch: {
                        grade: orderInfo.grade,
                        subjects: {$elemMatch: {subject: orderInfo.subject}}
                    }
                };
            }

            //首先给外部教师推送订单
            pushWithQuery(query1, orderInfo);
            //console.log('push with query1: ' + JSON.stringify(query1));

            //给内部教师的推送订单时间延迟5秒钟，首先应该判断订单的当前状态，如果仍然是推送中，那么才进行继续的推送，如果是已经接单了，那么就没有必要再推送了。
            db.byConfig.findOne({_id: 'teacherDelay'}, function (err3, doc3) {
                if (err3) {
                    return log.error('free push get by config delay time error: ' + err3.message);
                }
                var delay = 3000;   //默认延时5000毫秒
                var extDelay = 6000;    //外部渠道延迟
                if (doc3) {
                    delay = doc3.time;
                    extDelay = doc3.extDelay;
                }
                setTimeout(function () {
                    proxy.Order.getOrderStatus(orderInfo.o_id, function (err2, doc2) {
                        if (err2) {
                            return log.error('free push check order status error: ' + err2.message);
                        }
                        if (doc2 && doc2.status == 'pending') {
                            //console.log('push with query2: ' + JSON.stringify(query2));
                            pushWithQuery(query2, orderInfo);
                        }
                    });
                }, delay);
                setTimeout(function () {
                    proxy.Order.getOrderStatus(orderInfo.o_id, function (err2, doc2) {
                        if (err2) {
                            return log.error('free push check order status error: ' + err2.message);
                        }
                        if (doc2 && doc2.status == 'pending') {
                            //console.log('push with query2: ' + JSON.stringify(query2));
                            pushWithQuery(query3, orderInfo);
                        }
                    });
                }, extDelay);
            });
        });
    });
};

function pushWithQuery(query, orderInfo) {
    db.users.find(query, {_id: 1}, function (err, doc) {
        if (err) {
            //handle error
            console.log('push with query error: ' + err.message);
            log.error('push with query error: ' + err.message);
        } else {
            //满足条件的教师uid列表
            var uids = [];
            for (var i = 0; i < doc.length; i++) {
                uids.push(doc[i]._id.toString());
            }

            pushUids2DB(uids, orderInfo);
            zrpc('mqttServer', 'push', {content: orderInfo, to: uids}, function (err3, resp) {
                //
                if (err) {
                    log.error('free push order error: ' + err3.message);
                } else {
                    log.trace('free push order result: ' + JSON.stringify(resp) + ', teacher count: ' + uids.length);
                }
            });
        }
    });
}

//此处记录该订单推送的教师的uid列表
function pushUids2DB(uids, orderInfo) {
    if (uids.length > 0) {
        //对所有的uid，在以o_id为_id的记录中，执行inc 加一的操作，记录该条订单对该用户推送的次数
        var incObj = {};
        for (var i = 0; i < uids.length; i++) {
            incObj['uids.' + uids[i]] = 1;
        }

        db.push.update({_id: new objectId(orderInfo.o_id)}, {
            $inc: incObj,
            $set: {create_time: orderInfo.create_time}
        }, {upsert: true});
    }
}

freePush.pushUids2DB = pushUids2DB;

module.exports = freePush;
