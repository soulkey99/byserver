/**
 * Created by MengLei on 2015/7/21.
 */


var result = require('./../utils/result');
var objectId = require('mongojs').ObjectId;
var db = require('../../config').db;
var log = require('./../../utils/log').h5;

//获取兑换物品详情
module.exports = function(req, res){
    var _id = '';
    try{
        _id  = new objectId(req.body.detailId);
    }catch(ex){
        log.error('get exchange detail, bonusID error: ' + ex.message);
        result(res, {statusCode: 905, message: ex.message});
        return;
    }
    db.bonusExchange.findOne({_id: _id}, function(err, doc){
        if(err){
            log.error('get exchange detail, bonusID error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        }else{
            if(doc){
                result(res, {statusCode: 900, detail: doc});
            }else{
                result(res, {statusCode: 905, message: 'detail not exists.'});
            }
        }
    })
};