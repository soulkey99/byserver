/**
 * Created by MengLei on 2015/5/23.
 */

var db = require('./../../../config').db;
var result = require('./../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('./../../../utils/log').admin;

module.exports = function(req, res) {
    //获取管理员列表
    var query = {};
    if (req.body.adminType) {
        query.adminType = req.body.adminType;
    }

    var start = req.body.startPos ? req.body.startPos : 1;
    var count = req.body.pageSize ? req.body.pageSize : 50;

    db.admins.find(query).skip((parseInt(start) - 1) < 0 ? 0 : (parseInt(start) - 1)).limit(parseInt(count)).toArray(function (err, doc) {
        if (err) {
            //handle error
            log.error('admin login error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        } else {
            log.trace('get admin list success');
            for (var i = 0; i < doc.length; i++) {
                doc[i].userID = doc[i]._id.toString();
                delete(doc[i].userInfo);
                delete(doc[i].userPwd);
                delete(doc[i].authSign);
                delete(doc[i]._id);
            }
            result(res, {statusCode: 900, adminList: doc});
        }
    });
};