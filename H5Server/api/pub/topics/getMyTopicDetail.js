/**
 * Created by MengLei on 2015/10/30.
 */

var db = require('./../../../../config').db;
var objectId = require('mongojs').ObjectId;
var result = require('./../../../utils/result');
var log = require('../../../../utils/log').h5;

//获取文章详细内容
module.exports = function(req, res) {
    var _id = new objectId();
    try {
        _id = new objectId(req.body.pt_id);
    } catch (ex) {
        result(res, {statusCode: 919, message: ex.message});
        return;
    }
    db.pubTopics.findOne({_id: _id, author_id: req.body.userID}, function (err, doc) {
        if (err) {
            result(res, {statusCode: 905, message: err.message});
        } else {
            if (doc) {
                //有数据
                var item = {
                    pt_id: doc._id.toString(),
                    title: doc.title,
                    summary: doc.summary,
                    content: doc.content,
                    visit: doc.visit,
                    createTime: doc.createTime,
                    delete: doc.delete,
                    ups: doc.ups.length,
                    cover: doc.cover
                };
                result(res, {statusCode: 900, detail: item});
            } else {
                //没有数据，返回错误
                result(res, {statusCode: 961, message: '文章id不存在！'});
            }
        }
    })
};

