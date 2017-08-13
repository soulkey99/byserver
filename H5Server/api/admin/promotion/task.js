/**
 * Created by MengLei on 2015/7/14.
 */

var db = require('./../../../../config').db;
var result = require('./../../../utils/result');
var Bagpipe = require('bagpipe');
var objectId = require('mongojs').ObjectId;
var cronJob = require('cron').CronJob;
var log = require('./../../../../utils/log').h5;
var bagPipe = new Bagpipe(10);

//维护用，每天凌晨三点钟扫描一次数据库，统计每个推广人员的推广效果，进行记录
exports.start = function(){
    //patterns: seconds 0-59, minutes 0-59, hours 0-23, day of month 1-31, months 0-11, day of week 0-6
    new cronJob('00 00 03 * * *', function(){
        //tick
        log.trace('admin maintenance task started, calc promotion statistics');
        getPromoters();
    }, function(){
        //complete
    }, true);
};

function getPromoters() {
    db.users.find({'userInfo.promoter': true}, {_id: 1}, function (err, doc) {
        if (err) {
            //handle error
            log.error('get promoters error: ' + err.message);
        } else {
            //get promoters success.
            log.trace('promoter statistic task, count: ' + doc.length);
            for (var i = 0; i < doc.length; i++) {
                //
                //console.log(doc[i].shareCode);
                bagPipe.push(calcStatistics, doc[i]._id.toString(), function (err2, doc2) {
                    if (err2) {
                        log.error('calc statstic error: ' + err.message);
                    } else {
                        //log.trace(doc2);
                    }
                });
            }
        }
    })
}

function calcStatistics(id, callback) {
    db.shareCode.findOne({userID: id}, function (err, doc) {
        if (err) {
            //handle error
            callback(err);
        } else {
            if (doc) {
                //存在邀请码，统计邀请码下的邀请数量
                var stat = {invited: 0, registered: 0};  //初始化数量为0，分别统计已邀请与已注册的用户数
                db.promotion.find({shareCode: doc.shareCode}, function (err2, doc2) {
                    if (err2) {
                        //handle error
                        callback(err2);
                    } else {
                        for (var i = 0; i < doc2.length; i++) {
                            stat.invited++;
                            if (doc2[i].registered) {
                                stat.registered++;
                            }
                        }
                        db.shareCode.update({userID: id}, {$set: {stat: stat}});
                        stat.id = id;
                        callback(null, stat);
                        log.trace('calc statistic success, user id: ' + id + ', share code: ' + doc.shareCode);
                    }
                });
            } else {
                log.error('no share code found, user id: ' + id);
                callback({message: 'no share code found.'});
            }
        }
    });
}