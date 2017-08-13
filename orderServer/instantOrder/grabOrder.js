/**
 * Created by MengLei on 2015/8/13.
 */
"use strict";

var db = require('../../config').db;
var objectId = require('mongojs').ObjectId;
var dnode = require('../utils/dnodeClient');
var log = require('../../utils/log').order;
var config = require('../../config');
var cronJob = require('cron').CronJob;
var orderOperate = require('./utils/orderOperate');
var addBonus = require('./../../utils/addBonus');
var notify = require('./../notify');
var proxy = require('./../../common/proxy');

//抢单param={userID: '', o_id:'', autoReply: ''}
module.exports = function (param, callback) {
    // proxy.Order.getOrderByQuery({t_id: param.userID, status: 'received'}, {}, function (err, doc) {
    //     if(err){
    //         return callback(err);
    //     }
    //     if(doc.length >0){
    //         return callback(new SKError('有未完成的订单，不能继续抢单！', 907));
    //     }
    //     proxy.Order.getOrderByID(param.o_id, function (err, doc) {
    //         if(err){
    //             return callback(err);
    //         }
    //         if(!doc){
    //             return callback({statusCode: 913, message: '订单ID不存在！'});
    //         }
    //     });
    // });
    var _id = '';
    try {
        _id = new objectId(param.o_id);
    } catch (ex) {
        log.error('grab order, order id error: ' + ex.message);
        return callback(new Error('订单ID格式不正确！,919'), 919);
    }
    //先检查该教师有没有处于received状态下的订单
    db.orders.find({t_id: param.userID, status: 'received'}, {_id: 1}, function (err, doc) {
        if (err) {
            //handle error
            log.error('grab order error: ' + err.message);
            return callback(err);
        }
        if (doc.length > 0) {
            //有订单处于received状态，不允许该教师进行抢单
            log.error('user have order status received. userID=' + param.userID);
            return callback(new Error('有未完成的订单，不许再次接单！,907'), 907);
        }
        //没有订单处于未完成状态，可以再次接单
        var start_time = new Date().getTime();
        //利用findAndModify方法的原子性质进行操作，查询pending状态下的该订单，如果没有，那么就是订单已经改变状态了（被抢、被取消、超时）
        db.orders.findAndModify({
            query: {_id: _id, status: 'pending'},
            update: {$set: {status: 'received', t_id: param.userID, start_time: start_time}},
            new: true,
            fields: {status: 1, s_id: 1, type: 1}
        }, function (err2, doc2) {
            if (err) {
                log.error('grab order, find and modify error: ' + err2.message);
                return callback(err2);
            }
            if (doc2 && doc2.status == 'received') {
                //表示抢单成功
                log.trace('grab order success. o_id=' + param.o_id + ', t_id=' + param.userID);
                callback(null, doc2);
                orderOperate({userID: param.userID, operType: 'grabOrder', operID: param.o_id});
                //抢单成功之后加入默认消息
                //抢单成功的默认消息
                var chat_msg = [{
                    o_id: param.o_id,
                    msgid: '19876543',
                    from: param.userID,
                    to: doc2.s_id,
                    type: 'text',
                    status: 'received',
                    msg: (param.autoReply || '同学您好，老师已经接单，正在阅读题目，请耐心等待！'),
                    t: start_time
                }];
                db.orders.update({_id: _id}, {$set: {chat_msg: chat_msg}});

                //抢单成功之后通知相关教师订单被抢
                notify(param.o_id, 'received');
                if (doc2.grade != 'special') {  //非特殊订单才给师生增加积分
                    //抢单成功之后，给教师增加一个抢单积分
                    log.trace('after order is grabbed, add bonus to student and teacher');
                    proxy.Bonus.grabOrder({userID: param.userID, o_id: param.o_id});
                    //抢单成功，才给学生增加一份下单积分
                    proxy.Bonus.genOrder({userID: doc2.s_id, o_id: param.o_id});
                }
                //抢单之后，教师接单数增加一个
                var incObj = {'userInfo.teacher_info.orders_grabbed': 1};
                if (doc2.type == 'senior') {
                    incObj['userInfo.teacher_info.senior_grabbed'] = 1;
                }
                db.users.update({_id: new objectId(param.userID)}, {$inc: incObj});
            } else {
                //抢单失败
                db.orders.findOne({_id: _id}, {status: 1}, function (err3, doc3) {
                    if (err3) {
                        log.error('grab order, find one error: ' + err3.message);
                        return callback(err3);
                    }
                    if (!doc3) {
                        return callback(new Error('订单ID不存在！,913'), 913);
                    }
                    //订单存在，返回订单最新状态
                    log.error('grab order fail, userID=' + param.userID + ', o_id=' + param.o_id + ', status=' + doc3.status);
                    return callback(new Error('订单状态不合法！,909'), 909);
                });
            }
        });
    });
};

