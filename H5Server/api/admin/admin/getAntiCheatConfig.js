/**
 * Created by MengLei on 2015/10/22.
 */

var db = require('./../../../../config').db;
var config = require('./../../../../config');
var objectId = require('mongojs').ObjectId;
var result = require('./../../../utils/result');
var log = require('../../../../utils/log').h5;

//获取防作弊配置信息
module.exports = function(req, res){
    db.byConfig.findOne({_id: 'antiCheat'}, function(err, doc){
        if(err){
            result(res, {statusCode: 905, message: err.message});
        }else{
            if(doc){
                var config = {
                    time: doc.time,
                    duration: doc.duration,
                    finished: doc.finished,
                    canceled: doc.canceled,
                    abandon: doc.abandon,
                    sms: doc.sms,
                    bonus: doc.bonus
                };
                result(res, {statusCode: 900, config: config});
            }else{

                result(res, {statusCode: 900, config: {time: 10, finished: 10, canceled: 50, duration: 10, abandon: 1, sms: true, bonus: 100}});
            }
        }
    });
};
