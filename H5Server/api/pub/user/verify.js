/**
 * Created by MengLei on 2015/10/28.
 */

var db = require('./../../../../config').db;
var objectId = require('mongojs').ObjectId;
var result = require('./../../../utils/result');
var log = require('../../../../utils/log').h5;

//公众号校验邮箱
module.exports = function(req, res) {
    if (!req.body.code) {
        result(res, {statusCode: 950, message: 'code参数不能为空'});
        return;
    }
    db.users.findOne({checkCode: req.body.code}, function (err, doc) {
        if (err) {
            result(res, {statusCode: 905, message: err.message});
        } else {
            if (doc) {
                //有数据，更新记录，返回用户信息，就当用户已经登陆
                db.users.update({_id: doc._id}, {$set: {status: 'active'}});
                var resp = {
                    statusCode: 900,
                    nick: doc.nick,
                    email: doc.email
                };
                result(res, resp);
            } else {
                //没有记录，返回错误
                result(res, {statusCode: 965, message: '校验码不存在！'});
            }
        }
    });
};
