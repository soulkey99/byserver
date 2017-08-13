/**
 * Created by MengLei on 2015/8/11.
 */

var config = require('../../../config');
var result = require('../../utils/result');
var eventproxy = require('eventproxy');
var ep = new eventproxy();
var log = require('./../../../utils/log').admin;


//查询内部教师答题情况统计
module.exports = function(req, res) {
    //


    config.db.userConf.find({type: 'teacher'}, {phonenum: 1, name: 1}, function(err2, doc2){
        if(err2){
            //
        }else{
            var teacherPhones = [];
            for(var k=0; k<doc2.length; k++){
                teacherPhones.push(doc2[k].phonenum);
            }
            var query = {phone: {$in: teacherPhones}};

            if(req.body.qType == 'all'){
                query = {userType: 'teacher'};
            }

            config.db.users.find(query, {
                _id: 1,
                nick: 1,
                phone: 1,
                'userInfo.name': 1
            }, function (err, doc) {
                if (err) {
                    log.error('query teacher answer stat error: ' + err.message);
                    result(res, {statusCode: 905, message: err.message});
                } else {
                    for (var i = 0; i < doc.length; i++) {
                        var s_query = {s_id: doc[i]._id.toString()};
                        var t_query = {t_id: doc[i]._id.toString()};
                        if(req.body.startTime && req.body.endTime){
                            //
                            s_query.start_time = {$gte: parseFloat(req.body.startTime), $lte: parseFloat(req.body.endTime)};
                            t_query.start_time = {$gte: parseFloat(req.body.startTime), $lte: parseFloat(req.body.endTime)};
                        } else if(req.body.startTime){
                            s_query.start_time = {$gte: parseFloat(req.body.startTime)};
                            t_query.start_time = {$gte: parseFloat(req.body.startTime)};
                        } else if(req.body.endTime){
                            s_query.start_time = {$lte: parseFloat(req.body.endTime)};
                            t_query.start_time = {$lte: parseFloat(req.body.endTime)};
                        }

                        //console.log(s_query);
                        //console.log(t_query);

                        config.db.orders.find(s_query, {s_id: 1, _id: 0}, function (err2, doc2) {
                            if (err2) {
                                //
                            } else {
                                if(doc2.length > 0) {
                                    ep.emit('count', {s_id: doc2[0].s_id, count: doc2.length});
                                }else{
                                    ep.emit('count', {s_id: '', count: 0});
                                }
                            }
                        });
                        config.db.orders.find(t_query, {t_id: 1, _id: 0}, function (err2, doc2) {
                            if (err2) {
                                //
                            } else {
                                if(doc2.length > 0) {
                                    ep.emit('count', {t_id: doc2[0].t_id, count: doc2.length});
                                }else{
                                    ep.emit('count', {t_id: '', count: 0});
                                }
                            }
                        });
                    }
                    ep.after('count', doc.length * 2, function (list) {
                        //
                        var itemList = [];
                        for (var j = 0; j < doc.length; j++) {
                            var item = {
                                u_id: doc[j]._id.toString(),
                                name: doc[j].userInfo.name || doc[j].nick,
                                phone: doc[j].phone,
                                t_count: 0,
                                s_count: 0
                            };
                            for(var m=0; m<doc2.length; m++){
                                if(item.phone == doc2[m].phonenum){
                                    item.name = doc2[m].name;
                                }
                            }

                            for (var k = 0; k < list.length; k++) {
                                //
                                if (item.u_id == list[k].s_id) {
                                    item.s_count = list[k].count;
                                }
                                if (item.u_id == list[k].t_id) {
                                    item.t_count = list[k].count;
                                }
                            }
                            itemList.push(item);
                        }
                        itemList.sort(function(a, b){
                            return b.t_count - a.t_count;
                        });
                        itemList = itemList.slice(0, 50);
                        result(res, {statusCode: 900, list: itemList});
                    });
                }
            });
        }
    });

};

