/**
 * Created by MengLei on 2015/5/19.
 */

var db = require('../../config').db;
var objectId = require('mongojs').ObjectId;
var result = require('./result');
var log = require('../../utils/log').admin;

module.exports = function (req, res, next) {
    var authSign = req.body.authSign;
    var _id;

    log.trace('method: ' + req.query.m);
    //除登陆外，要做token校验，并将user对象放在req中
    if(req.query.m == 'adminLogin' || req.query.m == 'getTeacherStat' || req.query.m == 'modifyGname') {
        next();
    }else{
        try {
            _id = new objectId(req.body.userID);
        }catch (ex){
            log.fatal('checkAuthSign, user id exception： ' + ex.message);
            result(res, {statusCode: 905, message: ex.message});
            return;
        }
        db.admins.findOne({_id: _id}, function (err, doc) {
            if (err) {
                //handle error
                log.error('check authSign error: ' + err.message);
                result(res, {statusCode: 905, message: err.message});
            } else {
                if (doc) {
                    if (doc.authSign == authSign) {
                        req.body.userType = doc.userType;
                        req.user = doc;
                        log.trace('check authSign success.');
                        next();
                    } else {
                        log.trace('check authSign failed. token error.');
                        result(res, {statusCode: 903});
                    }
                } else {
                    log.trace('check authSign failed. user id not exists.');
                    result(res, {statusCode: 902})
                }
            }
        });
    }
};