/**
 * Created by MengLei on 2015/3/31.
 */

var db = require('./../../../config').db;
var result = require('./../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('./../../../utils/log').admin;


//input params: userID, authSign, t_id, verify(true/false),
module.exports = function(req, res) {
    var _id = new objectId(req.body.userID);

    db.admins.findOne({_id: _id}, function (err, doc) {
        if (err) {
            //handle error
            log.error('verify teacher error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        } else {
            //
            if (doc) {
                //user exists
                if (doc.authSign == req.body.authSign) {
                    //token success
                    if (doc.adminType == 'superAdmin' || doc.adminType == 'admin' || doc.adminType == 'teacherAdmin') {
                        //权限符合，去修改用户的状态
                        var setObj = {};
                        //管理员意见
                        setObj['userInfo.teacher_info.admin_reason'] = req.body.admin_reason;
                        if(req.body.verify == 'true'){
                            //管理员确认验证通过
                            setObj['userInfo.teacher_info.verify_type'] = 'verified';
                        }else{
                            //管理员拒绝验证通过
                            setObj['userInfo.teacher_info.verify_type'] = 'notVerified';
                        }
                        //修改数据库
                        db.users.update({_id: new objectId(req.body.t_id)}, {$set: setObj});
                        log.trace('admin verify teacher success');
                        result(res, {statusCode: 900});
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
    });
};



