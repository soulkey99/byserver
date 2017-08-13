/**
 * Created by MengLei on 2015/3/31.
 */

var db = require('./../../../config').db;
var result = require('./../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('./../../../utils/log').admin;

module.exports = function(req, res) {
    //
    var _id = new objectId(req.body.userID);
    db.admins.findOne({_id: _id}, function (err, doc) {
        if (err) {
            //handle error
            log.error('admin change pwd error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        } else {
            if (doc) {
                //user exists
                if (doc.authSign == req.body.authSign) {
                    //token match
                    if (doc.userPwd == req.body.oldPwd) {
                        //old password match
                        db.admins.update({_id: _id}, {$set: {userPwd: req.body.newPwd}}, function (err, doc) {
                            if (err) {
                                //handle error
                                log.error('change password error: ' + err.message);
                                result(res, {statusCode: 905, message: err.message});
                            } else {
                                //success
                                log.trace('change password success.');
                                result(res, {statusCode: 900});
                            }
                        });
                    } else {
                        //old password not correct
                        log.error('invalid old password');
                        result(res, {statusCode: 907, message: 'old password not match.'});
                    }
                } else {
                    //token not correct
                    log.error('invalid user token.');
                    result(res, {statusCode: 903})
                }
            } else {
                //user not exists
                log.error('user not exists.');
                result(res, {statusCode: 902});
            }
        }
    });
};