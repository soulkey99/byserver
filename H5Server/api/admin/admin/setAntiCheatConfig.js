/**
 * Created by MengLei on 2015/10/22.
 */

var db = require('./../../../../config').db;
var config = require('./../../../../config');
var objectId = require('mongojs').ObjectId;
var result = require('./../../../utils/result');
var log = require('../../../../utils/log').h5;

//设置防作弊配置信息
module.exports = function(req, res){
    //
    var setObj = {};
    if(req.body.time != undefined){
        setObj['time'] = parseInt(req.body.time);
    }
    if(req.body.finished != undefined){
        setObj['finished'] = parseInt(req.body.finished);
    }
    if(req.body.canceled != undefined){
        setObj['canceled'] = parseInt(req.body.canceled);
    }
    if(req.body.duration != undefined){
        setObj['duration'] = parseInt(req.body.duration);
    }
    if(req.body.abandon != undefined){
        setObj['abandon'] = parseInt(req.body.abandon);
    }
    if(req.body.sms != undefined){
        setObj['sms'] = (req.body.sms == 'true');
    }
    if(req.body.bonus != undefined){
        setObj['bonus'] = parseInt(req.body.bonus);
    }
    db.byConfig.update({_id: 'antiCheat'}, {$set: setObj}, function(err){
        if(err){
            result(res, {statusCode: 905, message: err.message});
        }else{
            result(res, {statusCode: 900})
        }
    });
};
