/**
 * Created by MengLei on 2015/9/14.
 */

var db = require('./../../../config').db;
var result = require('./../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('./../../../utils/log').admin;

//删帖、取消删帖
module.exports = function(req, res){
    var _id = new objectId();
    try{
        _id = new objectId(req.body.off_id);
    }catch(ex){
        result({statusCode: 919, message: ex.message});
        return;
    }
    db.offlineTopics.findOne({_id: _id}, {_id: 1}, function(err, doc){
        if(err){
            result({statusCode: 905, message: err.message});
        }else{
            if(doc){
                //
                if(req.body.action == 'un'){
                    db.offlineTopics.update({_id: _id}, {$set: {delete: false}});
                }else {
                    db.offlineTopics.update({_id: _id}, {$set: {delete: true}});
                }
                result(res, {statusCode: 900});
            }else{
                result({statusCode: 914, message: 'off_id not exists.'});
            }
        }
    });
};