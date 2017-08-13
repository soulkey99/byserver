/**
 * Created by MengLei on 2015/10/30.
 */

var db = require('./../../../../config').db;
var objectId = require('mongojs').ObjectId;
var eventproxy = require('eventproxy');
var result = require('./../../../utils/result');
var msgItem = require('./utils/msgItem');
var log = require('../../../../utils/log').h5;

//公众号获取自己发出的消息列表
module.exports = function(req, res) {
    var query = {author_id: req.body.userID, delete: false};
    var start = parseInt(req.body.startPos || '1') - 1;
    var count = parseInt(req.body.pageSize || '10');
    if (req.body.delete == 'true') {
        query = {author_id: req.body.userID};
    }
    if (req.body.type) {
        query['type'] = req.body.type;
    }
    if (req.body.castType) {
        query['castType'] = req.body.castType;
    }
    if (req.body.startTime && req.body.endTime) {
        query['createTime'] = {$gte: parseFloat(req.body.startTime), $lte: parseFloat(req.body.endTime)};
    } else if (req.body.startTime) {
        query['createTime'] = {$gte: parseFloat(req.body.startTime)};
    } else if (req.body.endTime) {
        query['createTime'] = {$lte: parseFloat(req.body.endTime)};
    }
    db.pubMsg.find(query).sort({createTime: -1}).skip(start < 0 ? 0 : start).limit(count).toArray(function (err, doc) {
        if (err) {
            result(res, {statusCode: 905, message: err.message});
        } else {
            if (doc.length > 0) {
                //有内容
                var ep = new eventproxy();
                ep.after('item', doc.length, function (items) {
                    items.sort(function (a, b) {
                        return a.createTime - b.createTime
                    });
                    result(res, {statusCode: 900, list: items});
                });
                ep.fail(function (err) {
                    log.error('get pub history error: ' + err.message);
                    result(res, {statusCode: 905, message: err.message});
                });
                for (var i = 0; i < doc.length; i++) {
                    msgItem(doc[i], function (err2, doc2) {
                        if (err2) {
                            ep.emit('error', err2);
                        } else {
                            ep.emit('item', doc2);
                        }
                    });
                }
            } else {
                //没有内容，直接返回空list
                result(res, {statusCode: 900, list: []});
            }
        }
    });
};

