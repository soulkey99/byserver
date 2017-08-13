/**
 * Created by MengLei on 2015/10/20.
 */

var db = require('./../../../../config').db;
var result = require('./../../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('./../../../../utils/log').admin;

//获取用户举报列表
module.exports = function(req, res){
    var start = parseInt(req.body.startPos || 1) - 1;  //start从1开始
    var count = parseInt(req.body.pageSize || 10);  //默认页面大小为10

    var query = {handle: (req.body.handle == 'true')};
    if(req.body.reportType){
        query['reportType'] = req.body.reportType;
    }
    if(req.body.type){
        query['type'] = req.body.type;
    }

    db.report.find(query).sort({time: -1}).skip(start < 0 ? 0 : start).limit(count).toArray(function(err, doc){
        if(err){
            result(res, {statusCode: 905, message: err.message});
        }else{
            if(doc.length > 0){
                var ids = [];
                for(var i=0; i<doc.length; i++){
                    ids.push(new objectId(doc[i].userID));
                }
                db.users.find({_id: {$in: ids}}, {_id: 1, phone: 1, nick: 1, userType: 1}, function(err2, doc2){
                    if(err2){
                        result(res, {statusCode: 905, message: err2.message});
                    }else{
                        var list = [];
                        for(var i=0; i<doc.length; i++){
                            var item = {
                                r_id: doc[i]._id,
                                type: doc[i].type,
                                u_id: doc[i].userID,
                                reportID: doc[i].reportID,
                                reportType: doc[i].reportType,
                                reportDesc: doc[i].reportDesc,
                                time: doc[i].time,
                                handle: doc[i].handle,
                                handleType: doc[i].handleType,
                                handleDesc: doc[i].handleDesc,
                                handleID: doc[i].handleID,
                                handleTime: doc[i].handleTime
                            };
                            for(var j=0; j<doc2.length; j++){
                                if(doc[i].userID == doc2[j]._id.toString()) {
                                    item['nick'] = doc2[j].nick;
                                    item['phone'] = doc2[j].phone;
                                    item['userType'] = doc2[j].userType;
                                }
                            }
                            list.push(item);
                        }
                    }
                    result(res, {statusCode: 900, list: list});
                });
            }else{
                //如果没有数据，直接返回空数组
                result(res, {statusCode: 900, list: []});
            }
        }
    });
};