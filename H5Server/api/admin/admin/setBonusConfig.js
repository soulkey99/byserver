/**
 * Created by MengLei on 2015/11/3.
 */

var db = require('./../../../../config').db;
var config = require('./../../../../config');
var objectId = require('mongojs').ObjectId;
var result = require('./../../../utils/result');
var log = require('../../../../utils/log').h5;

//设置积分配置信息
module.exports = function(req, res){
    //
    var setObj = {};
    if(req.body.newReg != undefined){
        setObj['config.newReg'] = parseInt(req.body.newReg);
    }
    if(req.body.genOrder != undefined){
        setObj['config.genOrder'] = parseInt(req.body.genOrder);
    }
    if(req.body.grabOrder != undefined){
        setObj['config.grabOrder'] = parseInt(req.body.grabOrder);
    }
    if(req.body.fillProfile != undefined){
        setObj['config.fillProfile'] = parseInt(req.body.fillProfile);
    }
    if(req.body.inviteUser != undefined){
        setObj['config.inviteUser'] = parseInt(req.body.inviteUser);
    }
    db.byConfig.update({_id: 'bonusConfig'}, {$set: setObj}, function(err){
        if(err){
            result(res, {statusCode: 905, message: err.message});
        }else{
            result(res, {statusCode: 900})
        }
    });
};
