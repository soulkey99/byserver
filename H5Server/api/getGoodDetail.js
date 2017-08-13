/**
 * Created by MengLei on 2015/4/21.
 */

var db = require('./../../config').db;
var config = require('./../../config');
var objectId = require('mongojs').ObjectId;
var result = require('./../utils/result');
var log = require('../../utils/log').h5;

module.exports = function(req, res){
    var _id = '';
    try {
        _id = new objectId(req.body.goodId);
    }catch(ex){
        log.error('good id format exception.');
        result(res, {statusCode: 905, message: ex.message});
        return;
    }
    db.goods.findOne({_id: _id}, function(err, doc){
        if(err){
            //handle error
            log.error('get good detail error.');
            result(res, {statusCode: 905, message: err.message});
        }else{
            if(doc){
                doc.goodId = doc._id.toString();
                delete(doc._id);
                //doc.stock = doc.stock.length;
                log.trace('get good detail success.');
                result(res, {statusCode: 900, goodDetail: doc});
            }else{
                log.error('good id not exists.');
                result(res, {statusCode: 905, message: 'good id not exists.'});
            }
        }
    })
};

