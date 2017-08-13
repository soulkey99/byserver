/**
 * Created by MengLei on 2015/9/21.
 */

var db = require('./../../../../config').db;
var result = require('./../../../utils/result');
var eventproxy = require('eventproxy');
var objectId = require('mongojs').ObjectId;
var log = require('./../../../../utils/log').h5;

//获取某人的推广详情
module.exports = function(req, res) {
    db.shareCode.findOne({shareCode: req.body.shareCode}, function (err, doc) {
        if (err) {
            //handle error
        } else {
            if (doc) {
                var query = {shareCode: doc.shareCode};
                var query_r = {shareCode: doc.shareCode, registered: true};
                if (req.body.startTime && req.body.endTime) {
                    query.time = {$gte: parseFloat(req.body.startTime), $lte: parseFloat(req.body.endTime)};
                    query_r.time = {$gte: parseFloat(req.body.startTime), $lte: parseFloat(req.body.endTime)};
                }else if (req.body.startTime) {
                    query.time = {$gte: parseFloat(req.body.startTime)};
                    query_r.time = {$gte: parseFloat(req.body.startTime), $lte: parseFloat(req.body.endTime)};
                }else if (req.body.endTime) {
                    query.time = {$gte: parseFloat(req.body.endTime)};
                    query_r.time = {$gte: parseFloat(req.body.startTime), $lte: parseFloat(req.body.endTime)};
                }
                var ep = eventproxy.create('registered', 'all', 'list', function (registered, all, list) {
                    //
                    result(res, {statusCode: 900, registered: registered, invited: all, list: list});
                });
                ep.fail(function (err) {
                    result(res, {statusCode: 905, message: err.message});
                });
                //查所有注册用户数
                db.promotion.count(query, function (err2, doc2) {
                    if (err2) {
                        ep.emit('error', err2);
                    } else {
                        ep.emit('all', doc2);
                    }
                });
                //查已激活的用户数
                db.promotion.count(query_r, function (err2, doc2) {
                    if (err2) {
                        ep.emit('error', err2);
                    } else {
                        ep.emit('registered', doc2);
                    }
                });
                //查用户列表
                var start = req.body.startPos ? req.body.startPos : 1;
                var count = req.body.pageSize ? req.body.pageSize : 10;
                db.promotion.find(query).skip((parseInt(start) - 1) < 0 ? 0 : (parseInt(start) - 1)).limit(parseInt(count)).toArray(function (err2, doc2) {
                    if (err2) {
                        //handle error
                        ep.emit('error', err2);
                    } else {
                        var list = [];
                        for (var i = 0; i < doc2.length; i++) {
                            list.push({
                                phone: doc2[i].phonenum,
                                registered: doc2[i].registered,
                                time: doc2[i].time
                            });
                        }
                        ep.emit('list', list);
                    }
                });
            } else {
                log.error('user do not have share code.');
                result(res, {statusCode: 905, message: 'user do not have share code.'});
            }
        }
    });
};