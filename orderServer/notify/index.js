/**
 * Created by MengLei on 2015/3/29.
 */

var db = require('../../config').db;
var config = require('../../config');
var objectId = require('mongojs').ObjectId;
var result = require('../utils/result');
var log = require('./../../utils/log').order;
var eventproxy = require('eventproxy');
var dnode = require('../utils/dnodeClient');
var zrpc = require('../../utils/zmqClient');

//订单被抢、取消、超时之后，向对应教师推送消息

module.exports = function(o_id, status){
    //
    log.trace('order id: ' + o_id + ', is ' + status + ', push to related teachers.');
    var _id = '';
    try {
        _id = new objectId(o_id);
    }catch(ex){
        log.error('notify order status, o_id error: ' + ex.message);
        //result({statusCode: 905, message: ex.message});
        return;
    }
    db.orders.findOne({_id: _id}, function(err, doc){
        if(err){
            //handle error
        }else{
            if(doc){
                selectTeacher(doc, status);
            }
        }
    });
};

function selectTeacher(orderInfo, status) {
    //查询条件
    db.push.findOne({_id: new objectId(orderInfo.o_id)}, {_id: 0, create_time: 0}, function (err, doc) {
        if (err) {
            //handle error
        } else {
            if (doc && doc.uids) {
                //满足条件的教师uid列表
                var uids = [];
                for (var id in doc.uids) {
                    uids.push(id);
                }
                //如果是订单超时，那么也要给学生端推送该条消息
                if (status == 'timeout') {
                    uids.push(orderInfo.s_id);
                }else if(status == 'received'){
                    //如果订单被抢，那么不仅仅要给学生推送订单被抢的消息，还要告诉学生抢单的老师的基本信息
                    notifyStudent(orderInfo);
                }
                //推送过后，数据库中的记录就不需要了，将这些记录清除
                db.push.remove({_id: new objectId(orderInfo.o_id)});
                //mqtt server发请求，推送消息
                zrpc('mqttServer', 'push', {
                    content: {o_id: orderInfo.o_id, status: status},
                    to: uids
                }, function (err, resp) {
                    //
                    if (err) {
                        log.error('push order error: ' + err.message);
                    } else {
                        //log.trace('push order result: ' + JSON.stringify(resp));
                    }
                });
            }
        }
    });
}

function notifyStudent(orderInfo){
    var t_id = new objectId();
    try{
        t_id = new objectId(orderInfo.t_id);
    }catch(ex){}
    //console.log('notify student, s_id: ' + orderInfo.s_id + ', t_id: ' + orderInfo.t_id);
    var ep = new eventproxy();
    //等待下方查询之后返回结果
    ep.all('t_info', 'follow', function(t_info, follow){
        var content = {o_id: orderInfo.o_id, status: 'received', t_id: orderInfo.t_id, t_nick: t_info.t_nick, t_avatar: t_info.t_avatar, followed: follow};
        //console.log('content info: ' + JSON.stringify(content));
        zrpc('mqttServer', 'push', {
            content: content,
            to: [orderInfo.s_id]
        }, function (err, resp) {
            //
            if (err) {
                log.error('push order error: ' + err.message);
            } else {
                //log.trace('push order result: ' + JSON.stringify(resp));
            }
        });
    });
    ep.fail(function(err){
        log.error('notify student error: ' + err.message);
    });
    //查询教师信息
    db.users.findOne({_id: t_id}, {nick: 1, 'userInfo.avatar': 1}, ep.done('t_info', function(doc) {
        if (doc) {
            ep.emit('t_info', {t_id: doc._id.toString(), t_nick: doc.nick, t_avatar: doc.userInfo.avatar});
        } else {
            ep.emit('t_info', {});
        }
    }));
    //查询是否关注过该教师
    db.userFollowers.findOne({_id: t_id}, ep.done('follow', function(doc) {
        if (doc) {
            ep.emit('follow', (doc.list.indexOf(orderInfo.s_id) >= 0));
        } else {
            ep.emit('follow', false);
        }
    }));
}
