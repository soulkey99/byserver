/**
 * Created by MengLei on 2015/9/19.
 */

var db = require('../../../../config').db;
var objectId = require('mongojs').ObjectId;
var result = require('../../../utils/result');
var eventproxy = require('eventproxy');
var log = require('./../../../../utils/log').h5;

//综合答题数据
module.exports = function(req, res) {
    var ep = new eventproxy();
    ep.all('total', 'timeout', 'canceled', 'finished', 'pending', 'received', 'toBe', 'gs', function (total, timeout, canceled, finished, pending, received, toBe, gs) {
        //
        result(res, {statusCode: 900, stats: {total: total, timeout: timeout, canceled: canceled, finished: finished, pending: pending, received: received, toBeFinished: toBe, gs: gs}});
    });
    ep.fail(function(err2){
        result(res, {statusCode: 905, message: err2.message});
    });

    var all_q = {};
    var timeout_q = {status: 'timeout'};
    var canceled_q = {status: 'canceled'};
    var finished_q = {status: 'finished'};
    var pending_q = {status: 'pending'};
    var received_q = {status: 'received'};
    var toBe_q = {status: 'toBeFinished'};

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
            //总数据
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
            //分年级学科总数据
            ep.emit('gs', gsObj);
        }
    });


    //超时订单数据
    db.orders.find(timeout_q, {_id: 1}, ep.done('timeout', function (doc2) {return doc2.length;}));

    //取消订单数据
    db.orders.find(canceled_q, {_id: 1}, ep.done('canceled', function (doc2) {return doc2.length;}));

    //完成订单数据
    db.orders.find(finished_q, {_id: 1}, ep.done('finished', function (doc2) {return doc2.length;}));

    //推送中订单数据
    db.orders.find(pending_q, {_id: 1}, ep.done('pending', function (doc2) {return doc2.length;}));

    //已接单订单数据
    db.orders.find(received_q, {_id: 1}, ep.done('received', function (doc2) {return doc2.length;}));

    //待确认订单数据
    db.orders.find(toBe_q, {_id: 1}, ep.done('toBe', function (doc2) {return doc2.length;}));
};
