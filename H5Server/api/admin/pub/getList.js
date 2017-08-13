/**
 * Created by MengLei on 2015/11/20.
 */

var db = require('./../../../../config').db;
var result = require('./../../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('./../../../../utils/log').h5;

//获取公众号列表
module.exports = function(req, res) {
    var start = parseFloat(req.body.startPos || '1') - 1;
    var count = parseFloat(req.body.pageSize || '10');
    var query = {userType: 'public'};
    if (req.body.status) {
        query['status'] = req.body.status;
    }
    if (req.body.verify_type) {
        query['userInfo.verify_info.verify_type'] = req.body.verify_type;
    }
    if (req.body.startTime && req.body.endTime) {
        query['userInfo.create_time'] = {$gte: parseFloat(req.body.startTime), $lte: parseFloat(req.body.endTime)};
    } else if (req.body.endTime) {
        query['userInfo.create_time'] = {$lte: parseFloat(req.body.endTime)};
    } else if (req.body.startTime) {
        query['userInfo.create_time'] = {$gte: parseFloat(req.body.startTime)};
    }
    if (req.body.nick) {
        query['nick'] = {$regex: req.body.nick};
    } else if (req.body.email) {
        query['email'] = {$regex: req.body.email};
    } else if (req.body.phone) {
        query['userInfo.phone'] = {$regex: req.body.phone};
    } else if (req.body.pubID) {
        query['pubID'] = {$regex: req.body.pubID};
    }
    db.users.find(query).sort({'userInfo.create_time': -1}).skip(start < 0 ? 0 : start).limit(count).toArray(function (err, doc) {
        if (err) {
            result(res, {statusCode: 905, message: err.message});
        } else {
            var list = [];
            for (var i = 0; i < doc.length; i++) {
                list.push({
                    u_id: doc[i]._id.toString(),
                    email: doc[i].email,
                    nick: doc[i].nick,
                    status: doc[i].status,
                    verify_type: doc[i].userInfo.verify_info.verify_type,
                    create_time: doc[i].userInfo.create_time,
                    pubID: doc[i].pubID
                });
            }
            result(res, {statusCode: 900, list: list});
        }
    });
};
