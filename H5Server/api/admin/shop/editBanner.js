/**
 * Created by MengLei on 2015/10/20.
 */

var db = require('./../../../../config').db;
var config = require('./../../../../config');
var objectId = require('mongojs').ObjectId;
var result = require('./../../../utils/result');
var log = require('../../../../utils/log').h5;

//编辑商城banner列表
module.exports = function(req, res){
    var banner = [];
    if(req.body.banner) {
        try {
            banner = JSON.parse(req.body.banner);
        }catch(ex){
            result(res, {statusCode: 942, message: ex.message});
            return;
        }
    }
    db.byConfig.update({_id: 'storeBanner'}, {$set: {banner: banner}}, function(err){
        if(err){
            result(res, {statusCode: 905, message: err.message});
        }else{
            result(res, {statusCode: 900});
        }
    });
};
