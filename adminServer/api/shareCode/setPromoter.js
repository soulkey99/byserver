/**
 * Created by MengLei on 2015/5/30.
 */

var db = require('./../../../config').db;
var result = require('./../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('./../../../utils/log').admin;

module.exports = function(req, res){
    //设置用户的推广员身份
    var _id = new objectId(req.body.u_id);

    db.users.update({_id: _id}, {$set: {'userInfo.promoter': req.body.promoter == 'true'}}, function(err, doc){
        if(err){
            //handle error
            log.error('set promoter error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        }else{
            log.trace('set promoter success');
            result(res, {statusCode: 900});
        }
    })
};