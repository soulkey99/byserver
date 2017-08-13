/**
 * Created by MengLei on 2015/11/12.
 */
var db = require('./../../../../config').db;
var config = require('./../../../../config');
var objectId = require('mongojs').ObjectId;
var result = require('./../../../utils/result');
var log = require('../../../../utils/log').h5;

//获取广播消息历史
module.exports = function(req, res) {
    var start = parseInt(req.body.startPos || '1') - 1;
    var count = parseInt(req.body.pageSize || '10');
    var query = {from: 'system', type: {$in: ['broadcast', 'broadcast_t', 'broadcast_s']}};
    if (req.body.startTime && req.body.endTime) {
        query['time'] = {$gte: parseFloat(req.body.startTime), $lte: parseFloat(req.body.endTime)};
    } else if (req.body.startTime) {
        query['time'] = {$gte: parseFloat(req.body.startTime)};
    } else if (req.body.endTime) {
        query['time'] = {$lte: parseFloat(req.body.endTime)};
    }
    if (req.body.type) {
        query['type'] = req.body.type;
    }
    if(req.body.display){
        query['display'] = req.body.display == 'true';
    }

    db.msgbox.find(query).sort({time: -1}).skip(start < 0 ? 0 : start).limit(count).toArray(function (err, doc) {
        if (err) {
            result(res, {statusCode: 905, message: err.message});
        } else {
            var list = [];
            for (var i = 0; i < doc.length; i++) {
                list.push({
                    msgid: doc[i]._id.toString(),
                    from: doc[i].from,
                    type: doc[i].type,
                    detail: doc[i].detail,
                    time: doc[i].time,
                    delete: doc[i].delete,
                    display: doc[i].display
                });
            }
            result(res, {statusCode: 900, list: list});
        }
    });
};