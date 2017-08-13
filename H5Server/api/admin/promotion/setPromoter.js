/**
 * Created by MengLei on 2015/9/21.
 */

var db = require('./../../../../config').db;
var result = require('./../../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('./../../../../utils/log').h5;

//设置、取消推广人员身份(如果传手机号，那么就按照手机号，否则按照u_id)
module.exports = function(req, res){
    var _id = new objectId();
    try{
        _id = new objectId(req.body.u_id);
    }catch(ex){
        result(res, {statusCode: 919, message: ex.message});
        return;
    }
    var query = {_id: _id};
    var setObj = {'userInfo.promoter': true};
    if(req.body.action){
        setObj = {'userInfo.promoter': !(req.body.action == 'unset')};
    }
    if(req.body.phonenum){
        query = {phone: req.body.phonenum};
    }
    db.users.findAndModify({query: query, update: {$set: setObj}, new: true}, function(err, doc){
        if(err){
            result(res, {statusCode: 905, message: err.message});
        }else{
            if(doc){
                //如果用户存在
                result(res, {statusCode: 900});
            }else{
                //用户不存在
                result(res, {statusCode: 902, message: 'user not exists.'});
            }
        }
    });
};