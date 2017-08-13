/**
 * Created by MengLei on 2015/10/30.
 */
var db = require('../../../../config').db;
var config = require('../../../../config');
var objectId = require('mongojs').ObjectId;
var eventproxy = require('eventproxy');
var log = require('./../../../../utils/log').order;

//用户的各种操作，都在这里进行记录，param={userID: '', operType: '', operID: '', time: 123}，如果有传进来的时间，就取
//传进来的时间，否则就取当前时间
//operType：pubMsg公众号发布消息
module.exports = function(param){
    //
    if(param.operType) {//只有操作类型为非空的时候，才允许记录
        var curTime = (new Date()).getTime();
        db.offlineOperate.insert({
            userID: param.userID,
            operType: param.operType,
            operID: param.operID,
            time: param.time || curTime,
            display: true
        });
    }
};
