/**
 * Created by MengLei on 2015/9/9.
 */

var db = require('../../../config').db;
var objectId = require('mongojs').ObjectId;
var eventproxy = require('eventproxy');
var offlineTopicItem = require('../utils/offlineTopicItem');
var offlineAnsItem = require('../utils/offlineAnsItem');
var offlineReplyItem = require('../utils/offlineReplyItem');
var userItem = require('../utils/userItem');
var log = require('./../../../utils/log').order;

//param={userID: '', info: info}
//param.info: operType：topic发布离线问题，answer回答离线问题，editAnswer编辑离线回答，reply评论离线答案，upAnswer支持离线答案，downAnswer反对离线答案，
//cancelupAnswer取消支持离线答案，canceldownAnswer取消反对离线答案，upReply支持离线回复，downReply反对离线回复，cancelupReply取消支持离线回复，
//canceldownReply取消反对离线回复，watchTopic关注离线问题，unwatchTopic取消关注离线问题，collectTopic收藏离线问题，uncollectTopic取消收藏离线问题，
//collectAnswer收藏离线答案，uncollecteAnswer取消收藏离线答案，follow关注了用户，unfollow取消关注，
module.exports = function(param, callback){
    switch (param.info.operType){
        case 'topic'://发布离线问题
        case 'watchTopic'://关注离线问题
        case 'unwatchTopic'://取消关注离线问题
        case 'collectTopic'://收藏离线问题
        case 'uncollectTopic'://取消收藏离线问题
            topic({info: param.info, userID: param.userID}, callback);
            break;
        case 'answer'://回答离线问题
        case 'editAnswer'://编辑离线回答
        case 'collectAnswer'://收藏离线答案
        case 'uncollectAnswer'://取消收藏离线答案
        case 'upAnswer'://支持离线答案
        case 'downAnswer'://反对离线答案
        case 'cancelupAnswer'://取消支持离线答案
        case 'canceldownAnswer'://取消反对离线答案
            answer({info: param.info, userID: param.userID}, callback);
            break;
        case 'reply'://评论离线答案
        case 'upReply'://支持离线回复
        case 'downReply'://反对离线回复
        case 'cancelupReply'://取消支持离线回复
        case 'canceldownReply'://取消反对离线回复
            reply({info: param.info, userID: param.userID}, callback);
            break;
        case 'follow'://关注了用户
        case 'unfollow'://取消关注
            user(param.info, callback);
            break;
        case 'pubMsg':
            pubMsg({info: param.info, userID: param.userID}, callback);
            break;
        default :
            //defaultType(param.info, callback);
            break;
    }
};


function defaultType(param, callback){
    callback(null, {time: param.info.time || (new Date()).getTime()});
}


function topic(param, callback){
    offlineTopicItem({userID: param.userID, off_id: param.info.operID, operUserID: param.info.userID}, function(err, doc){
        if(err){
            callback(err);
        } else {
            doc.type = param.info.operType;
            doc.time = param.info.time;
            delete(doc.q_msg);
            callback(null, doc);
        }
    });
}

function answer(param, callback){
    offlineAnsItem({userID: param.userID, answer_id: param.info.operID, operUserID: param.info.userID}, function(err, doc){
        if(err){
            callback(err);
        } else {
            doc.type = param.info.operType;
            doc.time = param.info.time;
            delete(doc.msg);
            callback(null, doc);
        }
    });
}


function reply(param, callback){
    offlineReplyItem({userID: param.userID, answer_reply_id: param.info.operID, operUserID: param.info.userID}, function(err, doc){
        if(err){
            callback(err);
        } else {
            doc.type = param.info.operType;
            doc.time = param.info.time;
            delete(doc.msg);
            callback(null, doc);
        }
    });
}

function user(param, callback){
    //user1：用户，user2：被操作的用户
    var ep = eventproxy.create('user', 'user2', function(user, user2){
        //
        var item = {
            type: param.operType,
            userID: user.userID || '',
            nick: user.nick || '',
            avatar: user.avatar || '',
            userInfo: user2,
            time: param.time
        };
        callback(null, item);
    });
    ep.fail(function(err){
        callback(err);
    });
    userItem({userID: param.userID}, function(err,doc){
        if(err){
            ep.emit('error', err);
        }else{
            ep.emit('user', doc);
        }
    });
    userItem({userID: param.operID}, function(err,doc){
        if(err){
            ep.emit('error', err);
        }else{
            ep.emit('user2', doc);
        }
    });
}

//公众号发布的消息
function pubMsg(param, callback){
    var ep = new eventproxy();
    ep.all('user', 'author',  'msg', function(user, author, msg){
        var item = {
            type: param.info.operType,
            pm_id: param.info.operID,
            author_id: author.author_id,
            author_nick: author.author_nick,
            author_avatar: author.author_avatar,
            userInfo: user,
            time: param.info.time,
            msgInfo:msg
        };
        callback(null, item);
    });
    ep.fail(function(err){
        callback(err);
    });
    //用户信息
    db.users.findOne({_id: new objectId(param.info.userID)}, {nick: 1, 'userInfo.avatar': 1, intro: 1}, function(err, doc){
        if(err){
            ep.emit('error', err);
        }else{
            ep.emit('user', {userID: doc._id.toString(), nick: doc.nick, avatar: doc.userInfo.avatar, intro: doc.intro});
        }
    });
    //消息信息
    db.pubMsg.findOne({_id: new objectId(param.info.operID)}, function(err, doc){
        if(err) {
            ep.emit('error', err);
        } else {
            //作者信息
            db.users.findOne({_id: new objectId(doc.author_id)}, {nick: 1, 'userInfo.avatar': 1, status: 1}, function(err2, doc2){
                if(err2){
                    ep.emit('error', err2);
                }else{
                    ep.emit('author', {author_id: doc2._id.toString(), author_nick: doc2.nick, author_avatar: doc2.userInfo.avatar});
                }
            });

            var item = {
                pm_id: doc._id.toString(),
                type: doc.type
            };
            switch (doc.type){
                case 'single':
                {
                    item.pt_id = doc.pt_id;
                    pubSummary(item.pt_id, ep.done('msg', function (doc2) {
                        item.title = doc2.title;
                        item.summary = doc2.summary;
                        item.cover = doc2.cover;
                        return item;
                    }));
                }
                    break;
                //预留类型，将来会用到
                case 'multi':
                {
                    if(doc.list.length > 0){
                        item.pt_id = doc.list[0].pt_id;
                    }
                    pubSummary(item.pt_id, ep.done('msg', function(doc2){
                        item.title = doc2.title;
                        item.summary = doc2.summary;
                        item.cover = doc2.cover;
                        return item;
                    }));
                }
                    break;
                case 'link':
                {
                    item.text = doc.text;
                    item.link = doc.link;
                    item.cover = doc.cover;
                    ep.emit('msg', item);
                }
                    break;
                case 'text':
                {
                    item.text = doc.text;
                    ep.emit('msg', item);
                }
                    break;
                case 'richText':
                {
                    item.title = doc.title;
                    item.text = doc.text;
                    ep.emit('msg', item);
                }
                    break;
                default:
                {
                    ep.emit('msg', item);
                }
                    break;
            }
        }
    })
}

//公众号发布消息的几种类型
function pubSummary(pt_id, callback){
    db.pubTopics.findOne({_id: new objectId(pt_id)}, function(err, doc){
        if(err){
            callback(err);
        }else{
            var item = {
                pt_id: pt_id,
                title: '',
                summary: '',
                cover: ''
            };
            if(doc) {
                item.title = doc.title;
                item.summary = doc.summary;
                item.cover = doc.cover;
            }
            callback(null, item);
        }
    });
}
