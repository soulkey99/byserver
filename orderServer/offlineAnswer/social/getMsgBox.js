/**
 * Created by MengLei on 2015/9/22.
 */

var db = require('../../../config').db;
var config = require('../../../config');
var objectId = require('mongojs').ObjectId;
var proxy = require('../../../common/proxy');
var eventproxy = require('eventproxy');
var userItem = require('../utils/userItem');
var q_summary = require('../utils/q_summary');
var answerSummary = require('../utils/answerSummary');
var log = require('./../../../utils/log').order;

//获取消息param={userID: '', type: '', startPos: '', pageSize: '', userType: ''}，type是过滤消息类型
module.exports = function(param, callback) {
    //记录时间
    checkTime(param.userID);
    var start = parseInt(param.startPos || '1') - 1;
    var count = parseInt(param.pageSize || '10');
    var query = {to: param.userID, display: true};
    db.users.findOne({_id: new objectId(param.userID)}, {'userInfo.create_time': 1}, function (err4, doc4) {
        if (err4) {
            callback({statusCode: 905, message: err4.message});
        } else {
            var create_time = doc4.userInfo.create_time;
            if (param.type) {
                if (param.type == 'system') {
                    //获取系统消息时，只获取用户创建之后所发出的
                    query = {
                        $or: [{
                            to: param.userID,
                            type: 'system',
                            display: true
                        }, {type: ('broadcast' + (param.userType == 'teacher' ? '_t' : '_s')), display: true}, {type: 'broadcast', display: true}],
                        time: {$gte: create_time}
                    };
                    //console.log('get msg box query: ' + JSON.stringify(query));
                } else {
                    query.type = {$in: param.type.split(',')};
                }
            }

            proxy.Msgbox.getMsgByQuery(query, {sort: 'read -time', skip: (start < 0 ? 0 : start), limit: count}, function (err, doc) {
                if (err) {
                    log.error('get msg box error: ' + err.message);
                    callback({statusCode: 905, message: err.message});
                } else {
                    var ep = new eventproxy();
                    ep.after('item', doc.length, function (msglist) {
                        msglist.sort(function (a, b) {
                            return b.time - a.time;
                        });
                        callback({statusCode: 900, list: msglist});
                    });
                    ep.fail(function (err2) {
                        log.error('get msg box, event proxy fail, error: ' + err2.message);
                        callback({statusCode: 905, message: err2.message});
                    });
                    for (var i = 0; i < doc.length; i++) {
                        var item = doc[i].toObject({virtuals: true});
                        delete(item._id);
                        switch (item.type) {
                            case 'watchTopic'://关注离线问题
                            case 'unwatchTopic'://取消关注离线问题
                                topicItem(item, ep.done('item'));
                                break;
                            case 'answer'://回答离线问题
                            case 'collectAnswer'://收藏离线答案
                            case 'uncollectAnswer'://取消收藏离线答案
                            case 'upAnswer'://支持离线答案
                            case 'downAnswer'://反对离线答案
                            case 'cancelupAnswer'://取消支持离线答案
                            case 'canceldownAnswer'://取消反对离线答案
                                answerItem(item, ep.done('item'));
                                break;
                            case 'reply'://评论离线答案
                            case 'upReply'://支持离线回复
                            case 'downReply'://反对离线回复
                            case 'cancelupReply'://取消支持离线回复
                            case 'canceldownReply'://取消反对离线回复
                                replyItem(item, ep.done('item'));
                                break;
                            case 'follow'://关注了用户
                            case 'unfollow'://取消关注
                                followItem(item, ep.done('item'));
                                break;
                            case 'system':      //系统通知
                            case 'broadcast':   //广播通知
                            case 'broadcast_t': //教师端广播通知
                            case 'broadcast_s': //学生端广播通知
                                sysItem(item, param.userID, ep.done('item'));
                                break;
                        }
                    }

                    //每个item用到的callback函数，在这里定义
                    function itemCB(err2, doc2) {
                        if (err2) {
                            ep.emit('error', err2);
                        } else {
                            ep.emit('item', doc2);
                        }
                    }
                }
            });
        }
    });

};

//topic类型
function topicItem(param, callback){
    db.offlineTopics.findOne({_id: new objectId(param.detail.id)}, {topic: 1, q_msg: 1}, function(err, doc){
        if(err){
            callback(err);
        }else{
            if(doc) {
                userItem({userID: param.detail.u_id}, function(err2, doc2){
                    if(err2){
                        callback(err2);
                    }else{
                        param.detail.nick = doc2.nick;
                        param.detail.avatar = doc2.avatar;
                        param.detail.off_id = param.detail.id;
                        param.detail.topic = doc.topic;
                        param.detail.q_summary = q_summary(doc.q_msg);
                        delete(param.detail.id);
                        callback(null, param);
                    }
                });
            }else{
                callback(null, param);
            }
        }
    });
}

//answer类型
function answerItem(param, callback){
    var ep = new eventproxy();
    ep.all('answer', 'user', function(answer, user){
        answer.u_id = user.userID;
        answer.nick = user.nick;
        answer.avatar = user.avatar;
        answer.type = param.detail.type;
        param.detail = {};
        param.detail = answer;
        callback(null, param);
    });
    ep.fail(function(err, doc){
        callback(err);
    });

    db.offlineAnswers.findOne({_id: new objectId(param.detail.id)}, {off_id: 1, msg: 1}, function(err, doc){
        if(err){
            ep.emit('error', err);
        }else{
            if(doc) {
                db.offlineTopics.findOne({_id: new objectId(doc.off_id)}, {topic: 1, q_msg: 1}, function(err2, doc2){
                    if(err2){
                        ep.emit('error', err2);
                    }else{
                        if(doc2){
                            var item = {
                                off_id: doc.off_id,
                                answer_id: doc._id.toString(),
                                topic: doc2.topic,
                                q_summary: q_summary(doc2.q_msg),
                                summary: answerSummary(doc.msg)
                            };
                            ep.emit('answer', item);
                        }else{
                            ep.emit('answer', {});
                        }
                    }
                });
            }else{
                ep.emit('answer', {});
            }
        }
    });
    userItem({userID: param.detail.u_id}, function(err, doc){
        if(err){
            ep.fail(err);
        }else{
            ep.emit('user', doc);
        }
    });
}

//reply类型
function replyItem(param, callback){
    var ep = new eventproxy();
    ep.all('reply', 'user', function(reply, user){
        reply.u_id = user.userID;
        reply.nick = user.nick;
        reply.avatar = user.avatar;
        reply.type = param.detail.type;
        param.detail = reply;
        callback(null, param);
    });
    ep.fail(function(err){
        callback(err);
    });
    db.offlineAnsReply.findOne({_id: new objectId(param.detail.id)}, {_id: 1, off_id: 1, answer_id: 1, msg: 1}, function(err, doc){
        if(err){
            ep.emit('error', err);
        }else{
            if(doc){
                db.offlineAnswers.findOne({_id: new objectId(doc.answer_id)}, {msg: 1}, function(err2, doc2){
                    if(err2){
                        ep.emit('error', err2);
                    }else{
                        if(doc2){
                            db.offlineTopics.findOne({_id: new objectId(doc.off_id)}, {topic: 1, q_msg: 1}, function(err3, doc3){
                                if(err3){
                                    ep.emit('error', err3);
                                }else{
                                    if(doc3){
                                        var item = {
                                            off_id: doc.off_id,
                                            answer_id: doc.answer_id,
                                            answer_reply_id: doc._id.toString(),
                                            topic: doc3.topic,
                                            q_summary: q_summary(doc3.q_msg),
                                            summary: answerSummary(doc2.msg),
                                            msg: doc.msg
                                        };
                                        ep.emit('reply', item);
                                    }
                                }
                            });
                        }
                    }
                });
            }
        }
    });
    userItem({userID: param.detail.u_id}, function(err, doc){
        if(err){
            ep.emit('error', err);
        }else{
            ep.emit('user', doc);
        }
    });
}

//user类型
function followItem(param, callback){
    userItem({userID: param.detail.u_id}, function(err, doc){
        if(err){
            callback(err);
        }else{
            if(doc) {
                param.detail = {
                    u_id: doc.userID,
                    nick: doc.nick,
                    avatar: doc.avatar
                };
            }
            callback(null, param);
        }
    });
}

//系统通知类
function sysItem(param, userID, callback){
    if(param.type == 'system'){
        //system类消息是发给个人的，不用查状态
        callback(null, param);
    }else {
        //broadcast类消息是广播的，需要从另外的表查询状态
        proxy.MsgStatus.getSysMsgStatus(param.msgid, param.userID, function(err, doc){
            if(err){
                return callback(err);
            }
            param.read = doc;
            callback(null, param);
        });
    }
}

//记录上次获取收件箱列表动作的时间
function checkTime(userID){
    db.msgStatus.update({_id: new objectId(userID)}, {$set: {time: (new Date()).getTime()}}, {upsert: true})
}
