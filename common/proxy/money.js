/**
 * Created by MengLei on 2016/1/4.
 */
"use strict";

const model = require('../model');
const eventproxy = require('eventproxy');
const UserProxy = require('./user/user');
const Money = model.Money;

/**
 * 根据money_id获取该条记录的详情
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {String} id 该条记录的id
 * @param {Function} callback 回调函数
 */
exports.getMoneyInfoByID = function (id, callback) {
    Money.findOne({_id: id}, callback);
};

/**
 * 根据money_id列表获取该条记录的详情列表
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {Array} ids 该条记录的id
 * @param {Function} callback 回调函数
 */
exports.getMoneyInfoByIDs = function (ids, callback) {
    Money.find({_id: {$in: ids}}, callback);
};

/**
 * 根据chargeID查询该条记录的详情
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {String} id charge_id
 * @param {Function} callback 回调函数
 */
exports.getMoneyInfoByChargeID = function (id, callback) {
    Money.findOne({'charge.id': id}, callback);
};

/**
 * 根据chargeID查询该条记录的详情
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {Object} param {charge_id: '可选', userID: '', amount: ''}
 * @param {Function} callback 回调函数
 */
exports.charge = function (param, callback) {
    //
};

/**
 * 增加一条订单支付记录
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {Object} param {userID: '', amount: '', money: '', bonus: '', o_id: ''}
 * @param {Function} [callback] 回调函数
 */
exports.addOneRecord = function (param, callback) {
    if (!callback) {
        callback = function () {
        }
    }
    let money = new Money({userID: param.userID, amount: param.amount});
    if (param.type) {
        money.type = param.type;
    }
    if (param.charge) {
        money.charge = param.charge;
    }
    if (param.channel) {
        money.channel = param.channel;
    }
    if (param.bonus) {
        money.bonus = param.bonus;
    }
    if (param.o_id) {
        money.o_id = param.o_id;
    }
    if (param.money) {
        money.money = param.money;
    }
    if (param.t_id) {
        money.t_id = param.t_id;
    }
    switch (param.type) {
        case 'withdraw':
        {
            if (Date.now() > 1462032000000) {   //5月1日之后，提现抽取20%的提成
                money.rebate = (money.amount * 0.2).toFixed();
                money.actual_pay = (money.amount * 0.8).toFixed();
            }
        }
            break;
        case 'charge':
            break;
        case 'seniorOrder':
        {
            money.subject = '付费订单' + getDateString();
            money.desc = '付费订单' + getDateString();
            money.money = money.amount;
            money.status = 'paid';
            money.client_status = 'success';
        }
            break;

        case 'rewardTeacher':
        default:
            break;
    }
    money.saveMoney(callback);
};

/**
 * 获取资金订单列表
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {Object} param 查询条件param={userID: '', userType: '', type: '订单类型(多个以逗号分隔)', channel: '支付通道', startTime: '', endTime: '', startPos: '', pageSize: '', status: ''}
 * @param {Function} callback 回调函数
 */
exports.getMoneyList = function (param, callback) {
    var query = {};
    var start = parseInt(param.startPos || '1') - 1;
    var count = parseInt(param.pageSize || '10');

    if (param.userType == 'teacher') {
        //教师端强制只返回type=rewardTeacher,status=paid和type=withdraw的订单
        if (param.type) {
            if (param.type.indexOf(',') > 0) {//多种type的情况
                var types = param.type.split(',');
                query['$or'] = [];
                for (var i = 0; i < types.length; i++) {
                    var item = {type: types[i]};
                    switch (item.type) {
                        //提现时，用户id在userID，打赏记录，教师id在t_id字段
                        case 'withdraw':
                        case 'charge':
                            item['userID'] = param.userID;
                            break;
                        case 'rewardTeacher'://如果是打赏或者付费订单，则只返回已经支付成功的订单
                        case 'seniorOrder':
                            item['t_id'] = param.userID;
                            item['status'] = 'paid';
                            break;
                    }
                    query['$or'].push(item);
                }
            } else {    //单一type的情况
                query['type'] = param.type;
                switch (param.type) {
                    case 'withdraw':
                    case 'charge':
                        query['userID'] = param.userID;
                        break;
                    case 'rewardTeacher'://如果是打赏，则只返回已经支付成功的订单
                        query['t_id'] = param.userID;
                        query['status'] = 'paid';
                        break;
                }
            }
        }
    } else if (param.userType == 'student') {
        query['client_status'] = 'success';
        if (param.type) {
            if (param.type.indexOf(',') > 0) {
                query['type'] = {$in: param.type.split(',')};
            } else {
                query['type'] = param.type;
            }
        }
        query['userID'] = param.userID;
        //状态选择只针对学生端有效，教师端忽略，根据预定义策略返回对应状态的订单
        if (param.status) {
            query['status'] = param.status;
        }
    }
    if (param.startTime && param.endTime) {
        query['createTime'] = {$gte: parseInt(param.startTime), $lte: parseInt(param.endTime)};
    } else if (param.endTime) {
        query['createTime'] = {$lte: parseInt(param.endTime)};
    } else if (param.startTime) {
        query['createTime'] = {$gte: parseInt(param.startTime)};
    }
    if (param.channel) {
        query['channel'] = param.channel;
    }
    Money.find(query, {}, {sort: '-createTime', skip: start, limit: count}, function (err, doc) {
        if (err) {
            return callback(err);
        }
        var ep = new eventproxy();
        ep.after('item', doc.length, function (list) {
            callback(null, list);
        });
        ep.fail(callback);
        for (var i = 0; i < doc.length; i++) {
            item(doc[i], ep.group('item'));
        }
        function item(data, callback) {
            var item = {
                money_id: data._id.toString(),
                userID: data.userID,
                type: data.type,
                channel: data.channel,
                amount: data.amount,
                bonus: data.bonus || 0,
                money: data.money || 0,
                subject: data.subject,
                o_id: data.o_id,
                t_id: data.t_id,
                nick: '',
                status: data.status,
                createTime: data.createTime
            };
            if (item.type == 'withdraw') {//2016年5月1日之后的提现，抽取20%分成
                item.actual_pay = data.actual_pay || data.amount;
                item.rebate = data.rebate || 0;
            }
            var nickID = item.t_id;
            if (param.userType == 'teacher') {
                nickID = item.userID;
            }
            UserProxy.getUserById(nickID, function (err, doc) {
                if (err) {
                    return callback(err);
                }
                if (doc) {
                    item.nick = doc.nick;
                }
                callback(null, item);
            });
        }
    });
};

/**
 * 管理员端获取资金订单列表
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {Object} param 查询条件param={u_id: '', userType: '', type: '订单类型', channel: '支付通道', startTime: '', endTime: '', startPos: '', pageSize: '', status: ''}
 * @param {Function} callback 回调函数
 */
exports.getAdminMoneyList = function (param, callback) {
    var query = {};
    var start = parseInt(param.startPos || '1') - 1;
    var count = parseInt(param.pageSize || '10');
    if (param.startTime && param.endTime) {
        query['createTime'] = {$gte: parseInt(param.startTime), $lte: parseInt(param.endTime)};
    } else if (param.endTime) {
        query['createTime'] = {$lte: parseInt(param.endTime)};
    } else if (param.startTime) {
        query['createTime'] = {$gte: parseInt(param.startTime)};
    }
    if (param.u_id) {
        query['$or'] = [{userID: param.u_id}, {t_id: param.u_id}];
    }
    if (param.type) {
        query['type'] = param.type;
    }
    if (param.status) {
        query['status'] = param.status;
    }
    if (param.channel) {
        query['channel'] = param.channel;
    }
    Money.count(query, function (err3, doc3) {
        if (err3) {
            return callback(err3);
        }
        Money.find(query, {}, {sort: '-createTime', skip: start, limit: count}, function (err, doc) {
            if (err) {
                return callback(err);
            }
            var ep = new eventproxy();
            ep.after('item', doc.length, function (list) {
                callback(null, list, doc3);
            });
            ep.fail(callback);
            for (var i = 0; i < doc.length; i++) {
                item(doc[i], ep.group('item'));
            }
            function item(data, callback) {
                var item = {
                    money_id: data._id.toString(),
                    userID: data.userID,
                    type: data.type,
                    channel: data.channel,
                    amount: data.amount,
                    bonus: data.bonus || 0,
                    money: data.money || 0,
                    subject: data.subject,
                    o_id: data.o_id,
                    t_id: data.t_id,
                    nick: '',
                    phone: '',
                    t_nick: '',
                    t_phone: '',
                    status: data.status,
                    createTime: data.createTime
                };
                if (item.type == 'withdraw') {//2016年5月1日之后的提现，抽取20%分成
                    item.actual_pay = data.actual_pay || data.amount;
                    item.rebate = data.rebate || 0;
                }
                UserProxy.getUserById(item.userID, function (err, doc) {
                    if (err) {
                        return callback(err);
                    }
                    if (doc) {
                        item.nick = doc.nick;
                        item.phone = doc.phone;
                        if (item.type == 'withdraw') {
                            //对于提现类的请求，要返回用户设置的提现账户
                            item.withdraw_info = doc.withdraw_info;
                            item.money_info = doc.userInfo.money_info;
                        }
                    }
                    if (item.t_id) {
                        UserProxy.getUserById(item.t_id, function (err2, doc2) {
                            if (err2) {
                                return callback(err2);
                            }
                            if (doc2) {
                                item.t_nick = doc2.nick;
                                item.t_phone = doc2.phone;
                            }
                            return callback(null, item);
                        });
                    } else {
                        return callback(null, item);
                    }
                });
            }
        });
    });
};

/**
 * 管理员端设置资金订单状态
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {Object} param 查询条件param={u_id: '', money_id: '', status: '订单状态paid/fail', desc: '', channel: ''}
 * @param {Function} callback 回调函数
 */
exports.adminSetMoneyStatus = function (param, callback) {
    Money.findOne({_id: param.money_id}, function (err, doc) {
        if (err) {
            return callback(err);
        }
        if (!doc) {
            return callback();
        }
        if (param.status == 'paid') {
            //支付成功，提现中资金转为提现成功
            require('./user/user').withdrawSuccess(doc.userID, Math.abs(doc.money));
        } else if (param.status == 'fail') {
            //提现失败，提现中资金转为余额
            require('./user/user').withdrawFail(doc.userID, Math.abs(doc.money));
        }
        doc.status = param.status;
        if (param.desc) {
            doc.desc = param.desc;
        }
        doc.charge.channel = param.channel || 'alipay';
        doc.charge.transaction_no = param.transaction_no;
        doc.save(callback);
    });
};

/**
 * 获取用户本月内是否有过提现记录
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {String} userID
 * @param {Function} callback 回调函数
 */
exports.existsWithdraw = function (userID, callback) {
    var t1 = new Date();
    var t2 = new Date();
    t1.setDate(1);
    t2.setMonth(t2.getMonth() + 1);
    t2.setDate(0);
    t1.setHours(0, 0, 0, 0);
    t2.setHours(23, 59, 59, 999);//这里t1和t2取当月的1号0点0分0秒至最后一天的23点59分59秒
    Money.count({
        userID: userID,
        createTime: {$gte: t1.getTime(), $lte: t2.getTime()},
        type: 'withdraw'
    }, function (err, doc) {
        if (err) {
            return callback(err);
        }
        return callback(null, doc > 0);
    });
};

/**
 * 获取用户本月内提现次数
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {String} userID
 * @param {Function} callback 回调函数
 */
exports.monthWithdrawCount = function (userID, callback) {
    var t1 = new Date();
    var t2 = new Date();
    t1.setDate(1);
    t2.setMonth(t2.getMonth() + 1);
    t2.setDate(0);
    t1.setHours(0, 0, 0, 0);
    t2.setHours(23, 59, 59, 999);//这里t1和t2取当月的1号0点0分0秒至最后一天的23点59分59秒
    Money.count({
        userID: userID,
        createTime: {$gte: t1.getTime(), $lte: t2.getTime()},
        type: 'withdraw'
    }, function (err, doc) {
        if (err) {
            return callback(err);
        }
        return callback(null, doc);
    });
};


/**
 * 获取用户本月内是否有过提现记录
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {Object} param = {userID: '', money: ''};
 * @param {Function} callback 回调函数
 */
exports.withdraw = function (param, callback) {
    var money = new Money({
        userID: param.userID,
        type: 'withdraw',
        amount: 0 - parseInt(param.money),
        money: 0 - parseInt(param.money),
        bonus: 0,
        charge: {},
        subject: '教师端提现' + getDateString(),
        status: 'pending',
        createTime: Date.now()
    });
    money.saveMoney(callback);
};


/**
 * 获取资金订单详情
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {String} money_id
 * @param {Function} callback 回调函数
 */
exports.getDetail = function (money_id, callback) {
    Money.findOne({_id: money_id}, function (err, doc) {
        if (err) {
            return callback(err);
        }
        if (!doc) {
            return callback();
        }
        var item = {
            money_id: doc._id.toString(),
            userID: doc.userID,
            type: doc.type,
            channel: doc.channel,
            amount: doc.amount,
            bonus: doc.bonus || 0,
            money: doc.money || 0,
            subject: doc.subject,
            status: doc.status,
            createTime: doc.createTime,
            charge: doc.charge
        };
        if (item.type == 'withdraw') {//2016年5月1日之后的提现，抽取20%分成
            item.actual_pay = doc.actual_pay || doc.amount;
            item.rebate = doc.rebate || 0;
        }
        if (item.type == 'rewardTeacher') {
            item['o_id'] = doc.o_id;
            item['t_id'] = doc.t_id;
        }
        UserProxy.getUserById(item.userID, function (err2, doc2) {
            if (err2) {
                return callback(err2);
            }
            if (doc2) {
                item.userNick = doc2.nick;
            }
            if (item.t_id) {
                UserProxy.getUserById(item.t_id, function (err3, doc3) {
                    if (err3) {
                        return callback(err3);
                    }
                    if (doc3) {
                        item.t_nick = doc3.nick;
                    }
                    callback(null, item);
                });
            } else {
                callback(null, item);
            }
        });
    });
};


function getDateString() {
    var t = new Date();
    return t.getFullYear().toString() + '/' + (t.getMonth() + 1).toString() + '/' + t.getDate().toString();
}