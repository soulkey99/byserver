/**
 * Created by MengLei on 2015/11/6.
 */

var db = require('./../../../../config').db;
var objectId = require('mongojs').ObjectId;
var eventproxy = require('eventproxy');
var result = require('./../../../utils/result');
var msgItem = require('./utils/msgItem');
var log = require('../../../../utils/log').h5;

//获取消息详情
module.exports = function(req, res) {
    var _id = new objectId();
    try {
        _id = new objectId(req.body.pm_id);
    } catch (ex) {
        result(res, {statusCode: 919, message: ex.message});
        return;
    }
    db.pubMsg.findOne({_id: _id}, function (err, doc) {
        if (err) {
            result(res, {statusCode: 905, message: err.message});
        } else {
            if (doc) {
                msgItem(doc, function (err2, doc2) {
                    if (err) {
                        result(res, {statusCode: 905, message: err2.message});
                    } else {
                        result(res, {statusCode: 900, detail: doc2});
                    }
                });
            } else {
                result(res, {statusCode: 960, message: '消息id不存在！'});
            }
        }
    });
};
