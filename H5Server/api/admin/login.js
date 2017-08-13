/**
 * Created by MengLei on 2015/8/3.
 */

var db = require('./../../../config').db;
var config = require('./../../../config');
var objectId = require('mongojs').ObjectId;
var result = require('./../../utils/result');
var checkNull = require('../../utils/checkNull');
var log = require('../../../utils/log').h5;

module.exports = function(req, res) {
    //
    if (checkNull(req, res, 'userName', 'passwd')) {
        return;
    }
    var userName = req.body.userName;
    var passwd = req.body.passwd;

    //增加判断，已经被删除的用户无法登陆
    db.admins.findOne({userName: userName, delete: {$ne: true}}, function (err, doc) {
        if (err) {
            log.error('admin login error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        } else {
            if(doc) {
                if(doc.userPwd == passwd) {
                    var token = require('crypto').randomBytes(16).toString('hex');
                    db.admins.update({userName: userName}, {$set: {authSign: token, lastLoginTime: (new Date()).getTime()}});
                    result(res, {statusCode: 900, userID: doc._id.toString(), authSign: token, nick: doc.nick, lastLoginTime: doc.lastLoginTime, userType: doc.adminType, sections: doc.sections, pages: doc.pages});
                }else{
                    log.error('user passwd not correct.');
                    result(res, {statusCode: 923, message: 'password incorrect.'});
                }
            }else{
                log.error('user not exists.');
                result(res, {statusCode: 902, message: 'user not exists.'});
            }
        }
    });
};

