/**
 * Created by MengLei on 2015/10/9.
 */

var db = require('../../../../config').db;
var objectId = require('mongojs').ObjectId;
var result = require('../../../utils/result');
var eventproxy = require('eventproxy');
var log = require('./../../../../utils/log').h5;

//综合答题数据，分小时，按照订单状态、订单年级科目筛选
module.exports = function(req, res) {
    //
    var t1 = new Date();//开始时间
    var t2 = new Date();//截止时间
    if (req.body.startTime) {
        t1 = new Date(parseFloat(req.body.startTime));
    }
    if (req.body.endTime) {
        t2 = new Date(parseFloat(req.body.endTime));
    }
    //传入的时间只取到小时，后面的分钟和秒都归零处理
    t1.setMinutes(0);
    t1.setSeconds(0);
    t1.setMilliseconds(0);
    t2.setMinutes(59);
    t2.setSeconds(59);
    t2.setMilliseconds(999);

    var query = {};
    if (req.body.status) {
        query['status'] = req.body.status;
    }
    if (req.body.grade) {
        query['grade'] = req.body.grade;
    }
    if (req.body.subject) {
        query['subject'] = req.body.subject;
    }
    //声明一个eventproxy并注册失败处理方法
    var ep2 = new eventproxy();
    ep2.fail(function (err) {
        result(res, {statusCode: 905, message: err.message});
    });
    //不同的处理方式
    if(req.body.type == '1') {
        //分小时数据，按照时间段内，每个小时进行查询
        ep2.after('hourly', Math.round((t2 - t1) / 3600000), function (d) {
            var list = [];
            for (var i = 0; i < d.length; i++) {
                if (d[i].date) {
                    list.push(d[i]);
                }
            }
            list.sort(function (a, b) {
                return a.t - b.t;
            });
            result(res, {statusCode: 900, list: list});
        });

        for (var i = 0; i < Math.round((t2 - t1) / 3600000); i++) {
            var ts = t1.getTime() + 3600000 * i;
            query['create_time'] = {$gte: ts, $lt: ts + 3600000};
            db.orders.find(query, {_id: 1, create_time: 1, grade: 1, subject: 1, status: 1}, function (err, doc) {
                if (err) {
                    ep2.emit('error', err);
                } else {
                    var resp = {};
                    if (doc.length > 0) {
                        var t = new Date(doc[0].create_time);
                        t.setMinutes(0);
                        t.setSeconds(0);
                        t.setMilliseconds(0);
                        //date：日期，hour：小时，t：时间戳
                        var stat = {
                            total: 0,
                            finished: 0,
                            pending: 0,
                            received: 0,
                            toBeFinished: 0,
                            timeout: 0,
                            canceled: 0
                        };
                        var gs = {};
                        for (var i = 0; i < doc.length; i++) {
                            stat['total']++;
                            stat[doc[i].status]++;
                            if (!gs[doc[i].grade]) {
                                gs[doc[i].grade] = {};
                            }
                            if (!gs[doc[i].grade][doc[i].subject]) {
                                gs[doc[i].grade][doc[i].subject] = {
                                    total: 0,
                                    finished: 0,
                                    pending: 0,
                                    received: 0,
                                    toBeFinished: 0,
                                    timeout: 0,
                                    canceled: 0
                                };
                            }
                            gs[doc[i].grade][doc[i].subject]['total']++;
                            gs[doc[i].grade][doc[i].subject][doc[i].status]++;
                        }
                        resp = {
                            date: dateStr(doc[0].create_time),
                            hour: hourStr(doc[0].create_time),
                            t: t.getTime(),
                            stat: stat,
                            gs: gs
                        };
                        ep2.emit('hourly', resp);
                    } else {
                        ep2.emit('hourly', resp);
                    }
                }
            });
        }
    }else{
        //分小时数据，将每天的每个小时内数据加和，查询出24个小时每个小时的数据
        //传入的时间只取到日期，后面的时分秒都归零
        t1.setHours(0);
        t2.setHours(23);
        var dates = Math.round((t2.getTime() - t1.getTime())/86400000); //一共有多少天
        ep2.after('daily', 24, function(d){
            var list = [];
            for (var i = 0; i < d.length; i++) {
                if (d[i].hour) {
                    list.push(d[i]);
                }
            }
            list.sort(function (a, b) {
                return a.hour - b.hour;
            });

            //var gsObj = {};
            //for(var j=0; j<list.length; j++){
            //    for(var k=0; k<Object.keys(list[j].gs).length; k++){
            //        for(var m=0; m<Object.keys(list[j].gs[Object.keys(list[j].gs)[k]]).length; m++){
            //            if(!gsObj[Object.keys(list[j].gs)[k] + Object.keys(list[j].gs[Object.keys(list[j].gs)[k]])[m]]) {
            //                gsObj[Object.keys(list[j].gs)[k] + Object.keys(list[j].gs[Object.keys(list[j].gs)[k]])[m]] = [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null];
            //            }
            //            if(!!list[j].gs[Object.keys(list[j].gs)[k]][Object.keys(list[j].gs[Object.keys(list[j].gs)[k]])[m]].total) {
            //                gsObj[Object.keys(list[j].gs)[k] + Object.keys(list[j].gs[Object.keys(list[j].gs)[k]])[m]][list[j].hour] = list[j].gs[Object.keys(list[j].gs)[k]][Object.keys(list[j].gs[Object.keys(list[j].gs)[k]])[m]].total;
            //            }
            //        }
            //    }
            //}
            //var statObj = {};
            //for(var j=0; j<list.length; j++){
            //    for(var k=0; k<Object.keys(list[j].stat).length; k++){
            //        if(!statObj[Object.keys(list[j].stat)[k]]){
            //            statObj[Object.keys(list[j].stat)[k]] = [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null];
            //        }
            //        if(!!list[j].stat[Object.keys(list[j].stat)[k]]) {
            //            statObj[Object.keys(list[j].stat)[k]][parseInt(list[j].hour)] = list[j].stat[Object.keys(list[j].stat)[k]];
            //        }
            //    }
            //}

            result(res, {statusCode: 900, list: list});
        });
        //一共只有24个小时，只按照24个小时进行查询，无论有多少天
        for(var j=0; j<24; j++){
            var or_q = [];  //每日指定小时的时间段
            for(var k=0; k<dates; k++) {
                or_q.push({create_time: {$gte: t1.getTime() + 86400000 * k + 3600000 * j, $lt: t1.getTime() + 86400000 * k + 3600000 * (j + 1)}});
            }
            //console.log(JSON.stringify(or_q));
            query['$or'] = or_q;
            db.orders.find(query, {_id: 1, create_time: 1, grade: 1, subject: 1, status: 1}, function (err, doc) {
                if (err) {
                    ep2.emit('error', err);
                } else {
                    var resp = {};
                    if (doc.length > 0) {
                        var stat = {
                            total: 0,
                            finished: 0,
                            pending: 0,
                            received: 0,
                            toBeFinished: 0,
                            timeout: 0,
                            canceled: 0
                        };
                        var gs = {};
                        for (var i = 0; i < doc.length; i++) {
                            stat['total']++;
                            if(!stat[doc[i].status]){
                                stat[doc[i].status] = 0;
                            }
                            stat[doc[i].status]++;
                            if (!gs[doc[i].grade]) {
                                gs[doc[i].grade] = {};
                            }
                            if (!gs[doc[i].grade][doc[i].subject]) {
                                gs[doc[i].grade][doc[i].subject] = {
                                    total: 0,
                                    finished: 0,
                                    pending: 0,
                                    received: 0,
                                    toBeFinished: 0,
                                    timeout: 0,
                                    canceled: 0
                                };
                            }
                            //记录下所有的年级科目组合以及订单状态情况
                            gs[doc[i].grade][doc[i].subject]['total']++;
                            if(!gs[doc[i].grade][doc[i].subject][doc[i].status]){
                                gs[doc[i].grade][doc[i].subject][doc[i].status] = 0;
                            }
                            gs[doc[i].grade][doc[i].subject][doc[i].status]++;
                        }
                        resp = {
                            hour: hourStr(doc[0].create_time),
                            stat: stat,
                            gs: gs
                        };
                        ep2.emit('daily', resp);
                    } else {
                        ep2.emit('daily', resp);
                    }
                }
            });
        }
    }
};

function dateStr(t){//日期string，2015-10-09
    var d = new Date(t);
    return (d.getFullYear().toString() + '-' + (d.getMonth() + 1).toString() + '-' + d.getDate().toString());
}
function hourStr(t){//小时string
    var d = new Date(t);
    return (d.getHours().toString());
}
