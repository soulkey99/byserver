/**
 * Created by MengLei on 2015/7/30.
 */

var db = require('./../../../../config').db;
var result = require('./../../../utils/result');
var objectId = require('mongojs').ObjectId;
var proxy = require('../../../../common/proxy');
var log = require('./../../../../utils/log').h5;

//获取意见反馈
module.exports = function(req, res) {
    if (req.body.u_id) {
        proxy.Feedback.getFeedbacksByUser({
            userID: req.body.u_id,
            startPos: req.body.startPos,
            pageSize: req.body.pageSize,
            flag: true
        }, function (err, doc) {
            if (err) {
                return result(res, {statusCode: 905, message: err.message});
            }
            var list = [];
            for (var i = 0; i < doc.length; i++) {
                list.push(doc[i].toObject({getters: true}));
            }
            result(res, {statusCode: 900, list: list});
        });
    } else {
        proxy.Feedback.getAdminFeedbacks2({
            startPos: req.body.startPos,
            pageSize: req.body.pageSize
        }, function (err, doc) {
            if (err) {
                return result(res, {statusCode: 905, message: err.message});
            }
            result(res, {statusCode: 900, list: doc});
        });
    }
};
