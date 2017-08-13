/**
 * Created by MengLei on 2015/12/7.
 */

var db = require('../../../../config').db;
var config = require('../../../../config');
var objectId = require('mongojs').ObjectId;
var result = require('../../../utils/result');
var log = require('../../../../utils/log').h5;

//修改商品的一些公共属性
module.exports = function(req, res){
    var _id = new objectId();
    try{
        _id = new objectId(req.body.goodId);
    }catch(ex){
        result(res, {statusCode: 919, message: ex.message});
        return;
    }
    var setObj = {};
    if(req.body.valid != undefined){
        setObj['valid'] = (req.body.valid == 'true');
    }
    if(req.body.validTime != undefined){
        setObj['validTime'] = parseFloat(req.body.validTime);
    }
    if(req.body.seq != undefined){
        setObj['seq'] = parseInt(req.body.seq);
    }
    if(req.body.hot != undefined){
        setObj['hot'] = (req.body.hot == 'true');
    }
    if(req.body.stock != undefined){
        setObj['stock'] = parseInt(req.body.stock);
    }
    if(req.body.city != undefined){
        if(req.body.city) {
            setObj['city'] = req.body.city.split(',');
        }else{
            setObj['city'] = [];
        }
    }
    db.goods.update({_id: _id}, {$set: setObj}, function(err){
        if(err){
            result(res, {statusCode: 905, message: err.message});
        }else{
            result(res, {statusCode: 900});
        }
    });
};
