/**
 * Created by MengLei on 2015/11/20.
 */
var db = require('./../../../../config').db;
var result = require('./../../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('./../../../../utils/log').h5;

//获取公众号的详情信息
module.exports = function(req, res) {
    var _id = new objectId();
    try {
        _id = new objectId(req.body.u_id);
    } catch (ex) {
        result(res, {statusCode: 919, message: ex.message});
        return;
    }
    db.users.findOne({_id: _id}, function (err, doc) {
        if (err) {
            result(res, {statusCode: 905, message: err.message});
        } else {
            if (doc) {
                result(res, {statusCode: 900, detail: {u_id: doc._id.toString(), email: doc.email, nick: doc.nick, status: doc.status, userInfo: doc.userInfo, intro: doc.intro, pubID: doc.pubID}});
            } else {
                result(res, {statusCode: 902, message: '所要查找的公众号不存在！'});
            }
        }
    });
};
