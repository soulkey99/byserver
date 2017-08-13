/**
 * Created by MengLei on 2015/11/20.
 */
var db = require('./../../../../config').db;
var result = require('./../../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('./../../../../utils/log').h5;

//审核公众号的资格认证
module.exports = function(req, res) {
    var _id = new objectId();
    try {
        _id = new objectId(req.body.u_id);
    } catch (ex) {
        result(res, {statusCode: 919, message: ex.message});
        return;
    }
    var setObj = {'userInfo.verify_info.verify_type': req.body.verify == 'true' ? 'verified' : 'fail'};
    if (req.body.admin_reason) {
        setObj['userInfo.verify_info.admin_reason'] = req.body.admin_reason;
    }
    db.users.findAndModify({query: {_id: _id}, update: {$set: setObj}, new: true}, function (err, doc) {
        if (err) {
            result(res, {statusCode: 905, message: err.message});
        } else {
            if (doc) {
                result(res, {statusCode: 900});
            } else {
                result(res, {statusCode: 902, message: '公众号不存在！'});
            }
        }
    });
};
