/**
 * Created by MengLei on 2015/11/27.
 */

var db = require('../../../config').db;
var log = require('../../../utils/log').http;
var proxy = require('../../../common/proxy');
var cronJob = require('cron').CronJob;

//定时任务，每天凌晨3:15，取当日零点至前一日零点的订单，如果仍然是pending状态，那么直接设置为timeout
module.exports = function () {
    log.trace('add money cron job started.');
    new cronJob('00 15 03 * * *', function () {
        //两个时间都留出前后一分钟的buffer，防止因为某些情况造成边界时间内的订单无法处理
        var t1 = new Date(Date.now() - 11640000);   //今日零点
        var t2 = new Date(Date.now() - 98160000);   //前一日零点
        db.money.update({status: 'pending', createTime: {$lte: t1.getTime()}}, {$set: {status: 'timeout'}});
    }, null, true);
};

