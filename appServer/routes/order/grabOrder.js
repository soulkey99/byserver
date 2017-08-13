/**
 * Created by MengLei on 2015/3/5.
 */
"use strict";
const config = require('../../../config');
const result = require('../../utils/result');
const objectId = require('mongojs').ObjectId;
const eventproxy = require('eventproxy');
const log = require('../../../utils/log').http;
const dnode = require('../../utils/dnodeClient');
const zrpc = require('../../../utils/zmqClient');

//抢单param={userID: '', o_id:''}
module.exports = function (req, res) {
    log.trace('grab order start, userID: ' + req.body.userID);
    var param = {userID: req.body.userID, o_id: req.body.o_id, autoReply: req.user.autoReply};

    //取一个随机数
    let random = Math.random();
    config.db.userConf.findOne({phonenum: req.body.phone}, (err, userConf)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        //如果用户有配置信息，那么根据配置信息里面的内容先进行处理
        if (userConf && userConf.grabConf) {
            if (userConf.grabConf.status == 'whitelist') {
                //如果属于抢单白名单，那么不做任何延迟，直接进入抢单流程
                toGrabOrder();
                return;
            }
            if (userConf.grabConf.status == 'blacklist') {
                //如果属于抢单黑名单，那么延迟5秒之后立刻返回抢单失败
                setTimeout(toSendFail, 5000);
                return;
            }
            //根据配置的抢单概率进行判断，有一定概率直接返回抢单失败
            if (userConf.grabConf.posibility < random) {
                toSendFail();
                return;
            }
        }
        let t = Math.round(random * 3000) + 2000;   //抢单逻辑延时，随机2到5秒
        //随机延迟之后，进入计算防刷单延时计算
        setTimeout(toCalculateTime, t);
    });

    //计算防刷单延时
    function toCalculateTime() {
        var _id = '';
        try {
            _id = new objectId(req.body.o_id);
        } catch (ex) {
            log.error('grab order, o_id error: ' + ex.message);
            result(res, {statusCode: 919, message: ex.message});
            return;
        }
        config.db.orders.findOne({_id: _id}, {s_id: 1}, function (err, doc) {
            if (err) {
                log.error('grab order, find s_id error: ' + err.message);
                result(res, {statusCode: 905, message: err.message});
            } else {
                if (doc) {
                    var t = Math.round(random * 3000) + 2000;   //抢单逻辑延时，随机2到5秒
                    //订单id存在，取s_id
                    var cur = new Date().getTime();
                    config.db.orders.count({
                        t_id: param.userID,
                        s_id: doc.s_id,
                        start_time: {$gte: cur - 1800000}
                    }, function (err2, doc2) {
                        if (err2) {
                            log.error('grab order, find s_id error: ' + err2.message);
                            result(res, {statusCode: 905, message: err2.message});
                        } else {
                            //根据教师与学生之间三天内的答题数多少来进行延时，教师与学生之间的题目越多则延时时间越长，时间范围0--10秒
                            //计算方法是答题数的平方乘以4得到毫秒数，最大取到10秒
                            //var t2 = Math.min(10000, Math.sqrt(doc));
                            //先用下面的方法，半个小时内的订单数，每一单加1秒，12秒封顶
                            var t2 = Math.min(12000, doc2 * 1000);
                            var latency2 = t2 * (1 - t / 12000);
                            latency2 = latency2 * 0.5;  //这里临时措施，给延时减半
                            log.trace('grab order t_id: ' + param.userID + ', s_id: ' + doc.s_id + ', o_id: ' + param.o_id + ' ,count: ' + doc2 + ', latency2: ' + latency2 + ', t1: ' + t + ', t2: ' + t2);
                            //latency2 = 10000;
                            //console.log('t1: ' + t + ', latency2: ' + latency2);
                            setTimeout(toGrabOrder, latency2);
                        }
                    });
                } else {
                    //订单id不存在
                    log.error('grab order, order id not exists.');
                    result(res, {statusCode: 913, message: '订单id不存在！'});
                }
            }
        });
    }

    //执行抢单
    function toGrabOrder() {
        zrpc('orderServer', 'grabOrder2', param, function (err2, resp) {
            if (err2) {
                log.error('grab order request error: ' + err2.message);
                if (err2.message) {
                    return result(res, {
                        statusCode: parseInt(err2.message.split(',')[0]) || 905,
                        message: err2.message.split(',')[0],
                        status: 'received'
                    });
                } else {
                    return result(res, {statusCode: resp || 905, message: err2.message});
                }
            } else {
                log.trace('send grab order resp, userID: ' + req.body.userID);
                result(res, {statusCode: 900});
            }
        });
    }

    //返回失败信息
    function toSendFail() {
        result(res, {statusCode: 947, message: '系统策略造成抢单失败！'});
    }
};

