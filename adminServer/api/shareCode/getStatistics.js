/**
 * Created by MengLei on 2015/5/22.
 */

var db = require('./../../../config').db;
var result = require('./../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('./../../../utils/log').admin;

module.exports = function(req, res){
    //获取推广员的数据统计
    var query = {userID: req.body.u_id};

    if(req.body.start_time && req.body.end_time){
        query.time = {$gte: req.body.start_time, $lte: req.body.end_time};
    }else if(req.body.start_time){
        query.time = {$gte: req.body.start_time};
    } else if(req.body.end_time){
        query.time = {$lte: req.body.end_time};
    }

    db.shareCode.findOne(query, function(err, doc){
        if(err){
            //handle error
        }else{
            if(doc) {
                var shareCode = doc.shareCode;
                //计算数据
                db.promotion.find({shareCode: shareCode}, function(err, doc){
                    if(err){
                        //handle error
                    }else{
                        var stat = {total: doc.length, registered: 0};
                        for(var i=0; i<doc.length; i++){
                            if(doc[i].registered){
                                stat.registered ++;
                            }
                        }
                        stat.unRegistered = stat.total - stat.registered;
                        result(res, {statusCode: 900, stat: stat});
                    }
                })
            }else{
                log.error('user do not have share code.');
                result(res, {statusCode: 905, message: 'user do not have share code.'});
            }
        }
    });
};