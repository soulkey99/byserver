/**
 * Created by MengLei on 2015/7/23.
 */

var db = require('mongojs')('mongodb://127.0.0.1:27018/byserver', ['test', 'users', 'orders', 'shareCode', 'advertise', 'push', 'update', 'chargeOrders', 'admins', 'goods', 'stocks', 'h5orders', 'money', 'bonus','point', 'promotion', 'pushTokens', 'feedbacks', 'flowOrders', 'msgbox', 'byConfig', 'dbLog']);
var result = require('./../utils/result');
var Bagpipe = require('bagpipe');
var objectId = require('mongojs').ObjectId;
var log = require('./../utils/log').admin;
var bagPipe = new Bagpipe(10);
var fs = require('fs');


getPromoters('20150714', '20150722');

function getPromoters(start, end) {
    var str = '';
    db.users.find({'userInfo.promoter': true}, function (err, doc) {
        if (err) {
            //handle error
            log.error('get promoters error: ' + err.message);
        } else {
            //get promoters success.
            log.trace('promoter statistic task, count: ' + doc.length);
            for (var i = 0; i < doc.length; i++) {
                //
                //console.log(doc[i].shareCode);
                bagPipe.push(calcStatistics, {id: doc[i]._id.toString(), name: doc[i].userInfo.name, phone: doc[i].phone, start: new Date(start).getTime(), end: new Date(end).getTime()}, function (err2, doc2) {
                    if (err2) {
                        log.error('calc statstic error: ' + err.message);
                    } else {
                        console.log(doc2);
                        str += doc2.name + '\t' + doc2.phone + '\t' + doc2.invited + '\t' + doc2.registered + '\t' + start + '--' + end + '\r\n';
                        if(i >= doc.length){
                            fs.writeFile(start + '.txt', str);
                            console.log('finished.');
                        }
                    }
                });
            }
        }
    })
}


function calcStatistics(info, callback) {
    db.shareCode.findOne({userID: info.id}, function (err, doc) {
        if (err) {
            //handle error
            callback(err);
        } else {
            if (doc) {
                //存在邀请码，统计邀请码下的邀请数量
                var stat = {invited: 0, registered: 0};  //初始化数量为0，分别统计已邀请与已注册的用户数
                db.promotion.find({$and: [{shareCode: doc.shareCode}, {time: {$gt: info.start}}, {time: {$lt: info.end}}]}, function (err2, doc2) {
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
                        //db.shareCode.update({userID: id}, {$set: {stat: stat}});
                        stat.id = info.id;
                        stat.phone = info.phone;
                        stat.name = info.name;
                        callback(null, stat);
                        console.log('calc statistic success, user id: ' + info.id + ', share code: ' + doc.shareCode);
                    }
                });
            } else {
                log.error('no share code found, user id: ' + id);
                callback({message: 'not share code found.'});
            }
        }
    });
}
