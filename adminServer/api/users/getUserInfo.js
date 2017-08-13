/**
 * Created by MengLei on 2015/9/14.
 */

var db = require('./../../../config').db;
var result = require('./../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('./../../../utils/log').admin;

//获取用户信息，传入u_id或者phonenum
module.exports = function(req, res) {
    var query = {};
    if (req.body.u_id) {
        var _id = new objectId();
        try {
            query = {_id: new objectId(req.body.u_id)};
        } catch (ex) {
            result(res, {statusCode: 919, message: ex.message});
            return;
        }
    } else if (req.body.phonenum) {
        query = {phone: req.body.phonenum};
    } else {
        result(res, {statusCode: 905});
        return;
    }
    db.users.findOne(query, {_id: _id, phone: 1, nick: 1, intro: 1, 'userInfo.avatar': 1}, function (err, doc) {
        if (err) {
            result(res, {statusCode: 905, message: err.message});
        } else {
            if (doc) {
                var info = {
                    userID: doc._id.toString(),
                    phone: doc.phone,
                    nick: doc.nick,
                    intro: doc.intro,
                    avatar: doc.userInfo.avatar || ''
                };
                result(res, {statusCode: 900, info: info});
            } else {
                result({statusCode: 902});
            }
        }
    });
};

