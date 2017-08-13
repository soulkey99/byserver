/**
 * Created by MengLei on 2015/5/30.
 */

var db = require('../../config').db;
var objectId = require('mongojs').ObjectId;
var order = require('../models/order');
var result = require('../utils/result');
var log = require('../../utils/log').order;
var cronJob = require('cron').CronJob;
var BagPipe = require('bagpipe');
var eventproxy = require('eventproxy');
var pipe = new BagPipe(10);

//订单自动评价的定时任务，每天凌晨启动，自动评价完成时间在24小时至48小时之内的订单
exports.start = function () {
    //patterns: seconds 0-59, minutes 0-59, hours 0-23, day of month 1-31, months 0-11, day of week 0-6
    new cronJob('00  30  03  *  *  *', doProcess, null, true);
};

doProcess();

function doProcess() {
    log.fatal('daily order maintenance cron task started.');
    var st = new Date();
    var et = new Date();
    st.setDate(st.getDate() - 2);
    st.setHours(st.getHours() - 1);
    et.setDate(et.getDate() - 1);
    et.setHours(et.getHours() + 1);
    //在时间上下限中分别增加了一小时的buffer，防止恰好卡在时间点上，取出时间段内没有评价过的订单
    db.orders.find({
        //查询这个时间段内已完成并且没有评价（学生对教师或者教师对学生）的订单
        start_time: {$gte: st.getTime(), $lte: et.getTime()}, status: 'finished',
        //stars表示学生对教师的评价，stars_s表示教师对学生的评价
        stars: null
    }, {t_id: 1, _id: 1, stars: 1, stars_s: 1}, function (err, doc) {
        if (err) {
            //handle error
            return log.error('cron job do process error: ' + err.message);
        }
        log.trace('cron job, auto remark order count: ' + doc.length);
        for (var i = 0; i < doc.length; i++) {
            pipe.push(doRemark, doc[i], function (err) {
                if (err) {
                    log.error('do remark error: ' + err.message);
                }
            });
        }
    });
    doMoneyOrder();
}

function doRemark(orderInfo, cb) {
    var ep = new eventproxy();
    ep.all('remark_t', 'remark_s', function () {
        cb();
    });
    ep.fail(function (err) {
        cb(err);
    });
    if (!orderInfo.stars) {  //如果学生没有评价教师，自动评价
        //默认评价为4星
        db.orders.update({_id: orderInfo._id}, {
            $set: {
                stars: '4',
                remark: {choice: '', content: '', auto: true}
            }
        }, function (err) {
            if (err) {
                ep.throw(err);
                return;
            }
            //默认为教师增加评分与星级(1/2星不得分，3星得1分，4星得5分，5星得10分)，增加4 star， 5 point，已完成订单数增加1
            db.users.update({_id: new objectId(orderInfo.t_id)}, {
                $inc: {
                    'userInfo.teacher_info.stars': 4,
                    'userInfo.teacher_info.point': 5,
                    'userInfo.teacher_info.order_finished': 1
                }
            }, ep.done('remark_t'));
        });
    } else {
        ep.emit('remark_t');
    }
    if (!orderInfo.stars_s) { //如果教师没有评价学生，也自动评价
        //默认评价为4星
        db.orders.update({_id: orderInfo._id}, {
            $set: {
                stars: '4',
                remark: {choice: '', content: '', auto: true}
            }
        }, ep.done('remark_s'));
    } else {
        ep.emit('remark_s');
    }
}

function doMoneyOrder() {   //将26小时之前的未完成支付订单设置为失败状态
    var t = Date.now() - 93600000;  //取26小时之前的
    db.money.update({
        type: 'rewardTeacher',
        status: 'pending',
        createTime: {$lte: t}
    }, {$set: {status: 'fail'}}, {multi: true}, function (err, doc) {
        if (err) {
            return log.error('do money order error, err: ' + err.message);
        }
        log.trace('do money order success, count: ' + doc.nModified);
    });
}


