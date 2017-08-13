/**
 * Created by MengLei on 2015/8/20.
 */


var db = require('../../../config').db;
var config = require('../../../config');
var result = require('../../utils/result');
var objectId = require('mongojs').ObjectId;
var eventproxy = require('eventproxy');


//教师详细数据
module.exports = function(req, res) {
    //
    var query = {t_id: req.body.u_id};
    if (req.body.startTime && req.body.endTime) {
        query.create_time = {$gte: parseFloat(req.body.startTime), $lte: parseFloat(req.body.endTime)};
    } else if (req.body.startTime) {
        query.create_time = {$gte: parseFloat(req.body.startTime)};
    } else if (req.body.endTime) {
        query.create_time = {$lte: parseFloat(req.body.endTime)};
    }
    var ep = eventproxy.create('total', 'daily', 'stu', function (total, daily, stu) {
        //
        result(res, {statusCode: 900, total: total, daily: daily, stu: stu});
    });
    db.orders.find(query, {_id: 1, s_id: 1, t_id: 1, grade: 1, subject: 1}, function (err, doc) {
        if (err) {
            //handle error
        } else {
            //

            var data = {};
            var sidObj = {};
            var sidArray = [];
            var stuArray = [];
            for (var i = 0; i < doc.length; i++) {
                if (doc[i].s_id) {
                    if (sidObj[doc[i].s_id]) {
                        sidObj[doc[i].s_id]++;
                    } else {
                        sidObj[doc[i].s_id] = 1;
                    }
                }
                if (!data[doc[i].grade]) {
                    data[doc[i].grade] = {};
                }
                if (!data[doc[i].grade][doc[i].subject]) {
                    data[doc[i].grade][doc[i].subject] = 1;
                } else {
                    data[doc[i].grade][doc[i].subject]++;
                }
            }
            var total = {total: doc.length, data: data};
            ep.emit('total', total);

            for (var item in sidObj) {
                try {
                    sidArray.push(new objectId(item));
                } catch (ex) {
                    //
                }
            }

            db.users.find({_id: {$in: sidArray}}, {_id: 1, phone: 1, nick: 1, 'userInfo.name': 1}, function (err2, doc2) {
                if (err2) {
                    //
                } else {
                    for (var i = 0; i < doc2.length; i++) {
                        stuArray.push({
                            s_id: doc2[i]._id.toString(),
                            s_phone: doc2[i].phone,
                            s_name: doc2[i].userInfo.name || doc2[i].nick,
                            s_count: sidObj[doc2[i]._id.toString()],
                            self: (config.teacherPhones.indexOf(doc2[i].phone) >= 0)
                        });
                    }
                    stuArray.sort(function(a, b){
                        return b.s_count - a.s_count;
                    });
                    ep.emit('stu', stuArray);
                }
            });
        }
    });
    var ep2 = new eventproxy();


    var start = 0;
    var end = 0;
    if (req.body.startTime) {
        start = parseFloat(req.body.startTime);
    } else {
        var d1 = new Date();
        d1.setHours(0);
        d1.setMinutes(0);
        d1.setSeconds(0);
        start = d1.getTime();
    }
    if (req.body.endTime) {
        end = parseFloat(req.body.endTime);
    } else {
        var d2 = new Date();
        d2.setHours(23);
        d2.setMinutes(59);
        d2.setSeconds(59);
        end = d2.getTime();
    }
    ep2.after('daily', Math.round((end - start) / 86400000), function (d) {
        //
        var data = [];
        for(var i=0; i<d.length; i++){
            if(d[i].date){
                data.push({date: d[i].date, fullDate: d[i].fullDate, count: d[i].count, stu: d[i].stu});
            }
        }
        data.sort(function(a, b){
            return a.fullDate - b.fullDate;
        });
        ep.emit('daily', data);
    });
    for (var i = 0; i < Math.round((end - start) / 86400000); i++) {
        var q = {t_id: req.body.u_id, start_time: {$gte: start + 86400000 * i, $lte: start + 86400000 * (i + 1)}};
        db.orders.find(q, {start_time: 1, s_id: 1}, function (err, doc) {
            if (err) {
                //handle error
            } else {
                var sidObj = {};
                var sidArray = [];
                if (doc.length > 0) {
                    var d = new Date(doc[0].start_time);
                    for(var i=0; i<doc.length; i++){
                        if(sidObj[doc[i].s_id]) {
                            sidObj[doc[i].s_id] = 1;
                            //console.log(sidObj);
                        }else{
                            sidObj[doc[i].s_id] ++;
                        }
                    }

                    for(var item in sidObj){
                        sidArray.push(new objectId(item));
                    }

                    db.users.find({_id: {$in:sidArray}}, {_id: 1, phone: 1, nick: 1, 'userInfo.name': 1}, function(err2, doc2){
                        if(err2){
                            //hanele error
                        }else{
                            //
                            var stuArray = [];
                            for(var i=0; i<doc2.length; i++) {
                                stuArray.push({
                                    s_id: doc2[i]._id.toString(),
                                    s_phone: doc2[i].phone,
                                    s_name: doc2[i].userInfo.name || doc2[i].nick,
                                    s_count: sidObj[doc2[i]._id.toString()]
                                });
                                //console.log(doc2[i]._id.toString() + ': ' + sidObj[doc2[i]._id.toString()])
                            }
                            ep2.emit('daily', {
                                date: d.getDate().toString(),
                                fullDate: dateStr(d.getTime()),
                                count: doc.length,
                                stu: stuArray
                            });
                        }
                    });

                } else {
                    ep2.emit('daily', {date: '', fullDate: '', count: 0});
                }
            }
        });
    }
};


function dateStr(t){
    var ts = new Date(t);
    var year = ts.getFullYear().toString();
    var month = (ts.getMonth() + 1).toString();
    month = month.length < 2 ? '0' + month : month;
    var date = ts.getDate().toString();
    date = date.length < 2 ? '0' + date : date;
    return year + month + date;
}


