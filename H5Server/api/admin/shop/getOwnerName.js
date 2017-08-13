/**
 * Created by MengLei on 2015/10/21.
 */

var db = require('../../../../config').db;
var config = require('../../../../config');
var objectId = require('mongojs').ObjectId;
var eventproxy = require('eventproxy');
var result = require('../../../utils/result');
var log = require('../../../../utils/log').h5;

//通过ownerid获取ownerName
module.exports = function(req, res){
    var _id = new objectId();
    if(req.body.ownerid){
        _id = new objectId(req.body.ownerid);
    }
    db.admins.findOne({_id: _id}, {nick: 1}, function(err, doc){
        if(err){
            //
            result(res, {statusCode: 905, message: err.message});
        }else{
            if(doc){
                result(res, {statusCode: 900, ownerName: doc.nick});
            }else{
                result(res, {statusCode: 902, message: '商家不存在！'});
            }
        }
    });
};
