/**
 * Created by MengLei on 2015/11/3.
 */

var db = require('./../../../../config').db;
var config = require('./../../../../config');
var objectId = require('mongojs').ObjectId;
var result = require('./../../../utils/result');
var log = require('../../../../utils/log').h5;

//获取积分配置信息
module.exports = function(req, res){
    db.byConfig.findOne({_id: 'bonusConfig'}, function(err, doc){
        if(err){
            result(res, {statusCode: 905, message: err.message});
        }else{
            if(doc){
                result(res, {statusCode: 900, config: doc.config});
            }else{
                //没有记录
                result(res, {statusCode: 900, config: {}});
            }
        }
    });
};