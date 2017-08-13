/**
 * Created by MengLei on 2015/10/21.
 */

var db = require('../../../config').db;
var objectId = require('mongojs').ObjectId;
var result = require('../../utils/result');
var eventproxy = require('eventproxy');
var log = require('../../../utils/log').http;

//获取系统最近的一些题目信息
module.exports = function(req, res) {
    var start = parseInt(req.body.startPos || 1) - 1;
    var count = parseInt(req.body.pageSize || 10);

    db.orders.find({status: 'finished'}).sort({create_time: -1}).skip(start < 0 ? 0 : start).limit(count).toArray(function (err, doc) {
        if (err) {
            result(res, {statusCode: 905, message: err.message});
        } else {
            if (doc.length > 0) {
                var idObj = {};
                for (var i = 0; i < doc.length; i++) {
                    idObj[doc[i].s_id] = 1;
                    idObj[doc[i].t_id] = 1;
                }
                var ids = [];
                for (var j = 0; j < Object.keys(idObj).length; j++) {
                    try {
                        ids.push(new objectId(Object.keys(idObj)[j]));
                    } catch (ex) {
                        //
                    }
                }
                db.users.find({_id: {$in: ids}}, {_id: 1, nick: 1, phone: 1}, function (err2, doc2) {
                    if (err2) {
                        result(res, {statusCode: 905, message: err2.message});
                    } else {
                        var list = [];
                        for (var i = 0; i < doc.length; i++) {
                            var item = {
                                o_id: doc[i]._id.toString(),
                                grade: doc[i].grade,
                                subject: doc[i].subject,
                                create_time: doc[i].create_time,
                                start_time: doc[i].start_time,
                                end_time: doc[i].end_time,
                                status: doc[i].status,
                                t_id: doc[i].t_id,
                                t_nick: '',
                                s_id: doc[i].s_id,
                                s_nick: ''
                            };
                            for (var j = 0; j < doc2.length; j++) {
                                if (item.t_id == doc2[j]._id.toString()) {
                                    item.t_nick = doc2[j].nick;
                                }
                                if (item.s_id == doc2[j]._id.toString()) {
                                    item.s_nick = doc2[j].nick;
                                }
                            }
                            list.push(item);
                        }
                        result(res, {statusCode: 900, list: list});
                    }
                });
            } else {
                result(res, {statusCode: 900, list: []});
            }
        }
    });
};