/**
 * Created by MengLei on 2015/8/19.
 */

var db = require('../../../config').db;
var result = require('../../utils/result');
var eventproxy = require('eventproxy');


//获取题目数据
//phone:待查用户手机号，u_id：待查用户id，startTime：开始时间，endTime：截止时间，userType：用户身份
module.exports = function(req, res) {
    var query = {};
    if (req.body.startTime && req.body.endTime) {
        query.create_time = {$gte: parseFloat(req.body.startTime), $lte: parseFloat(req.body.endTime)};
    } else if (req.body.startTime) {
        query.create_time = {$gte: parseFloat(req.body.startTime)};
    } else if (req.body.endTime) {
        query.create_time = {$lte: parseFloat(req.body.endTime)};
    }

    var ep = eventproxy.create('uid', function (u_id) {
        if (req.body.userType == 'student') {
            query.s_id = u_id;
        } else {
            query.t_id = u_id;
        }
        ep2.emit('count', query);
    });

    var ep2 = eventproxy.create('count', function (query) {
        db.orders.count(query, function (err, doc) {
            //
            result(res, {statusCode: 900, count: doc});
        });
    });

    //如果没有phone或者u_id，那么就是统计一段时间内总共产生的问题数，否则，就是查询某个用户产生的问题数
    if (req.body.phone) {
        db.users.findOne({phone: req.body.phone}, {_id: 1}, function (err, doc) {
            if (err) {
                //handle error
            } else {
                if (doc) {
                    ep.emit('uid', doc._id.toString());
                } else {
                    //
                }
            }
        })
    } else if (req.body.u_id) {
        ep.emit('uid', req.body.u_id);
    } else {
        //
        ep2.emit('count', query);
    }


};