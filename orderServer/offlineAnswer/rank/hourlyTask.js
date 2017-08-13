/**
 * Created by MengLei on 2015/8/25.
 */

var db = require('../../../config').db;
var config = require('../../../config');
var cronJob = require('cron').CronJob;
var objectId = require('mongojs').ObjectId;
var bagPipe = require('bagpipe');
var BagPipe = new bagPipe(20);
var hot = require("hot-ranking");
var log = require('./../../../utils/log').order;


//每小时执行任务，计算离线问答的各种权重
exports.start = function(){
    //patterns: seconds 0-59, minutes 0-59, hours 0-23, day of month 1-31, months 0-11, day of week 0-6
    new cronJob('00 15 * * * *', function(){
        //tick
        log.trace('offline order data task started.');
        db.offlineClick.find({}, function(err, doc){
            if(err){
                //handle error
            }else{
                //
                for(var i=0; i<doc.length; i++){
                    BagPipe.push(asyncCalcClick, doc[i], function(data){
                        //callback
                    });
                }
            }
        });
        db.offlineCollect.find({}, function(err, doc){
            if(err){
                //handle error
            }else{
                //
                for(var i=0; i<doc.length; i++){
                    BagPipe.push(asyncCalcCollect, doc[i], function(data){
                        //callback
                    });
                }
            }
        });
        db.offlineReply.find({}, function(err, doc){
            if(err){
                //handle error
            }else{
                //
                for(var i=0; i<doc.length; i++){
                    BagPipe.push(asyncCalcReply, doc[i], function(data){
                        //callback
                    });
                }
            }
        });
    }, function(){
        //complete
    }, true);
};

function asyncCalcClick(param, callback){
    //
    var total = 0;
    for(var item in param.data){
        if(param.data.hasOwnProperty(item)) {
            total += (hot(param.data[item], 0, new Date(item)));
        }
    }
    db.offlineTopics.update({_id: param._id}, {$set: {visitIndex: total}}, function(err, doc){
        callback(err, doc);
    });
}

function asyncCalcCollect(param, callback){
    //
    var total = 0;
    for(var item in param.data){
        if(param.data.hasOwnProperty(item)) {
            total += (hot(param.data[item], 0, new Date(item)));
        }
    }
    db.offlineTopics.update({_id: param._id}, {$set: {collectIndex: total}}, function(err, doc){
        callback(err, doc);
    });
}

function asyncCalcReply(param, callback){
    //
    var total = 0;
    for(var item in param.data){
        if(param.data.hasOwnProperty(item)) {
            total += (hot(param.data[item], 0, new Date(item)));
        }
    }
    db.offlineTopics.update({_id: param._id}, {$set: {replyIndex: total}}, function(err, doc){
        callback(err, doc);
    });
}


