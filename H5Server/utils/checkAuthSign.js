/**
 * Created by MengLei on 2015/4/21.
 */

var db = require('../../config').db;
var objectId = require('mongojs').ObjectId;
var proxy = require('../../common/proxy');
var result = require('./result');
var log = require('../../utils/log').h5;

module.exports = function (req, res, next) {
    if(!req.query.m){
        result(res, {statusCode: 905, message: 'method参数不存在！'});
        return;
    }
    //不需要校验的几个api
    var apiList1 = ['adminLogin', 'getGoodList', 'getGoodDetail', 'getHomeBanner', 'pubLogin', 'pubRegister', 'pubCheckEmail', 'pubVerifyEmail', 'getTopicDetail'];
    if(apiList1.indexOf(req.query.m) >= 0){
        next();
    }else if(req.query.m.indexOf('admin') >= 0 || req.query.m.indexOf('shop') >= 0){
        checkAdmin(req, res, next);
    }else {
        checkUser(req, res, next);
    }
};


//去admin表中校验userID和authSign
function checkAdmin(req, res, next){
    var authSign = req.body.authSign;
    var _id = '';
    try {
        if(req.body.userID) {
            _id = new objectId(req.body.userID);
        }
    }catch(ex){
        //如果异常，则返回
        result(res, {statusCode: 919, message: ex.message});
        return;
    }
    //如果是管理员，则去管理表校验token信息
    db.admins.findOne({_id: _id}, {_id: 1, authSign: 1, userPwd: 1, adminType: 1}, function (err, doc) {
        if (err) {
            //handle error
            log.error('check authSign error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        } else {
            if (doc) {
                if (doc.authSign == authSign) {
                    log.trace('check authSign success.');
                    req.user = doc;
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

//去user表中校验userID和authSign，普通用户以及公众号用户，都走这一分支
function checkUser(req, res, next){
    proxy.User.getUserById(req.body.userID, function (err, doc) {
        if(err){
            return result(res, {statusCode: 905, message: err.message});
        }
        if(!doc){
            log.trace('check authSign failed. user id not exists.');
            return result(res, {statusCode: 902, message: '用户不存在！'});
        }
        if(doc.authSign != req.body.authSign){
            log.trace('check authSign failed. token error. userID=' + req.body.userID + ', authSign=' + req.body.authSign);
            return result(res, {statusCode: 903, message: '用户身份失效，请重新登陆！'});
        }
        req.body.userType = doc.userType;
        req.user = doc;
        log.trace('check authSign success.');
        next();
    });
    // var authSign = req.body.authSign;
    // var _id = '';
    // try {
    //     if(req.body.userID) {
    //         _id = new objectId(req.body.userID);
    //     }
    // }catch(ex){
    //     //如果异常，则返回
    //     result(res, {statusCode: 919, message: ex.message});
    //     return;
    // }
    // //需要在此处统一校验authSign，然后将用户信息放置在req.user中，后面可以取到使用
    // db.users.findOne({_id: _id}, function (err, doc) {
    //     if (err) {
    //         //handle error
    //         log.error('check authSign error: ' + err.message);
    //         result(res, {statusCode: 905, message: err.message});
    //     } else {
    //         if (doc) {
    //             if (doc.authSign == authSign) {
    //                 req.body.userType = doc.userType;
    //                 req.user = doc;
    //                 log.trace('check authSign success.');
    //                 next();
    //             } else {
    //                 log.trace('check authSign failed. token error. userID=' + req.body.userID + ', authSign=' + req.body.authSign);
    //                 result(res, {statusCode: 903});
    //             }
    //         } else {
    //             log.trace('check authSign failed. user id not exists.');
    //             result(res, {statusCode: 902})
    //         }
    //     }
    // });
}