/**
 * Created by MengLei on 2015/7/20.
 */

var config = require('../../../config');
var db = require('../../../config').db;
var result = require('../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('../../../utils/log').http;

module.exports = function(req, res){
    //
    var _id = '';
    try{
        _id = new objectId(req.body.bonusID);
    }catch(ex){
        log.error('get bonus detail error, bonus id: ' + req.body.bonusID + ' error: ' + ex.message);
        result(res, {statusCode: 905, message: ex.message});
        return;
    }
    db.bonus.findOne({_id: _id}, function(err, doc){
        if(err){
            //handle error
            log.error('get bonus detail error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        }else{
            if(doc){
                //积分记录存在
                doc.bonusID = doc._id.toString();
                delete(doc._id);
                result(res, {statusCode: 900, bonusDetail: doc});
            }else{
                //积分记录不存在
                log.error('get bonus detail error, bonus id: ' + req.body.bonusID + ' not exists.');
                result({statusCode: 905, message: 'bonus id not exists.'});
            }
        }
    });
};