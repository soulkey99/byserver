/**
 * Created by MengLei on 2015/3/22.
 */


var db = require('../../config').db;
var cronJob = require('cron').CronJob;
var BagPipe = require('bagpipe');
var eventproxy = require('eventproxy');
var objectId = require('mongojs').ObjectId;
var bagPipe = new BagPipe(10);
var log = require('./../../utils/log').order;

//维护用，每小时扫描一次数据库，如果发现有超过15分钟却仍然处于pending状态的订单，那么直接置为timeout
exports.start = function(){
    //patterns: seconds 0-59, minutes 0-59, hours 0-23, day of month 1-31, months 0-11, day of week 0-6
    new cronJob('00 00 * * * *', function(){
        //tick
        log.fatal('hourly order maintenance cron task started.');
        var curTime = new Date().getTime();
        db.orders.update({status: 'pending', create_time: {$lt: curTime - 900000}}, {$set: {status: 'timeout'}});
        //db.orders.update({status: 'received', start_time: {$lt: curTime - 900000}}, {$set: {status: 'finished'}});
    }, function(){
        //complete
    }, true);

    //每10分钟扫描一次数据库，检查反刷单
    new cronJob('00 5,15,25,35,45,55 * * * *', function(){
        //console.log('exec cron job' + new Date().toLocaleString());
    }, null, true);
};

//检查反刷单行为
function exec() {
    var t2 = new Date(), t1 = new Date(t2.getTime() - 600000);
    var query = {create_time: {$gte: t1.getTime(), $lte: t2.getTime()}};

    db.byConfig.findOne({_id: 'antiCheat'}, function (err, config) {
        if (err) {
            //
        } else {
            if (config) {
                db.orders.distinct('s_id', query, function (err, doc) {
                    if (err) {
                        console.log('async error: ' + err.message);
                    } else {
                        var ep = new eventproxy();
                        ep.after('tick', doc.length, function () {
                            console.log('everything ok.' + new Date(a).toLocaleString());
                        });
                        for (var i = 0; i < doc.length; i++) {
                            bagPipe.push(check, doc[i], config, function (err, doc) {
                                ep.emit('tick');
                                if (err) {
                                    console.log(err);
                                } else {
                                    if (doc.cheat) {
                                        addBlack(doc.s_id);
                                    } else {
                                        console.log('no cheat, s_id: ' + doc.s_id);
                                    }
                                }
                            });
                        }
                    }
                });
            }
        }
    });
}

function addBlack(userID) {
    //
    console.log('add black, userID: ' + userID);
    db.users.findOne({_id: new objectId(userID)}, {phone: 1, nick: 1}, function (err, doc) {
        if (err) {
            console.log(err);
        } else {
            console.log('phone: ' + doc.phone + ', nick: ' + doc.nick);
        }
    })
}

function check(s_id, config, callback) {
    var t2 = new Date(), t1 = new Date(t2.getTime() - 600000);
    db.orders.find({s_id: s_id, create_time: {$gte: t1.getTime(), $lte: t2.getTime()}}, {
        s_id: 1,
        t_id: 1,
        create_time: 1,
        start_time: 1,
        end_time: 1,
        status: 1
    }, function (err, doc) {
        if (err) {
            console.log('check error: ' + err.message);
        } else {
            var finished = 0;
            var canceled = 0;
            for (var i = 0; i < doc.length; i++) {
                if ((doc[i].status == 'finished') && ((doc[i].end_time - doc[i].start_time) / 1000 < config.duration)) {
                    finished++;
                }
                if (doc[i].status == 'canceled') {
                    canceled++;
                }
            }
            if (t1.getHours() >= 6 || t1.getHours() < 1) {
                //正常时间段，6点之后，凌晨1点之前
                callback(null, {
                    s_id: s_id,
                    cheat: ((finished >= config.finished) || (canceled >= config.canceled) || (doc.length >= config.total))
                });
            } else {
                //凌晨时间段，凌晨1点到6点
                callback(null, {s_id: s_id, cheat: ((doc.length >= config.finished) || (canceled >= config.canceled))});
            }
        }
    });
}