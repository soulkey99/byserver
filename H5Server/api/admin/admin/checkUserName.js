/**
 * Created by MengLei on 2015/11/12.
 */

var db = require('./../../../../config').db;
var result = require('./../../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('./../../../../utils/log').h5;

//新增、编辑管理员信息，如果传u_id就是编辑，否则就是新增
module.exports = function(req, res) {
    db.admins.find({userName: req.body.userName}, {_id: 1}, function (err, doc) {
        if (err) {
            result(res, {statusCode: 905, message: err.message});
        } else {
            if (doc.length == 0) {
                result(res, {statusCode: 900});
            } else {
                result(res, {statusCode: 901});
            }
        }
    });
};