/**
 * Created by MengLei on 2015/11/2.
 */

var db = require('./../../../../config').db;
var objectId = require('mongojs').ObjectId;
var result = require('./../../../utils/result');
var log = require('../../../../utils/log').h5;

//检查邮箱是否可用
module.exports = function(req, res){
    if(!req.body.email){
        result(res, {statusCode: 962, message: '邮箱不能为空！'});
        return;
    }
    db.users.findOne({email: req.body.email}, {_id: 1}, function(err, doc){
        if(err){
            result(res, {statusCode: 905, message: err.message});
        }else{
            if(doc){
                result(res, {statusCode: 963, message: '邮箱已经被注册！'});
            }else{
                result(res, {statusCode: 900});
            }
        }
    });
};
