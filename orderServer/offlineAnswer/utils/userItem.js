/**
 * Created by MengLei on 2015/9/11.
 */

var db = require('../../../config').db;
var config = require('../../../config');
var objectId = require('mongojs').ObjectId;
var eventproxy = new require('eventproxy');
var log = require('./../../../utils/log').order;

//param = {userID: ''}，获取用户的简要信息，昵称，头像，个性签名，如果没有该用户则返回null
module.exports = function(param, callback){
    var _id = '';
    try{
        _id = new objectId(param.userID);
    }catch(ex){
        callback(ex);
        return;
    }
    db.users.findOne({_id: _id}, {_id: 1, nick: 1, 'userInfo.avatar': 1}, function(err, doc){
        if(err){
            callback(err);
        }else{
            if(doc){
                callback(null, {userID: doc._id.toString(), nick: doc.nick, avatar: doc.userInfo.avatar});
            }else{
                callback(null, null);
            }
        }
    });
};