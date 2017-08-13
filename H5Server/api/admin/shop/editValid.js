/**
 * Created by MengLei on 2015/10/26.
 */

var db = require('../../../../config').db;
var config = require('../../../../config');
var objectId = require('mongojs').ObjectId;
var result = require('../../../utils/result');
var log = require('../../../../utils/log').h5;

//修改商品上架属性
module.exports = function(req, res){
    var _id = new objectId();
    try{
        _id = new objectId(req.body.goodId);
    }catch(ex){
        result(res, {statusCode: 919, message: ex.message});
        return;
    }
    db.goods.update({_id: _id}, {$set: {valid: (req.body.valid == 'true')}}, function(err){
        if(err){
            result(res, {statusCode: 905, message: err.message});
        }else{
            result(res, {statusCode: 900});
        }
    });
};
