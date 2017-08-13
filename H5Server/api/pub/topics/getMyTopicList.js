/**
 * Created by MengLei on 2015/10/30.
 */

var db = require('./../../../../config').db;
var objectId = require('mongojs').ObjectId;
var result = require('./../../../utils/result');
var log = require('../../../../utils/log').h5;

//公众号获取自己发布的文章列表
module.exports = function(req, res) {
    var query = {author_id: req.body.userID, delete: false};
    var start = parseInt(req.body.startPos || '1') - 1;
    var count = parseInt(req.body.pageSize || '10');
    if (req.body.delete == 'true') {
        query = {author_id: req.body.userID};
    }
    if (req.body.startTime && req.body.endTime) {
        query['createTime'] = {$gte: parseFloat(req.body.startTime), $lte: parseFloat(req.body.endTime)};
    } else if (req.body.startTime) {
        query['createTime'] = {$gte: parseFloat(req.body.startTime)};
    } else if (req.body.endTime) {
        query['createTime'] = {$lte: parseFloat(req.body.endTime)};
    }
    db.pubTopics.find(query).sort({createTime: -1}).skip(start < 0 ? 0 : start).limit(count).toArray(function (err, doc) {
        if (err) {
            result(res, {statusCode: 905, message: err.message});
        } else {
            //有数据
            var list = [];
            for (var i = 0; i < doc.length; i++) {
                var item = {
                    pt_id: doc[i]._id.toString(),
                    title: doc[i].title,
                    summary: doc[i].summary,
                    visit: doc[i].visit,
                    createTime: doc[i].createTime,
                    delete: doc[i].delete,
                    ups: doc[i].ups.length,
                    cover: doc[i].cover
                };
                list.push(item);
            }
            result(res, {statusCode: 900, list: list});
        }
    })
};
