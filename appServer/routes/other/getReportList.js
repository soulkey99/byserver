/**
 * Created by MengLei on 2015/9/16.
 */

var db = require('../../../config').db;
var result = require('../../utils/result');
var objectId = require('mongojs').ObjectId;
var eventproxy = require('eventproxy');
var log = require('../../../utils/log').http;

//获取我的举报列表
module.exports = function(req, res){
    var start = parseInt(req.body.startPos ? req.body.startPos : 1);  //start从1开始
    var count = parseInt(req.body.pageSize ? req.body.pageSize : 5);  //默认页面大小为5
    var query = {userID: req.body.userID};
    if(req.body.type){
        query.type = {$in: req.body.type.split(',')};
    }
    db.report.find(query).sort({time: -1}).skip((start-1) < 0 ? 0 : (start-1)).limit(count).toArray(function(err, doc){
        if(err){
            log.error('get my report list error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        }else{
            var list = [];
            for(var i=0; i<doc.length; i++){
                list.push({
                    type: doc[i].type,
                    reportID: doc[i].reportID,
                    reportType: doc[i].reportType,
                    reportDesc: doc[i].reportDesc,
                    time: doc[i].time,
                    handle: doc[i].handle,
                    handleDesc: doc[i].handleDesc
                });
            }
        }
    });
};


function reportInfo(list, callback){
    var ep = new eventproxy();
    ep.after('info', list.length, function(infoList){
        //
    });
    ep.fail(function(err){
        log.error('report info error: ' + err.message);
        callback(err);
    });
    for(var i=0; i<list.length; i++){
        switch (list[i].type){
            case 'order':
                db.orders.findOne({_id: new objectId(list[i].reportID)}, {_id: 1, grade: 1, subject: 1}, function(err, doc){
                    if(err){
                        ep.emit('error', err);
                    }else{
                        ep.emit('info', doc);
                    }
                });
                break;
            case 'offlineTopic':
                db.offlineTopics.findOne({_id: new objectId(list[i].reportID)}, {_id: 1, topic: 1}, function(err, doc){
                    if(err){
                        ep.emit('error', err);
                    }else{
                        if(doc){
                            ep.emit('info', {off_id: doc._id.toString(), topic: doc.topic});
                        }else{
                            ep.emit('info', null);
                        }
                    }
                });
                break;
            case 'offlineAnswer':
                db.offlineAnswers.findOne({_id: new objectId(list[i].reportID)}, {_id: 1, off_id: 1}, function(err, doc){
                    if(err){
                        ep.emit('error', err);
                    }else{
                        if(doc) {
                            db.offlineTopics.findOne({_id: new objectId(doc.off_id)}, {_id: 1, topic: 1, msg: 1}, function(err2, doc2){
                                if(err){
                                    ep.emit('error', err2);
                                }else{
                                    if(doc2) {
                                        ep.emit('info', {answer_id: doc._id.toString(), off_id: doc2._id.toString(), topic: doc2.topic});
                                    }else{
                                        ep.emit('info', null);
                                    }
                                }
                            })
                        }else{
                            ep.emit('info', null);
                        }
                    }
                });
                break;
            case '':
                break;
            default :
                break;
        }
    }
}
