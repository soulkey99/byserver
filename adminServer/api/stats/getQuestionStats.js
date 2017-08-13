/**
 * Created by MengLei on 2015/7/28.
 */

var db = require('../../../config').db;
var config = require('../../../config');
var result = require('../../utils/result');
var eventproxy = require('eventproxy');

//获取试题统计信息，每日题目数，抢单数，超时数等等
module.exports = function(req, res) {
    var testPhone = config.testPhones;
    var query = {phone: {$nin: testPhone}};

    db.users.find({phone: {$nin: testPhone}}, {_id: 1}, function (err, doc) {
        if (err) {
            result(res, {statusCode: 905, message: err.message});
        } else {
            var sArray = [];
            for (var i = 0; i < doc.length; i++) {
                //console.log(doc);
                sArray.push(doc[i]._id.toString());
            }
            var ep = new eventproxy();
            ep.all('total', 'timeout', 'canceled', 'finished', 'pending', 'received', 'toBe', 'gs', function (total, timeout, canceled, finished, pending, received, toBe, gs) {
                //
                result(res, {statusCode: 900, stats: {total: total, timeout: timeout, canceled: canceled, finished: finished, pending: pending, received: received, toBeFinished: toBe, gs: gs}});
            });
            ep.bind('error', function(err2){
                ep.unbind();
                result(res, {statusCode: 905, message: err2.message});
            });

            var all_q = {s_id: {$in: sArray}};
            var timeout_q = {s_id: {$in: sArray}, status: 'timeout'};
            var canceled_q = {s_id: {$in: sArray}, status: 'canceled'};
            var finished_q = {s_id: {$in: sArray}, status: 'finished'};
            var pending_q = {s_id: {$in: sArray}, status: 'pending'};
            var received_q = {s_id: {$in: sArray}, status: 'received'};
            var toBe_q = {s_id: {$in: sArray}, status: 'toBeFinished'};

            if(req.body.startTime && req.body.endTime){
                //
                all_q.create_time = {$gte: parseFloat(req.body.startTime), $lte: parseFloat(req.body.endTime)};
                timeout_q.create_time = {$gte: parseFloat(req.body.startTime), $lte: parseFloat(req.body.endTime)};
                canceled_q.create_time = {$gte: parseFloat(req.body.startTime), $lte: parseFloat(req.body.endTime)};
                finished_q.create_time = {$gte: parseFloat(req.body.startTime), $lte: parseFloat(req.body.endTime)};
                pending_q.create_time = {$gte: parseFloat(req.body.startTime), $lte: parseFloat(req.body.endTime)};
                received_q.create_time = {$gte: parseFloat(req.body.startTime), $lte: parseFloat(req.body.endTime)};
                toBe_q.create_time = {$gte: parseFloat(req.body.startTime), $lte: parseFloat(req.body.endTime)};
            } else if(req.body.startTime){
                all_q.create_time = {$gte: parseFloat(req.body.startTime)};
                timeout_q.create_time = {$gte: parseFloat(req.body.startTime)};
                canceled_q.create_time = {$gte: parseFloat(req.body.startTime)};
                finished_q.create_time = {$gte: parseFloat(req.body.startTime)};
                pending_q.create_time = {$gte: parseFloat(req.body.startTime)};
                received_q.create_time = {$gte: parseFloat(req.body.startTime)};
                toBe_q.create_time = {$gte: parseFloat(req.body.startTime)};
            } else if(req.body.endTime){
                all_q.create_time = {$lte: parseFloat(req.body.endTime)};
                timeout_q.create_time = {$lte: parseFloat(req.body.endTime)};
                canceled_q.create_time = {$lte: parseFloat(req.body.endTime)};
                finished_q.create_time = {$lte: parseFloat(req.body.endTime)};
                pending_q.create_time = {$lte: parseFloat(req.body.endTime)};
                received_q.create_time = {$lte: parseFloat(req.body.endTime)};
                toBe_q.create_time = {$lte: parseFloat(req.body.endTime)};
            }


            db.orders.find(all_q,{grade: 1, subject: 1}, function (err2, doc2) {
                if (err2) {
                    ep.emit('error', err2);
                } else {
                    ep.emit('total', doc2.length);
                    var gsObj = {};
                    for(var i=0; i<doc2.length; i++){
                        if(!gsObj[doc2[i].grade]){
                            gsObj[doc2[i].grade] = {total: 1};
                        }else{
                            gsObj[doc2[i].grade]['total'] ++;
                        }
                        if(!gsObj[doc2[i].grade][doc2[i].subject]){
                            gsObj[doc2[i].grade][doc2[i].subject] = 1;
                        }else{
                            gsObj[doc2[i].grade][doc2[i].subject] ++;
                        }
                    }
                    ep.emit('gs', gsObj);
                }
            });


            db.orders.find(timeout_q, {_id: 1}, function (err2, doc2) {
                if (err2) {
                    ep.emit('error', err2);
                } else {
                    ep.emit('timeout', doc2.length);
                }
            });


            db.orders.find(canceled_q, {_id: 1}, function (err2, doc2) {
                if (err2) {
                    ep.emit('error', err2);
                } else {
                    ep.emit('canceled', doc2.length);
                }
            });


            db.orders.find(finished_q, {_id: 1}, function (err2, doc2) {
                if (err2) {
                    ep.emit('error', err2);
                } else {
                    ep.emit('finished', doc2.length);
                }
            });

            db.orders.find(pending_q, {_id: 1}, function (err2, doc2) {
                if (err2) {
                    ep.emit('error', err2);
                } else {
                    ep.emit('pending', doc2.length);
                }
            });


            db.orders.find(received_q, {_id: 1}, function (err2, doc2) {
                if (err2) {
                    ep.emit('error', err2);
                } else {
                    ep.emit('received', doc2.length);
                }
            });


            db.orders.find(toBe_q, {_id: 1}, function (err2, doc2) {
                if (err2) {
                    ep.emit('error', err2);
                } else {
                    ep.emit('toBe', doc2.length);
                }
            });

        }
    });
};