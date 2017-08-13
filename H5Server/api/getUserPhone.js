/**
 * Created by MengLei on 2015/7/22.
 */

var db = require('./../../config').db;
var config = require('./../../config');
var objectId = require('mongojs').ObjectId;
var result = require('./../utils/result');
var log = require('../../utils/log').h5;

//获取用户手机号码
module.exports = function(req, res){
    //
    if(req.user.phone) {
        result(res, {statusCode: 900, phone: req.user.phone});
    }else{
        result(res, {statusCode: 935, message: '用户手机号不存在！'});
    }
};