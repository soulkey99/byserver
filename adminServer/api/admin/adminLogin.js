/**
 * Created by MengLei on 2015/3/31.
 */

var db = require('./../../../config').db;
var result = require('./../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('./../../../utils/log').admin;

module.exports = function(req, res) {
    //
    db.admins.findOne({userName: req.body.userName}, function (err, doc) {
        if (err) {
            //handle error
            log.error('admin login error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        } else {
            if (doc) {
                //user exists
                if (doc.userPwd == req.body.userPwd) {
                    //login success
                    var token = require('crypto').randomBytes(16).toString('hex');
                    var setObj = {'authSign': token, 'lastLoginTime': (new Date()).getTime()};
                    var userID = doc._id.toString();
                    db.admins.update({_id: doc._id}, {$set: setObj}, function (err2, doc2) {
                        if (err2) {
                            //handle error
                            log.error('admin login error: ' + err2.message);
                            result(res, {statusCode: 905, message: err.message});
                        } else {
                            //success
                            log.trace('admin login success');
                            result(res, {
                                statusCode: 900, userID: userID,
                                authSign: token,
                                nick: doc.nick,
                                adminType: doc.adminType,
                                userInfo: doc.userInfo
                            });
                        }
                    });
                } else {
                    //login userPwd error
                    log.error('admin login error: userPwd error.');
                    result(res, {statusCode: 907});
                }
            } else {
                //user not exists
                log.error('admin login error: user not exists.');
                result(res, {statusCode: 902});
            }
        }
    });
};
