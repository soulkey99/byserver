/**
 * Created by MengLei on 2015/12/11.
 */
"use strict";
const model = require('../model');
const eventproxy = require('eventproxy');
const Order = model.Order;
const ObjectId = require('mongoose').Types.ObjectId;
const UserProxy = require('./user/user');
const UserConfProxy = require('./user/userConf');
const FollowProxy = require('./user/follow');
const MoneyProxy = require('./money');


/**
 * 根据ID查询即时订单记录
 * Callback:
 * - err, 数据库异常
 * - doc, 即时订单记录
 * @param {String} id 即时订单ID
 * @param {Function} callback 回调函数
 */
exports.getOrderByID = function (id, callback) {
    Order.findOne({_id: id}, callback);
};

/**
 * 根据query查询即时订单记录
 * Callback:
 * - err, 数据库异常
 * - doc, 即时订单记录
 * @param {Object} query 查询条件
 * @param {Object} opt 查询条件
 * @param {Function} callback 回调函数
 */
exports.getOrderByQuery = function (query, opt, callback) {
    Order.find(query, {}, opt, callback);
};

/**
 * 根据给定条件查询即时订单记录
 * Callback:
 * - err, 数据库异常
 * - doc, 即时订单记录id的list
 * @param {Object} query 给定条件
 * @param {Object} opt 给定条件
 * @param {Function} callback 回调函数
 */
exports.getO_idsByQuery = function (query, opt, callback) {
    Order.find(query, {_id: 1, create_time: 1}, opt, callback);
};

/**
 * 根据用户查询对应的即时订单列表
 * Callback:
 * - err, 数据库异常
 * - doc, 离线问题内容
 * @param {Object} param 输入参数param={userID: '', userType: '', startPos: '', pageSize: '', status: '', grade: '', subject: '', status}
 * @param {Function} callback 回调函数
 */
exports.getOrderList = function (param, callback) {
    var start = parseInt(param.startPos || '1') - 1;
    var count = parseInt(param.pageSize || '10');
    var query = {};
    var statusArray = [];
    if (param.status) {
        try {
            statusArray = JSON.parse(param.status);
            if (statusArray.length > 0) {
                query.status = {$in: statusArray};
            }
        } catch (ex) {
            //
        }
    }
    //判断如果是教师身份，则userID对应t_id，如果是学生身份则userID对应userID
    if (param.userType == 'teacher') {
        query['t_id'] = param.userID;
    } else {
        query['s_id'] = param.userID;
    }
    //年级
    if (param.grade) {
        query['grade'] = param.grade;
    }
    //学科
    if (param.subject) {
        query['subject'] = param.subject;
    }
    Order.find(query, {}, {skip: start, limit: count, sort: '-create_time'}, function (err, doc) {
        if (err) {
            return callback(err);
        }
        var list = [];
        //集合教师信息、学生信息、支付信息之后，统一归类处理
        var ep = new eventproxy();
        ep.fail(callback);
        ep.all('u_info', 'pay_info', 'follow_info', function (u_info_list, pay_info_list, follow_info_list) {
            for (var i = 0; i < list.length; i++) {
                for (var j = 0; j < pay_info_list.length; j++) {
                    if (pay_info_list[j].money_id == list[i].money_id) {
                        list[i].reward_status = pay_info_list[j].status;
                        break;
                    }
                }
                for (var k = 0; k < u_info_list.length; k++) {
                    if (u_info_list[k].u_id == list[i].t_id) {
                        list[i].t_info.avatar = u_info_list[k].avatar;
                        list[i].t_info.point = u_info_list[k].point;
                        list[i].t_info.nick = u_info_list[k].nick;
                        list[i].t_info.name = u_info_list[k].name;
                        list[i].t_info.level = u_info_list[k].level;
                    }
                    if (u_info_list[k].u_id == list[i].s_id) {
                        list[i].s_info.avatar = u_info_list[k].avatar;
                        list[i].s_info.nick = u_info_list[k].nick;
                    }
                }
                for (var m = 0; m < follow_info_list.length; m++) {
                    if (follow_info_list[m].u_id == list[i].t_id) {
                        list[i].t_info.followed = follow_info_list[m].followed;
                    }
                    if (follow_info_list[m].u_id == list[i].s_id) {
                        list[i].s_info.followed = follow_info_list[m].followed;
                    }
                }
            }
            callback(null, list);
        });
        var u_ids = [];
        var m_ids = []; //short for money_id
        for (var i = 0; i < doc.length; i++) {
            list.push({
                o_id: doc[i]._id.toString(),
                addPrice: doc[i].addPrice,
                create_time: doc[i].create_time,
                start_time: doc[i].start_time,
                duration: doc[i].duration,
                grade: doc[i].grade,
                type: doc[i].type || '',
                subject: doc[i].subject,
                price: doc[i].price,
                money: doc[i].money,
                q_msg: doc[i].q_msg,
                remark: doc[i].remark,
                remark_s: doc[i].remark_s,
                s_id: doc[i].s_id,
                s_info: {
                    avatar: '',
                    followed: false,
                    family_name: '',
                    given_name: '',
                    name: '',
                    nick: ''
                },
                specifyTeacher: doc[i].specifyTeacher,
                stars: doc[i].stars,
                stars_s: doc[i].stars_s,
                status: doc[i].status,
                t_id: doc[i].t_id,
                t_info: {
                    avatar: '',
                    followed: false,
                    family_name: '',
                    given_name: '',
                    level: 0,
                    point: 0,
                    name: '',
                    nick: ''
                },
                money_id: doc[i].money_id,
                reward_status: ''
            });
            if (doc[i].t_id && u_ids.indexOf(doc[i].t_id) == -1) {
                u_ids.push(doc[i].t_id);
            }
            if (doc[i].s_id && u_ids.indexOf(doc[i].s_id) == -1) {
                u_ids.push(doc[i].s_id);
            }
            if (doc[i].money_id && m_ids.indexOf(doc[i].money_id) == -1) {
                m_ids.push(doc[i].money_id);
            }
        }
        UserProxy.getUsersByIds(u_ids, ep.done('u_info', function (doc) {
            var list = [];
            for (var i = 0; i < doc.length; i++) {
                list.push({
                    avatar: doc[i].userInfo.avatar,
                    nick: doc[i].nick,
                    u_id: doc[i]._id.toString(),
                    name: doc[i].userInfo.name,
                    point: doc[i].userInfo.teacher_info.point || 0,
                    level: point2level(doc[i].userInfo.teacher_info.point || 0)
                });
            }
            return list;
        }));
        MoneyProxy.getMoneyInfoByIDs(m_ids, ep.done('pay_info', function (doc) {
            var list = [];
            for (var i = 0; i < doc.length; i++) {
                var st = 'fail';
                if (doc[i].status == 'paid') {
                    st = 'paid';
                } else {
                    if (doc.client_status == 'pending') {
                        st = 'pending';
                    } else if (doc.client_status == 'success') {
                        st = 'paid';
                    } else if (doc.client_status == 'cancel') {
                        st = 'cancel';
                    }
                }
                list.push({money_id: doc[i]._id.toString(), status: st});
            }
            return list;
        }));
        FollowProxy.isFollowingThese(param.userID, u_ids, ep.done('follow_info'));
    });
};

/**
 * 根据用户查询对应的即时订单列表
 * Callback:
 * - err, 数据库异常
 * - doc, 离线问题内容
 * @param {Object} param 输入参数 {s_phone: '', t_phone: '', status: '', type: '', grade: '', subject: '', empty: '', startTime: '', endTime: '', startPos: '', pageSize: '', channel: '', t_nick: '', s_nick: '', t_id: '', s_id: ''}
 * @param {Function} callback 回调函数
 */
exports.getQAList = function (param, callback) {
    let start = Number.parseInt(param.startPos || '1') - 1;
    let count = Number.parseInt(param.pageSize || '10');
    let ep = new eventproxy();
    ep.all('s_id', 't_id', (s_id, t_id)=> {
        let query = {};
        if (param.startTime && param.endTime) {
            query['create_time'] = {$gte: Number.parseFloat(param.startTime), $lte: Number.parseFloat(param.endTime)};
        } else if (param.startTime) {
            query['create_time'] = {$gte: Number.parseFloat(param.startTime)};
        } else if (param.endTime) {
            query['create_time'] = {$lte: Number.parseFloat(param.endTime)};
        }
        if (s_id) {
            query['s_id'] = {$in: s_id};
        }
        if (t_id) {
            query['t_id'] = {$in: t_id};
        }
        if (param.status) {
            query['status'] = param.status;
        }
        if (param.type) {
            query['type'] = param.type;
        }
        if (param.empty == 'true') {
            query['$or'] = [{chat_msg: {$size: 1}}, {chat_msg: {$size: 2}}, {chat_msg: {$size: 3}}];
        }
        if (param.grade) {
            query['grade'] = param.grade;
        }
        if (param.subject) {
            query['subject'] = param.subject;
        }
        Order.find(query, {}, {sort: '-create_time', skip: start, limit: count}, (err, doc)=> {
            if (err) {
                return callback(err);
            }
            let list = [];
            let u_ids = [];
            let m_ids = [];
            for (let i = 0; i < doc.length; i++) {
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
                    type: doc[i].type || '',
                    money_id: doc[i].money_id,
                    money: doc[i].money,
                    create_time: doc[i].create_time,
                    charge_time: doc[i].charge_time,
                    start_time: doc[i].start_time,
                    end_time: doc[i].end_time || 0,
                    q_count: doc[i].q_msg.length,
                    chat_count: doc[i].chat_msg.length,
                    stars: doc[i].stars
                });
                // console.log('stars: ' + doc[i].stars);
                if (doc[i].t_id && u_ids.indexOf(doc[i].t_id) == -1) {
                    u_ids.push(doc[i].t_id);
                }
                if (doc[i].s_id && u_ids.indexOf(doc[i].s_id) == -1) {
                    u_ids.push(doc[i].s_id);
                }
                if (doc[i].money_id && m_ids.indexOf(doc[i].money_id) == -1) {
                    m_ids.push(doc[i].money_id);
                }
            }
            let ep = new eventproxy();
            ep.all('u_info', 'm_info', (u_info, m_info)=> {
                let phones = [];
                for (let i = 0; i < list.length; i++) {
                    for (let j = 0; j < u_info.length; j++) {
                        if (list[i].t_id == u_info[j].u_id) {
                            list[i].t_phone = u_info[j].phone;
                            list[i].t_nick = u_info[j].nick;
                            list[i].t_avatar = u_info[j].avatar;
                            list[i].t_name = '';
                        }
                        if (list[i].s_id == u_info[j].u_id) {
                            list[i].s_phone = u_info[j].phone;
                            list[i].s_nick = u_info[j].nick;
                            list[i].s_avatar = u_info[j].avatar;
                            if (phones.indexOf(u_info[j].phone) == -1) {
                                phones.push(u_info[j].phone);
                            }
                        }
                    }
                    for (let j = 0; j < m_info.length; j++) {
                        if (m_info[j].money_id == list[i].money_id) {
                            list[i].reward_status = m_info[j].status;
                            break;
                        }
                    }
                }
                UserConfProxy.getUserConfByQuery({
                    phonenum: {$in: phones},
                    type: 'teacher',
                    delete: false
                }, (err, doc)=> {
                    if (err) {
                        return callback(err);
                    }
                    for (let i = 0; i < list.length; i++) {
                        for (let j = 0; j < doc.length; j++) {
                            if (list[i].t_phone == doc[j].phonenum) {
                                list[i].t_name = doc[j].name;
                                list[i].staff = true;
                            }
                        }
                    }
                    callback(null, list);
                });
            });
            ep.fail(callback);
            UserProxy.getUsersByIds(u_ids, ep.done('u_info', function (doc) {
                var list = [];
                for (var i = 0; i < doc.length; i++) {
                    list.push({
                        avatar: doc[i].userInfo.avatar,
                        nick: doc[i].nick,
                        phone: doc[i].phone,
                        u_id: doc[i]._id.toString(),
                        name: doc[i].userInfo.name,
                        point: doc[i].userInfo.teacher_info.point || 0,
                        level: point2level(doc[i].userInfo.teacher_info.point || 0)
                    });
                }
                return list;
            }));
            MoneyProxy.getMoneyInfoByIDs(m_ids, ep.done('m_info', function (doc) {
                var list = [];
                for (var i = 0; i < doc.length; i++) {
                    var st = 'fail';
                    if (doc[i].status == 'paid') {
                        st = 'paid';
                    } else {
                        if (doc.client_status == 'pending') {
                            st = 'pending';
                        } else if (doc.client_status == 'success') {
                            st = 'paid';
                        } else if (doc.client_status == 'cancel') {
                            st = 'cancel';
                        }
                    }
                    list.push({money_id: doc[i]._id.toString(), status: st});
                }
                return list;
            }));
        });
    });
    ep.fail(callback);
    if (param.s_id) {
        if (ObjectId.isValid(param.s_id)) {
            ep.emit('s_id', [param.s_id]);
        } else {
            ep.throw(new Error('s_id格式不正确！'));
        }
    } else if (param.s_phone) {
        model.User.findOne({phone: param.s_phone}, {_id: 1}, ep.done('s_id', (user)=> {
            if (!user) {
                return null;
            }
            return [user._id.toString()];
        }));
    } else if (param.s_nick) {
        model.User.find({nick: param.s_nick}, {_id: 1}, ep.done('s_id', (user)=> {
            if (user.length == 0) {
                return ep.throw('学生昵称不存在！');
            }
            let ids = [];
            for (let i = 0; i < user.length; i++) {
                ids.push(user[i]._id.toString());
            }
            return ids;
        }));
    } else {
        ep.emit('s_id', null);
    }
    if (param.t_id) {
        if (ObjectId.isValid(param.t_id)) {
            ep.emit('t_id', [param.t_id]);
        } else {
            ep.throw(new Error('t_id格式不正确！'));
        }
    } else if (param.t_phone) {
        model.User.findOne({phone: param.t_phone}, {_id: 1}, ep.done('t_id', (user)=> {
            if (!user) {
                return null;
            }
            return [user._id.toString()];
        }));
    } else if (param.t_nick) {
        model.User.find({nick: param.t_nick}, {_id: 1}, ep.done('t_id', (user)=> {
            if (user.length == 0) {
                return ep.throw('教师昵称不存在！');
            }
            let ids = [];
            for (let i = 0; i < user.length; i++) {
                ids.push(user[i]._id.toString());
            }
            return ids;
        }));
    } else {
        ep.emit('t_id', null);
    }
};

/**
 * 设置订单徽章相关状态，同时通知用户
 * Callback:
 * - err, 数据库异常
 * - doc, 离线问题内容
 * @param {Object} param={o_id: '', badge_id: ''}
 * @param {Function} callback 回调函数
 */


/**
 * 从普通订单转为自由答订单
 * Callback:
 * - err, 数据库异常
 * - doc, 离线问题内容
 * @param {Object} param={o_id: '', badge_id: ''}
 * @param {Function} callback 回调函数
 */


/**
 * 根据ID查询即时订单记录详情，包括师生信息等各种字段，同时，如果订单中有未读消息，将消息设置为已读
 * Callback:
 * - err, 数据库异常
 * - doc, 离线问题内容
 * @param {String} id 即时订单ID
 * @param {Function} callback 回调函数
 */
exports.getOrderStatus = function (id, callback) {
    Order.findById(id, {status: 1}, function (err, doc) {
        if (err) {
            return callback(err);
        }
        if (!doc) {
            return callback();
        }
        return callback(null, {status: doc.status});
    });
};


/**
 * 根据ID查询即时订单记录详情，包括师生信息等各种字段，同时，如果订单中有未读消息，将消息设置为已读
 * Callback:
 * - err, 数据库异常
 * - doc, 离线问题内容
 * @param {String} id 即时订单ID
 * @param {String} userID '我'的userID
 * @param {Function} callback 回调函数
 */
exports.getOrderDetail = function (id, userID, callback) {
    Order.findOne({_id: id}, function (err, doc) {
        if (err) {
            return callback(err);
        }
        if (!doc) {
            return callback();
        }
        var item = {
            o_id: doc._id.toString(),
            s_id: doc.s_id || '',
            t_id: doc.t_id || '',
            grade: doc.grade,
            subject: doc.subject,
            type: doc.type || '',
            addPrice: doc.addPrice,
            create_time: doc.create_time,
            q_msg: doc.q_msg.toObject() || [],
            chat_msg: doc.chat_msg.toObject() || [],
            price: doc.price,
            money: 0,
            status: doc.status,
            duration: doc.duration,
            specifyTeacher: doc.specifyTeacher,
            start_time: doc.start_time,
            end_time: doc.end_time || 0,
            cancel_time: doc.cancel_time || 0,
            charge_time: doc.charge_time || 0,
            charge_elapsed: 0,
            stars: doc.stars,
            stars_s: doc.stars_s,
            remark: doc.remark.toObject() || {},
            off_id: doc.off_id || '',
            remark_s: doc.remark_s.toObject() || {},
            money_id: doc.money_id,
            reward_status: '',
            t_info: {
                nick: '',
                name: '',
                avatar: '',
                followed: false,
                point: 0,
                level: 0
            },
            s_info: {
                nick: '',
                name: '',
                avatar: '',
                followed: false
            },
            badges: doc.badges.toObject(),     //徽章
            replyInTime: doc.replyInTime,       //及时回复比例
            replyInterval: doc.replyInterval    //回复时间间隔(毫秒)
        };
        if (item.type == 'senior' && item.charge_time != 0) {
            if (item.status == 'finished') {
                item.charge_elapsed = item.end_time - item.charge_time;
                item.money = doc.money;
            } else {
                item.charge_elapsed = Date.now() - item.charge_time;
            }
        }
        var ep = new eventproxy();
        ep.all('t_info', 's_info', 'pay_info', 't_follow', 's_follow', function (t_info, s_info, pay_info, t_follow, s_follow) {
            if (t_info) {
                item.t_info.nick = t_info.nick;
                item.t_info.avatar = t_info.avatar;
                item.t_info.point = t_info.point;
                item.t_info.level = t_info.level;
                item.t_info.followed = t_follow;
            }
            if (s_info) {
                item.s_info.nick = s_info.nick;
                item.s_info.avatar = s_info.avatar;
                item.s_info.followed = s_follow;
            }
            if (pay_info) {
                item.reward_status = pay_info;
            }
            callback(null, item);
        });
        ep.fail(callback);
        if (item.t_id) {
            UserProxy.getUserById(item.t_id, ep.done('t_info', function (doc) {
                if (!doc) {
                    return null;
                }
                return {
                    nick: doc.nick,
                    avatar: doc.userInfo.avatar,
                    point: doc.userInfo.teacher_info.point,
                    level: point2level(doc.userInfo.teacher_info.point)
                };
            }));
            FollowProxy.isFollowing(userID, item.t_id, ep.done('t_follow'));
        } else {
            ep.emit('t_info', null);
            ep.emit('t_follow', false);
        }
        if (item.s_id) {
            UserProxy.getUserById(item.s_id, ep.done('s_info', function (doc) {
                if (!doc) {
                    return null;
                }
                return {nick: doc.nick, avatar: doc.userInfo.avatar};
            }));
            FollowProxy.isFollowing(userID, item.s_id, ep.done('s_follow'));
        } else {
            ep.emit('s_info', null);
            ep.emit('s_follow', false);
        }
        if (item.money_id) {
            MoneyProxy.getMoneyInfoByID(item.money_id, ep.done('pay_info', function (doc) {
                if (!doc) {
                    return null;
                }
                var st = 'fail';
                if (doc.status == 'paid') {
                    st = 'paid';
                }
                if (doc.status == 'refunded') {
                    st = 'refunded;'
                } else {
                    if (doc.client_status == 'pending') {
                        st = 'pending';
                    } else if (doc.client_status == 'success') {
                        st = 'paid';
                    } else if (doc.client_status == 'cancel') {
                        st = 'cancel';
                    }
                }
                return st;
            }));
        } else {
            ep.emit('pay_info', null);
        }
        //如果订单中存在未读消息，则将订单所有消息都设置为已读，并保存
        var needUpdate = false;
        for (var i = 0; i < doc.chat_msg.length; i++) {
            if (doc.chat_msg[i].status != 'received') {
                doc.chat_msg[i].status = 'received';
                needUpdate = true;
            }
        }
        if (needUpdate) {
            doc.save(function () {
            });
        }
    });
};

/**
 * 根据query查询符合条件的订单数量
 * Callback:
 * - err, 数据库异常
 * - doc, 离线问题内容
 * @param {Object} query 查询条件
 * @param {Function} callback 回调函数
 */
exports.getOrderCount = function (query, callback) {
    Order.count(query, callback);
};

/**
 * 根据t_id查询获得的付费订单的评价列表
 * Callback:
 * - err, 数据库异常
 * - doc, 离线问题内容
 * @param {Object} param = {t_id: '', startPos: '', pageSize: ''}
 * @param {Function} callback 回调函数
 */
exports.getSeniorRemarks = function (param, callback) {
    let start = Number.parseInt(param.startPos || '1') - 1;
    let count = Number.parseInt(param.pageSize || '10');
    Order.find({t_id: param.t_id, type: 'senior'}, {}, {sort: '-create_time', skip: start, limit: count}, (err, doc)=> {
        if (err) {
            return callback(err);
        }
        let list = [];
        let s_ids = [];
        for (let i = 0; i < doc.length; i++) {
            s_ids.push(doc[i].s_id);
            list.push({
                o_id: doc[i].o_id,
                s_id: doc[i].s_id,
                create_time: doc[i].create_time,
                stars: doc[i].stars || '4',
                choice: doc[i].remark.choice || '',
                content: doc[i].remark.content || ''
            });
        }
        require('../proxy').User.getUsersByIds(s_ids, (err2, doc2)=> {
            if (err2) {
                return callback(err2);
            }
            for (let i = 0; i < list.length; i++) {
                for (let j = 0; j < doc2.length; j++) {
                    if (list[i].s_id == doc2[j].userID) {
                        list[i].nick = doc2[j].nick;
                        list[i].avatar = doc2[j].userInfo.avatar;
                    }
                }
            }
            return callback(null, list);
        });
    });
};

/**
 * 根据教师积分计算出教师等级
 * @param {Number} point 教师积分
 * @return {Number} level 教师等级
 */
function point2level(point) {
    //输入教师积分，返回教师星级
    if (point < 20) {
        //0 star
        return 0;
    } else if (point <= 70) {
        //1 stars
        return 1;
    } else if (point <= 170) {
        //2 stars
        return 2;
    } else if (point <= 470) {
        //3 stars
        return 3;
    } else if (point <= 970) {
        //4 stars
        return 4;
    } else {
        //5 stars
        return 5;
    }
}


/**
 * 根据ID查询即时订单记录详情，包括师生信息等各种字段，同时，如果订单中有未读消息，将消息设置为已读
 * Callback:
 * - err, 数据库异常
 * - doc, 离线问题内容
 * @param {Object} orderInfo 即时订单信息
 * @param {Function} callback 回调函数
 */
exports.genOrder = function (orderInfo, callback) {

};
