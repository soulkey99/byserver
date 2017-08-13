/**
 * Created by MengLei on 2015/10/21.
 */

var db = require('./../../../../config').db;
var objectId = require('mongojs').ObjectId;
var result = require('./../../../utils/result');
var eventproxy = require('eventproxy');
var log = require('../../../../utils/log').h5;

//获取用户操作记录
module.exports = function(req, res){
    var start = parseInt(req.body.startPos|| 1) - 1;  //默认起始位置是1
    var count = parseInt(req.body.pageSize|| 10);  //默认返回每页10条
    var query = {};
    if(req.body.action){//用户动作
        query['action'] = req.body.action;
    }
    if(req.body.channel){//渠道
        query['content.channel'] = req.body.channel;
    }
    if(req.body.platform){//操作系统
        query['content.platform'] = req.body.platform;
    }
    if(req.body.userType){//用户类型（学生，教师）
        query['content.userType'] = req.body.userType;
    }
    if(req.body.client){//客户端版本
        query['content.client'] = req.body.client;
    }
    if(req.body.ip){    //根据ip地址查找
        query['content.ip'] = {$regex: req.body.ip};
    }
    if(req.body.imei){  //根据imei查找
        query['content.imei'] = req.body.imei;
    }
    if(req.body.mac){   //根据mac地址查找
        query['content.mac'] = req.body.mac;
    }
    if(req.body.startTime && req.body.endTime) {  //时间筛选
        query['t'] = {$gte: parseFloat(req.body.startTime), $lte: parseFloat(req.body.endTime)};
    }else if(req.body.startTime) {
        query['t'] = {$gte: parseFloat(req.body.startTime)};
    }else if(req.body.endTime) {
        query['t'] = {$gte: parseFloat(req.body.endTime)};
    }
    var ep = new eventproxy();
    ep.all('user', function(user){
        if(user){
            query['userID'] = user._id.toString();
        }
        db.dbLog.find(query).sort({t: -1}).skip(start < 0 ? 0 : start).limit(count).toArray(function(err, doc){
            if(err){
                result(res, {statusCode: 905, message: err.message});
            }else{
                if(doc.length > 0){
                    var dbObj = {};
                    for(var i=0; i<doc.length; i++){
                        dbObj[doc[i].userID] = 1;
                    }
                    var ids = [];
                    for(var j=0; j<Object.keys(dbObj).length; j++){
                        ids.push(new objectId(Object.keys(dbObj)[j]));
                    }
                    db.users.find({_id: {$in: ids}}, {_id: 1, nick: 1, phone: 1}, function(err2, doc2){
                        if(err2){
                            result(res, {statusCode: 905, message: err2.message});
                        }else{
                            var list = [];
                            for(var i=0; i<doc.length; i++){
                                var item = {
                                    u_id: doc[i].userID,
                                    action: doc[i].action,
                                    content: doc[i].content || {},
                                    t: doc[i].t
                                };
                                for(var j=0; j<doc2.length; j++){
                                    if(item.u_id == doc2[j]._id.toString()){
                                        item['nick'] = doc2[j].nick;
                                        item['phone'] = doc2[j].phone;
                                    }
                                }
                                list.push(item);
                            }
                            result(res, {statusCode: 900, list: list});
                        }
                    });
                }else{
                    result(res, {statusCode: 900, list: []});
                }
            }
        });
    });
    //如果传入值有手机号，那么获取对应的userID信息
    if(req.body.phonenum){
        db.users.findOne({phone: req.body.phonenum}, {_id: 1, nick: 1}, function(err, doc){
            if(err){
                ep.emit('error', err);
            }else{
                ep.emit('user', doc);
            }
        });
    }else{
        ep.emit('user', null);
    }
};