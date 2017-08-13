/**
 * Created by MengLei on 2015/9/1.
 */

var db = require('../../../config').db;
var config = require('../../../config');
var objectId = require('mongojs').ObjectId;
var log = require('./../../../utils/log').order;

//每生成一次自由答问题，都将tags放到数据库中保存，已有的tag使用数加一，没有的tag则插入
//param={tags: [], userID; '', createTime: 123}
module.exports = function(param){
    //
    if(!param.tags){
        //tags默认值，空数组
        param.tags = [];
    }
    if(!param.userID){
        //userID默认值，system
        param.userID = 'system';
    }
    if(!param.createTime){
        //createTime默认值，当前时间
        param.createTime = (new Date()).getTime();
    }
    log.trace('rank tags stat.');
    for(var i=0; i<param.tags.length; i++) {
        db.offlineTags.update({tag: param.tags[i]}, {
            $inc: {count: 1},
            $setOnInsert: {userID: param.userID, createTime: param.createTime}
        }, {upsert: true, multi: true}, function(err, doc){
            if(err){
                log.error('rank tags error: ' + err.message);
            }else{
                log.trace('rank tags success: ' + JSON.stringify(doc));
            }
        });
    }
};
//var param = {tags: ['测试1'], userID: 'test', createTime: 123};
//for(var i=0; i<param.tags.length; i++) {
//    db.offlineTags.update({tag: param.tags[i]}, {
//        $inc: {count: 1},
//        $setOnInsert: {userID: param.userID, createTime: param.createTime}
//    }, {upsert: true, multi: true});
//}

