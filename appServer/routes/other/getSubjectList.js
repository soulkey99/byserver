/**
 * Created by MengLei on 2015/7/16.
 */

var db = require('./../../../config').db;
var config = require('./../../../config');
var result = require('../../utils/result');
var log = require('../../../utils/log').http;

//获取科目配置信息
module.exports = function(req, res){
    log.trace('get available subjects.');
    db.byConfig.findOne({_id: 'gradeConfig'}, function(err, doc){
        if(err){
            //handle error
            log.error('get subject config error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        }else{
            if(doc){
                log.trace('get subject config success');
                result(res, {statusCode: 900, config: doc.config});
            }else{
                log.error('subject config empty.');
                result(res, {statusCode: 905, message: 'subject config empty.'});
            }
        }
    });
};