/**
 * Created by MengLei on 2015/10/20.
 */

var db = require('./../../../../config').db;
var config = require('./../../../../config');
var objectId = require('mongojs').ObjectId;
var result = require('./../../../utils/result');
var log = require('../../../../utils/log').h5;

//获取商城banner列表
module.exports = function(req, res){
    db.byConfig.findOne({_id: 'storeBanner'}, function(err, doc){
        if(err){
            result(res, {statusCode: 905, message: err.message});
        }else{
            if(doc) {
                result(res, {statusCode: 900, banner: (doc.banner || [])});
            }else{
                result(res, {statusCode: 900, banner: []});
            }
        }
    });
};
