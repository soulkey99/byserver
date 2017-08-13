/**
 * Created by MengLei on 2015/9/14.
 */

var db = require('./../../../../config').db;
var config = require('./../../../../config');
var objectId = require('mongojs').ObjectId;
var result = require('./../../../utils/result');
var log = require('../../../../utils/log').h5;

//删除商户
module.exports = function(req, res){
    //
    var shopID = '';
    try{
        shopID = new objectId(req.body.shopID);
    }catch(ex){
        result(res, {statusCode: 919, message: ex.message});
        return;
    }
    var setObj = {delete: true};
    if(req.body.action == 'un') {
        setObj = {delete: false};
    }
    db.admins.update({_id: shopID}, {$set: setObj}, function(err, doc){
        if(err){
            result(res, {statusCode: 905, message: err.message});
        }else{
            result(res, {statusCode: 900});
        }
    });
};