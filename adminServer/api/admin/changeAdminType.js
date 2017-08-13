/**
 * Created by MengLei on 2015/4/1.
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
            log.error('admin change admin type error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        } else {
            if (doc) {
                //user exists
                if (doc.authSign == req.body.authSign) {
                    //token match
                    if (doc.adminType = 'superAdmin') {
                        //role correct
                        db.admins.update({_id: new objectId(req.body.adminID)}, {$set: {adminType: req.body.newType}}, function(err, doc) {
                            if (err) {
                                //handle error
                                log.error('change admin type error: ' + err.message);
                                result(res, {statusCode: 905, message: err.message});
                            } else {
                                //success
                                log.trace('change admin type success.');
                                result(res, {statusCode: 900});
                            }
                        });
                    } else {
                        //用户权限不符
                        log.error('admin user not authorized.');
                        result(res, {statusCode: 908, message: 'admin user not authorized.'});
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