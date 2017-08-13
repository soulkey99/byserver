/**
 * Created by MengLei on 2015/3/31.
 */

var db = require('./../../../config').db;
var result = require('./../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('./../../../utils/log').admin;

module.exports = function(req, res) {
    var _id = new objectId(req.body.userID);
    var start = req.body.startPos ? req.body.startPos : 1;
    var count = req.body.pageSize ? req.body.pageSize : 5;

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
                        //权限符合
                        db.users.find({'userInfo.teacher_info.verify_type': 'waitingVerify'}, {'userInfo.student_info': 0, 'authSign': 0, 'userType': 0}).skip((parseInt(start) - 1) < 0 ? 0 : (parseInt(start) - 1)).limit(parseInt(count)).toArray(function (err2, doc2) {
                            if (err2) {
                                //handle error
                                log.error('query teacher list error: ' + err.message);
                                result(res, {statusCode: 905, message: err.message});
                            } else {
                                //success
                                log.trace('query teacher list success');
                                for(var i = 0; i < doc2.length; i++){
                                    doc2[i].t_id = doc2[i]._id.toString();
                                    delete(doc2[i]._id);
                                }
                                result(res, {statusCode: 900, teacherList: doc2});
                            }
                        });
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
