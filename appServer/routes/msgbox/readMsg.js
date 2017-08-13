/**
 * Created by MengLei on 2015/9/22.
 */

var db = require('../../../config').db;
var objectId = require('mongojs').ObjectId;
var result = require('../../utils/result');
var eventproxy = require('eventproxy');
var log = require('../../../utils/log').http;

//将收件箱某条记录标为已读
module.exports = function(req, res) {
    var _id = new objectId();
    var query = {to: req.body.userID, delete: false, read: false, type: {$ne: 'system'}};
    if (req.body.type == 'all') {
        var ep = new eventproxy();
        ep.all('person', 'sys', function () {
            result(res, {statusCode: 900});
        });
        ep.fail(function (err) {
            result(res, {statusCode: 905, message: err.message});
        });
        markAllPerson(req.body.userID, function (err) {
            if (err) {
                ep.emit('error', err);
            } else {
                ep.emit('person');
            }
        });
        markAllSys(req.body.userID, function (err) {
            if (err) {
                ep.emit('error', err);
            } else {
                ep.emit('sys');
            }
        });
    } else if (req.body.type == 'allperson') {
        markAllPerson(req.body.userID, function (err) {
            if (err) {
                result(res, {statusCode: 905, message: err.message});
            } else {
                result(res, {statusCode: 900});
            }
        });
    } else if (req.body.type == 'allsystem') {
        //标记全部系统消息
        markAllSys(req.body.userID, function (err) {
            if (err) {
                result(res, {statusCode: 905, message: err.message});
            } else {
                result(res, {statusCode: 900});
            }
        });
    } else {
        //标记单条消息
        markOne(req.body.userID, req.body.msgid, function (err, doc) {
            if (err) {
                result(res, {statusCode: 905, message: err.message});
            } else {
                if (doc) {
                    result(res, doc);
                } else {
                    result(res, {statusCode: 900});
                }
            }
        });
    }
};


function markAllPerson(userID, callback){
    //标记全部未读单播普通消息
    db.msgbox.update({to: userID, delete: false, read: false, type: {$ne: 'system'}}, {$set: {read: true}}, {upsert: false, multi: true}, function (err2) {
        if (err2) {
            log.error('read msg error: ' + err2.message);
            callback(err2);
        } else {
            log.trace('read msg success.');
            callback(null);
        }
    });
}

function markAllSys(userID, callback){
    //标记全部系统消息（单播与广播）
    var ep = new eventproxy();
    ep.all('broadcast', 'system', function(){
        callback(null);
    });
    ep.fail(function(err){
        callback(err);
    });
    db.users.findOne({_id: new objectId(userID)}, {'userInfo.create_time': 1, 'userType': 1}, function(err, doc){
        if(err){
            ep.emit('error', err);
        }else{
            db.msgbox.find({
                $or: [{type: ('broadcast' + (doc.userType == 'teacher' ? '_t' : '_s'))}, {type: 'broadcast'}],
                time: {$gte: doc.userInfo.create_time}
            }, {_id: 1}, function(err2, doc2){
                if(err2){
                    ep.emit('error', err2);
                }else{
                    for(var i=0; i<doc2.length; i++){
                        db.msgStatus.update({msgid: doc2[i]._id.toString(), userID: userID}, {$set: {read: true}}, {upsert: true});
                    }
                    ep.emit('broadcast', null);
                }
            });
            db.msgbox.update({to: userID, type: 'system', display: true, read: false}, {$set: {read: true}}, {multi: true}, function(err){
                if(err){
                    ep.emit('error', err);
                }else{
                    ep.emit('system', null);
                }
            });
        }
    });
}

function markOne(userID, msgid, callback){
    //标记单条消息
    var query = {};
    try {
        query = {_id: new objectId(msgid)};
    } catch (ex) {
        log.error('read msg error: ' + ex.message);
        callback(ex);
        return;
    }
    db.msgbox.findOne(query, function(err, doc){
        if(err){
            callback(err);
        }else{
            if(doc){
                if(doc.type == 'broadcast' || doc.type == 'broadcast_t' || doc.type == 'broadcast_s'){
                    //广播类消息，需要在另外的一个表中记录阅读状态
                    db.msgStatus.update({msgid: msgid, userID: userID}, {$set: {read: true}}, {upsert: true}, function(err2, doc2){
                        if(err2){
                            callback(err2);
                        }else{
                            callback(null);
                        }
                    });
                }else{
                    //普通单播消息与系统单播消息，直接在那条消息上面标记即可
                    db.msgbox.update(query, {$set: {read: true}}, function (err2) {
                        if (err2) {
                            log.error('read msg error: ' + err2.message);
                            callback(err2);
                        } else {
                            log.trace('read msg success.');
                            callback(null);
                        }
                    });
                }
            }else{
                callback(null, {statusCode: 951, message: 'msg id not exists.'});
            }
        }
    });
}