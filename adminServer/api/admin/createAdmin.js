/**
 * Created by MengLei on 2015/3/31.
 */

var db = require('./../../../config').db;
var result = require('./../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('./../../../utils/log').admin;

//创建管理员账号（ONLY for super admin）
module.exports = function(req, res) {
    //
    var _id = new objectId(req.body.userID);
    db.admins.findOne({_id: _id}, function (err, doc) {
        if (err) {
            //handle error
            log.error('verify teacher error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        } else {
            if (doc) {
                //admin user exists
                if (doc.authSign = req.body.authSign) {
                    //token valid
                    if (doc.adminType = 'superAdmin') {
                        //role correct
                        var newID = new objectId();
                        var newAdmin = {_id: newID, userName: req.body.userName, nick: req.body.nick, userPwd: req.body.userPwd, authSign: '', adminType: req.body.adminType};
                        db.admins.insert(newAdmin, function(err2, doc2){
                            if(err2){
                                //handle error
                            }else{
                                //success
                                log.trace('create administrator success, role is: ' + req.body.adminType);
                                result(res, {statusCode: 900});
                            }
                        })
                    } else {
                        //用户权限不符
                        log.error('admin user not authorized.');
                        result(res, {statusCode: 908, message: 'admin user not authorized.'});
                    }
                } else {
                    //token invalid
                    log.error('user token invalid.');
                    result(res, {statusCode: 903});
                }
            } else {
                //用户不存在
                log.error('verify teacher, admin userID not exists.');
                result(res, {statusCode: 902});
            }
        }
    })
};