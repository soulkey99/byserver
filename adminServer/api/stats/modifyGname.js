/**
 * Created by MengLei on 2015/7/29.
 */


var db = require('./../../../config').db;
var result = require('./../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('./../../../utils/log').admin;

//
module.exports = function(req, res){
    //
    var gname = req.body.gname;
    var _id = new objectId(req.body.u_id);
    db.users.update({_id: _id}, {$set: {'userInfo.given_name': gname}}, function(err, doc){
        if(err){
            //handle error
            result(res, {statusCode: 905, message: err.message});
        }else{
            result(res, {statusCode: 900});
        }
    });
};
