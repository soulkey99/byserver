/**
 * Created by MengLei on 2015/9/10.
 */

var db = require('../../../config').db;
var objectId = require('mongojs').ObjectId;
var eventproxy = require('eventproxy');
var log = require('./../../../utils/log').order;


//通过off_id获取一个offlineTopic的详细内容，以及用户是否关注过、收藏过、回复过
//param={userID: '', off_id: '', operUserID: ''}
module.exports = function(param, callback){
    var off_id = new objectId();
    var userID = new objectId();
    var operUserID = new objectId();
    try{
        if(param.userID) {
            userID = new objectId(param.userID);
        }
        if(param.operUserID) {
            operUserID = new objectId(param.operUserID);
        }
        off_id = new objectId(param.off_id);
    }catch(ex){
        callback(ex);
    }
    db.offlineTopics.findOne({_id: off_id}, function(err, doc){
        if(err){
            log.trace('circle item, error: ' + err.message);
            callback(err);
        }else{
            //
            if(doc) {
                var item = {
                    off_id: doc._id.toString(),
                    author_id: doc.author_id,
                    grade: doc.grade,
                    subject: doc.subject,
                    tag: doc.tag,
                    topic: doc.topic || '',
                    q_msg: doc.q_msg || [],
                    createTime: doc.createTime,
                    updateTime: doc.updateTime,
                    lastReplyTime: doc.lastReplyTime,
                    lastReplyID: doc.lastReplyID,
                    recommend: doc.recommend || false,
                    collect: doc.collect || 0,
                    watch: doc.watch || 0,
                    visit: doc.visit || 0,
                    reply: doc.reply || 0,
                    collected: false,
                    watched: false,
                    replied: false,
                    delete: doc.delete || false,
                    bonus: doc.bonus || 0,
                    status: doc.status,
                    judgeTime: doc.judgeTime,
                    judgeAnswerID: doc.judgeAnswerID
                };
                //问题的空摘要，下面才会填入数据
                var q_summary = {
                    text: '',    //一条文字
                    image: '',      //一条图片
                    orientation: '',    //图片方向
                    voice: '',      //一条语音
                    time: 0        //语音时长
                };
                //生成一个问题摘要，在返回列表的时候，不需要返回问题全部内容，只要截取一条文字一张图片一段语音即可，如果没有的话，也可以不取
                for (var j = doc.q_msg.length - 1; j >= 0; j--) {
                    switch (doc.q_msg[j].type) {
                        case 'text':
                        {//文字消息
                            q_summary.text = doc.q_msg[j].msg;
                        }
                            break;
                        case 'voice':
                        {//语音消息
                            q_summary.voice = doc.q_msg[j].msg || '';
                            q_summary.time = doc.q_msg[j].time;
                        }
                            break;
                        case 'image':
                        {//图片消息
                            q_summary.image = doc.q_msg[j].msg || '';
                            q_summary.orientation = doc.q_msg[j].orientation;
                        }
                            break;
                        default :
                            break;
                    }
                }
                item.q_summary = q_summary;

                var ep1 = new eventproxy();
                ep1.all('author', 'user', 'watch', 'collect', 'reply', function(author, user, watch, collect, reply){
                    //
                    item.author_nick = author.nick || '';
                    item.author_avatar = author.avatar || '';
                    if(param.operUserID) {
                        item.userInfo = user;
                    }
                    item.watched = watch;
                    item.collected = collect;
                    item.replied = reply;
                    callback(null, item);
                });
                ep1.fail(function(err2){
                    callback(err2);
                });
                if(param.operUserID) {
                    //执行该操作的用户信息
                    db.users.findOne({_id: operUserID}, {_id: 1, nick: 1, 'userInfo.avatar': 1}, function (err2, doc2) {
                        if (err2) {
                            log.trace('offline topic item, error: ' + err.message);
                            ep1.emit('error', err2);
                        } else {
                            if (doc2) {
                                ep1.emit('user', {
                                    userID: doc2._id.toString(),
                                    nick: doc2.nick,
                                    avatar: doc2.userInfo.avatar || ''
                                });
                            } else {
                                ep1.emit('user', {userID: '', nick: '', avatar: ''});
                            }
                        }
                    });
                }else{
                    ep1.emit('user', null);
                }
                //topic作者的信息
                db.users.findOne({_id: new objectId(item.author_id)}, {_id: 1, nick: 1, 'userInfo.avatar': 1}, function(err2, doc2){
                    if(err2){
                        log.trace('circle item, error: ' + err.message);
                        ep1.emit('error', err2);
                    }else{
                        if(doc2) {
                            ep1.emit('author', {userID: doc2._id.toString(), nick: doc2.nick, avatar: doc2.userInfo.avatar || ''});
                        }else{
                            ep1.emit('author', {userID: '', nick: '', avatar: ''});
                        }
                    }
                });
                //"我"是否收藏
                db.topicCollect.findOne({userID: param.userID, off_id: param.off_id}, function(err2, doc2){
                    if(err2){
                        ep1.emit('error', err2);
                    }else{
                        ep1.emit('collect', !!doc2);
                    }
                });
                //"我"是否关注
                db.topicWatch.findOne({userID: param.userID, off_id: param.off_id}, function(err2, doc2){
                    if(err2){
                        ep1.emit('error', err2);
                    }else{
                        ep1.emit('watch', !!doc2);
                    }
                });
                //"我"是否回复
                db.offlineAnswers.find({author_id: param.userID, off_id: param.off_id}, function(err2, doc2){
                    if(err2){
                        ep1.emit('error', err2);
                    }else{
                        ep1.emit('reply', doc2.length > 0);
                    }
                });
            }else{
                log.error('topic id not exists.');
                callback(null, {});
            }
        }
    })
};