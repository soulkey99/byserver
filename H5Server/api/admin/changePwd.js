/**
 * Created by MengLei on 2015/10/19.
 */
var db = require('./../../../config').db;
var result = require('./../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('./../../../utils/log').h5;

//用户修改自己的密码
module.exports = function(req, res){
    if(req.user.userPwd == req.body.old_pwd){
        //旧密码正确，可以修改
        db.admins.update({_id: req.user._id}, {$set: {userPwd: req.body.new_pwd}}, function(err){
            if(err){
                result(res, {statusCode: 905, message: err.message});
            }else{
                result(res, {statusCode: 900});
            }
        });
    }else{
        result(res, {statusCode: 923, message: '密码校验错误！'});
    }
};
