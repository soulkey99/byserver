/**
 * Created by MengLei on 2015/9/16.
 */

var db = require('../../../../config').db;
var result = require('../../../utils/result');
var eventproxy = require('eventproxy');
var log = require('./../../../../utils/log').h5;

//获取教师答题数据，答疑中心所有教师的
//返回数据：id，手机号，昵称，姓名，接单数
module.exports = function(req, res) {
    //获取所有教师指定时间内答题数据
    db.userConf.find({type: 'teacher', delete: {$ne: true}}, {phonenum: 1, name: 1}, function (err, doc) {
        if (err) {
            result(res, {statusCode: 905, message: err.message});
        } else {
            var phoneList = [];
            for (var i = 0; i < doc.length; i++) {
                phoneList.push(doc[i].phonenum);
            }
            var query = {phone: {$in: phoneList}};
            if (req.body.qType == 'all') {
                query = {userType: 'teacher'};
            }
            db.users.find(query, {_id: 1, nick: 1, phone: 1}, function (err2, doc2) {
                if (err2) {
                    result(res, {statusCode: 905, message: err2.message});
                } else {
                    var ep = new eventproxy();
                    ep.after('count', doc2.length, function (list) {
                        var itemList = [];
                        for (var j = 0; j < doc2.length; j++) {
                            var item = {
                                u_id: doc2[j]._id.toString(),
                                phone: doc2[j].phone,
                                nick: doc2[j].nick,
                                count: 0
                            };
                            for (var k = 0; k < doc.length; k++) {
                                if (item.phone == doc[k].phonenum) {
                                    item.name = doc[k].name;
                                }
                            }
                            for (var m = 0; m < list.length; m++) {
                                if (item.u_id == list[m].t_id) {
                                    item.count = list[m].count;
                                }
                            }
                            itemList.push(item);
                        }
                        itemList.sort(function (a, b) {
                            return b.count - a.count;
                        });
                        result(res, {statusCode: 900, list: itemList});
                    });
                    ep.fail(function (err) {
                        result(res, {statusCode: 905, message: err.message});
                    });
                    for (var i = 0; i < doc2.length; i++) {
                        var t_query = {t_id: doc2[i]._id.toString()};
                        if (req.body.startTime && req.body.endTime) {
                            t_query.start_time = {
                                $gte: parseFloat(req.body.startTime),
                                $lte: parseFloat(req.body.endTime)
                            };
                        } else if (req.body.startTime) {
                            t_query.start_time = {$gte: parseFloat(req.body.startTime)};
                        } else if (req.body.endTime) {
                            t_query.start_time = {$lte: parseFloat(req.body.endTime)};
                        }
                        //查询某个教师的数据
                        db.orders.find(t_query, {t_id: 1}, function (err3, doc3) {
                            if (err3) {
                                ep.emit('error', err3);
                            } else {
                                if (doc3.length > 0) {
                                    ep.emit('count', {t_id: doc3[0].t_id, count: doc3.length});
                                } else {
                                    ep.emit('count', {t_id: '', count: 0});
                                }
                            }
                        });
                    }
                }
            });
        }
    });
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
