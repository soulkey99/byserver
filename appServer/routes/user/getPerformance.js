/**
 * Created by MengLei on 2015/8/21.
 */

var db = require('./../../../config').db;
var config = require('./../../../config');
var objectId = require('mongojs').ObjectId;
var eventproxy = require('eventproxy');
var result = require('../../utils/result');
var log = require('../../../utils/log').http;


//获取教师自己的绩效（本月）
module.exports = function(req, res){
    //
    var d1 = new Date();
    d1.setHours(0, 0, 0, 0);
    var d2 = new Date();
    d2.setHours(23, 59, 59, 999);

    var today_query = {t_id: req.body.userID, start_time: {$gte: d1.getTime(), $lte: d2.getTime()}};

    d1.setDate(1);
    //如果不输入月份，则默认查询当月绩效
    if(req.body.month){
        if((d1.getMonth() + 1) < req.body.month){
            //如果当前月份小于输入月份，那么查询上一年度的绩效情况
            d1.setFullYear(d1.getFullYear()-1);
            d2.setFullYear(d2.getFullYear()-1);
            d1.setMonth(req.body.month -1);
            d2.setMonth(req.body.month -1);
            d2.setDate(getDays(req.body.month));
        }else if((d1.getMonth() + 1) > req.body.month){
            //查询当前年度的绩效
            d1.setMonth(req.body.month -1);
            d2.setMonth(req.body.month -1);
            d2.setDate(getDays(req.body.month));
        }else{
            //查询当月绩效
        }
    }
    var start = d1.getTime();
    var end = d2.getTime();
    var ep = new eventproxy();
    ep.after('daily', Math.round((end - start) / 86400000), function(d){
        //
        var data = [];
        var monthDays = 31;
        var standardDays = 0;
        var monthTotal = 0;
        var todayTotal = 0;

        //获取当月一共多少天
        monthDays = new Date(d1.getFullYear(), d1.getMonth() + 1, 0).getDate();

        for(var i=0; i<d.length; i++){
            if(d[i].date){
                data.push({date: d[i].date, fullDate: d[i].fullDate, count: d[i].count});
            }
            monthTotal += d[i].count;
            if(d[i].count > config.standardCount){
                standardDays ++;
            }
        }
        data.sort(function(a, b){
            return a.fullDate - b.fullDate;
        });
        var days = Math.round((end - start) / 86400000);
        var workDays = data.length;

        db.orders.count(today_query, function(err, doc){
            if(err){
                //handle error
            }else{
                log.trace('get performance success, userID=' + req.body.userID);
                //monthDays：月份总天数，days：月份已经经过总天数，workDays：月份工作天数，standardDays：达标天数，monthTotal：月份总答题数，todayTotal：今日答题数
                result(res, {statusCode: 900, monthDays: monthDays, days: days, workDays: workDays, standardDays: standardDays, monthTotal: monthTotal, todayTotal: doc});
            }
        })
    });
    for(var i=0; i<Math.round((end - start) / 86400000); i++){
        var q = {t_id: req.body.userID, start_time: {$gte: start + 86400000 * i, $lte: start + 86400000 * (i + 1)}};
        db.orders.find(q, {start_time: 1, s_id: 1}, function (err, doc) {
            if (err) {
                //handle error
            } else {
                if (doc.length > 0) {
                    ep.emit('daily', {date: new Date(doc[0].start_time).getDate(), fullDate: dateStr(doc[0].start_time), count: doc.length});
                } else {
                    ep.emit('daily', {date: '', fullDate: '', count: 0});
                }
            }
        });
    }
};

//获得日期字符串xxxx-xx-xx
function dateStr(t){
    var ts = new Date(t);
    var year = ts.getFullYear().toString();
    var month = (ts.getMonth() + 1).toString();
    month = month.length < 2 ? '0' + month : month;
    var date = ts.getDate().toString();
    date = date.length < 2 ? '0' + date : date;
    return year + '-' + month + '-' + date;
}

//某个月份中有多少天
function getDays(month){
    var d = new Date();
    d.setMonth(month);
    d.setDate(0);
    return d.getDate();
}