/**
 * Created by MengLei on 2015/10/26.
 */

var db = require('../../../config').db;
var result = require('../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('../../../utils/log').http;

//随机获取25个教师头像
module.exports = function(req, res){
    db.users.find({'userInfo.avatar': {$nin: ['', null]}, userType: 'teacher'}, {'userInfo.avatar': 1}, function(err, doc){
        if(err){
            log.error('get avatar error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        }else{
            var list = [];
            for(var i=0; i<25; i++){    //取25个头像
                var rand = Math.floor(Math.random() * doc.length);
                list.push(doc[rand].userInfo.avatar);
            }
            result(res, {statusCode: 900, list: list});
        }
    });
};
