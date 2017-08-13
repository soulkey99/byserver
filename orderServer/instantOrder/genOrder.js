/**
 * Created by MengLei on 2015/8/12.
 */
"use strict";

var db = require('../../config').db;
var config = require('../../config');
var objectId = require('mongojs').ObjectId;
var freePush = require('./freePush');
var log = require('./../../utils/log').order;
var dnode = require('../utils/dnodeClient');
var zrpc = require('../../utils/zmqClient');
var proxy = require('../../common/proxy');
var orderOperate = require('./utils/orderOperate');
var Timer = require('./timer');
var addBonus = require('./../../utils/addBonus');

var notify = require('./../notify');

//下单，即时问题param={orderInfo: '', userID: ''}
module.exports = function (param, callback) {
    //
    log.trace('order server: orderInfo=' + param.orderInfo);
    var tmpInfo = {};

    try {
        tmpInfo = JSON.parse(param.orderInfo);
        if (tmpInfo.t_id) {
            //强制将指定教师下单转为自由订单
            tmpInfo.t_id = '';
        }
    } catch (ex) {
        log.error('gen order, parse order info error: ' + ex.message);
        return callback(new Error('订单内容解析失败！'), 928);
    }

    var orderInfo = {
        _id: new objectId(),
        s_id: param.userID,     //提问者id
        t_id: '',               //回答者id，默认为空
        grade: tmpInfo.grade,   //年级
        subject: tmpInfo.subject,   //学科
        addPrice: 0,            //预留，小费，初始0
        create_time: new Date().getTime(),  //创建时间
        q_msg: tmpInfo.q_msg,   //问题消息部分
        chat_msg: [],       //聊天信息
        price: 0,           //预留，订单价钱，默认0，
        badges: [],         //徽章
        replyInterval: 20000,   //及时回复间隔
        replyInTime: 0.6,
        status: 'pending'   //初始状态
    };
    if (!orderInfo.grade || !orderInfo.subject) {
        return callback(new Error('订单年级学科信息不全，无法下单！'));
    }
    //徽章内容，初期先写在代码中，后面要实现动态配置
    orderInfo.badges = [{
        id: 'fiveminute',
        name: '5分钟',
        desc: '时间超过5分钟',
        img_on: 'http://oss.soulkey99.com/upload/20160217/c10a0528296103ac424c55b18adba99b.png',
        img_off: 'http://oss.soulkey99.com/upload/20160217/ef3465ca8a21df490fca5e40a5fb6e45.png',
        is_on: false
    }, {
        id: 'eightreply',
        name: '8条',
        desc: '每单回复超8条',
        img_on: 'http://oss.soulkey99.com/upload/20160217/03cfdfd76135badc6fc6e305bf372d6d.png',
        img_off: 'http://oss.soulkey99.com/upload/20160217/23c616bdc62a3735e6b7599418a51fed.png',
        is_on: false
    }, {
        id: 'imageorvoice',
        name: '图片语音',
        desc: '图片或语音一条',
        img_on: 'http://oss.soulkey99.com/upload/20160217/5c4a2cf3ef19e83147327a16107f5486.png',
        img_off: 'http://oss.soulkey99.com/upload/20160217/15976a90a31babf53feafad656cd6cf0.png',
        is_on: false
    }, {
        id: 'intimereply',
        name: '时间',
        desc: '规定时间内及时回复',
        img_on: 'http://oss.soulkey99.com/upload/20160217/dea12d0f96741f49367950d32be35e4d.png',
        img_off: 'http://oss.soulkey99.com/upload/20160217/c836e8a6b6663e2697a37c343084ee74.png',
        is_on: false
    }];

    proxy.GradeSubject.getGSList('', (err, gsList)=> {
        if (err) {
            return callback(err);
        }
        if (tmpInfo.grade == 'special') {//特殊学科
            for (let i = 0; i < gsList.subject.length; i++) {
                if (gsList.subject[i].subject == orderInfo.subject) {
                    if (!gsList.subject[i].charge_info.free) {
                        orderInfo.type = 'senior';
                        orderInfo.charge_info = {
                            free: gsList.subject[i].charge_info.free,
                            start: gsList.subject[i].charge_info.start,
                            unit: gsList.subject[i].charge_info.unit
                        };
                    }
                    orderInfo.duration = gsList.subject[i].duration || 900000;
                }
            }
        } else {
            if (tmpInfo.type == 'senior') {   //付费单标识
                orderInfo.type = tmpInfo.type;
            }
            //订单持续时长，单位毫秒，如果不传，默认10分钟
            if (tmpInfo.duration) {
                orderInfo.duration = parseFloat(tmpInfo.duration);
            } else {
                orderInfo.duration = 600000;
            }
        }
        orderInfo.o_id = orderInfo._id.toString();  //order id
        if (tmpInfo.t_id) {
            //如果下单的时候信息中传递了教师id，那么就是指定教师下单，走指定教师下单的流程
            orderInfo.specifyTeacher = true;
            orderInfo.t_id = tmpInfo.t_id;
            specifyOrder(orderInfo, callback);
        } else {
            //如果没有传教师的id，那么就是自由抢单流程
            orderInfo.specifyTeacher = false;
            if (orderInfo.grade!='special' && orderInfo.type == 'senior') {
                orderInfo.duration = 1800000;
                checkStudentMoney(orderInfo, callback);
            } else {
                orderInfo.duration = 600000;
                freeOrder(orderInfo, callback);
            }
        }
    });
};


//指定教师
function specifyOrder(orderInfo, callback) {
    //指定教师下单，先要查看教师的当前状态，如果当前状态是有订单正在进行中，那么不给教师推送，同时给学生返回错误信息。
    //判断教师是否有订单正在进行中，是通过是否有received状态的订单的t_id为该教师来确定的。
    db.orders.find({
        t_id: orderInfo.t_id,
        start_time: {$lt: (new Date().getTime()) + config.pendingTime},
        status: 'received'
    }, function (err, doc) {
        if (err) {
            log.error('find order by t_id error:  ' + err.message);
            return callback(err);
        }
        //判断是教师是否处于可接单的状态（对于普通订单，目前的逻辑是教师可以同时进行多个，所以此处订单数量可能大于1）
        if (doc && doc.length > 0) {
            log.debug('teacher: ' + orderInfo.t_id + 'is busy, gen order failed');
            //有订单属于该状态，那么不给该教师推送这类订单，同时返回给学生端这个错误信息
            callback(new Error('指定教师正忙，无法下单！'), 906);
        } else {
            //教师没有处于忙碌状态，那么可以推送订单
            db.orders.save(orderInfo, function (err) {
                if (err) {
                    log.error('gen order error:  ' + err.message);
                    //handle error
                    callback(err);
                } else {
                    log.trace('gen order success, order id: ' + orderInfo._id.toString());
                    //订单建立成功，将状态和订单号返回给学生，同时将题目推送给指定教师
                    callback(null, orderInfo);
                    orderOperate({userID: orderInfo.s_id, operType: 'genOrder', operID: orderInfo.o_id});

                    //下单成功，增加一份下单积分
                    addBonus(orderInfo.s_id, '3', {o_id: orderInfo.o_id});

                    //下单成功，将题目推送给指定教师，向socket server发请求，推送题目
                    freePush.pushUids2DB([orderInfo.t_id], orderInfo);

                    zrpc('mqttServer', 'push', {content: orderInfo, to: [orderInfo.t_id]}, function (err, resp) {
                        //
                        if (err) {
                            log.error('push order error: ' + err.message);
                        } else {
                            log.trace('push order result: ' + JSON.stringify(resp));
                        }
                    });
                }
            });
        }

    });
}

//如果是付费订单，那么需要先检查学生的余额是否够一单的起价费5元
function checkStudentMoney(orderInfo, callback) {
    proxy.User.getUserById(orderInfo.s_id, (err, doc)=> {
        if (err) {
            return callback(err);
        }
        if (!doc) {
            return callback(new Error('用户不存在！'), 902);
        }
        if (doc.userInfo.money < 500) {
            return callback(new Error('无法提问，用户余额不足！'), 981);
        }
        freeOrder(orderInfo, callback);
    });
}

//自由抢单（免费）
function freeOrder(orderInfo, callback) {
    db.orders.save(orderInfo, function (err, doc) {
        if (err) {
            log.error('gen order error: ' + err.message);
            return callback(err);
        }
        log.trace('gen order success, order id: ' + orderInfo.o_id);
        //订单创建成功，将订单号返回给学生
        callback(null, orderInfo);
        orderOperate({userID: orderInfo.s_id, operType: 'genOrder', operID: orderInfo.o_id});
        //同时启动教师筛选机制
        //freePush(orderInfo);
        new Timer(orderInfo.o_id);
    });
}



