/**
 * Created by MengLei on 2016-05-11.
 */
"use strict";
const db = require('../../config').db;
const config = require('../../config');
const objectId = require('mongojs').ObjectId;
const proxy = require('../../common/proxy');
const log = require('./../../utils/log').order;
const dnode = require('../utils/dnodeClient');
const zrpc = require('../../utils/zmqClient');

module.exports = function (o_id) {
    proxy.Order.getOrderDetail(o_id, '', (err, order)=> {
        if (err) {
            return log.error(`free push, get order detail error, o_id: ${o_id}, error: ${err.message}`);
        }
        if (!order) {
            return log.error(`free push, get order detail empty, o_id: ${o_id}`);
        }
        let param = {grade: order.grade, subject: order.subject, type: order.type};
        //推送普通教师：{channel: {$in: [null, '']}}，立即推送
        pushWithQuery(Object.assign({}, {channel: {$in: [null, '']}}, param), order);
        //推送专职教师：{channel: 'qa_center'}，默认delay 3秒
        config.redis.get('qa_delay', (err, doc)=> {
            if (err) {
                return log.error('redis get qa delay error: ' + err.message);
            }
            let delay = Number.parseInt(doc || 3000);
            setTimeout(()=> {
                proxy.Order.getOrderStatus(o_id, (err2, doc2)=> {
                    if (err2) {
                        return log.error('free push qa_center check order status error: ' + err2.message);
                    }
                    if (!doc2) {
                        return log.error('push qa teacher error, order not exists.');
                    }
                    log.trace(`push qa channel teacher, o_id: ${doc2.o_id}, status: ${doc2.status}`);
                    if (doc2.status == 'pending') {
                        pushWithQuery(Object.assign({}, {channel: 'qa_center'}, param), order);
                    }
                })
            }, delay);
        });
        //推送渠道教师：{channel: {$nin: [null, 'qa_center']}}，默认delay 6秒
        config.redis.get('ext_delay', (err, doc)=> {
            if (err) {
                return log.error('redis get ext delay error: ' + err.message);
            }
            let delay = Number.parseInt(doc || 6000);
            setTimeout(()=> {
                proxy.Order.getOrderStatus(o_id, (err2, doc2)=> {
                    if (err2) {
                        return log.error('free push ext channel check order status error: ' + err2.message);
                    }
                    if (!doc2) {
                        return log.error('push ext teacher error, order not exists.');
                    }
                    log.trace(`push ext channel teacher, o_id: ${doc2.o_id}, status: ${doc2.status}`);
                    if (doc2.status == 'pending') {
                        pushWithQuery(Object.assign({}, {channel: {$nin: [null, '', 'qa_center']}}, param), order);
                    }
                })
            }, delay);
        });
    });
};

function pushWithQuery(query, order) {
    proxy.GSList.pushTeachers(query, (err, t_list)=> {
        if (err) {
            return;
        }
        pushUids2DB(t_list, order);
        zrpc('mqttServer', 'push', {content: order, to: t_list}, function (err3, resp) {
            //
            if (err) {
                log.error('free push order error: ' + err3.message);
            } else {
                log.trace('free push order result: ' + JSON.stringify(resp) + ', teacher count: ' + t_list.length + ', t_list: ' + t_list.join(','));
            }
        });
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