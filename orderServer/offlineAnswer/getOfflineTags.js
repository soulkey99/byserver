/**
 * Created by MengLei on 2015/9/1.
 */

var db = require('../../config').db;
var config = require('../../config');
var objectId = require('mongojs').ObjectId;
var log = require('./../../utils/log').order;

//获取离线问题的可用tags，param={startPos: '', pageSize: ''}
module.exports = function(param, callback){
    //
    var start = param.startPos ? param.startPos : 1;
    var count = param.pageSize ? param.pageSize : 10;

    db.offlineTags.find({}).sort({count: -1}).skip((parseInt(start) - 1) < 0 ? 0 : (parseInt(start) - 1)).limit(parseInt(count)).toArray(function(err, doc){
        if(err){
            log.error('get offline tags error: ' + err.message);
            return callback(err);
        }else{
            log.trace('get offline tags success.');
            var tags = [];
            for(var i=0; i<doc.length; i++){
                tags.push(doc[i].tag);
            }
            return callback(null, tags);
        }
    })
};

