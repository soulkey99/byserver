/**
 * Created by MengLei on 2015/9/10.
 */

var db = require('../../../config').db;
var config = require('../../../config');
var objectId = require('mongojs').ObjectId;
var eventproxy = require('eventproxy');
var log = require('./../../../utils/log').order;

//param={answer_id: '', userID: '', operUserID: ''}，如果不传userID，那么查出来的应该是空信息，到时候删掉就可以了
module.exports = function(param, callback){
    var userID = new objectId();
    var answer_id = new objectId();
    var operUserID = new objectId();
    try{
        if(param.userID) {
            userID = new objectId(param.userID);
        }
        answer_id = new objectId(param.answer_id);
        if(param.operUserID) {
            operUserID = new objectId(param.operUserID);
        }
    }catch(ex){
        return callback(ex);
    }

    db.offlineAnswers.findOne({_id: answer_id}, function (err, doc) {
        if (err) {
            //handle error
            log.error('get offline answer error: ' + err.message);
            callback(err);
        } else {
            if (doc) {
                //
                var detail = {
                    answer_id: doc._id.toString(),
                    author_id: doc.author_id,
                    off_id: doc.off_id,
                    msg: doc.msg,
                    reply: doc.reply || 0,
                    collect: doc.collect || 0,
                    createTime: doc.createTime,
                    updateTime: doc.updateTime || doc.createTime, //没有更新时间的，取创建时间
                    delete: doc.delete
                };
                //ups：支持数，up：用户是否支持了这条内容
                if (doc.ups) {
                    detail.ups = doc.ups.length || 0;
                    detail.up = (doc.ups.indexOf(param.userID) >= 0);
                } else {
                    detail.ups = 0;
                    detail.up = false;
                }
                if (doc.downs) {
                    detail.downs = doc.downs.length || 0;
                    detail.down = (doc.downs.indexOf(param.userID) >= 0);
                } else {
                    detail.downs = 0;
                    detail.down = false;
                }
                var summary = {
                    text: '',
                    voice: false,
                    image: false
                };
                //生成一个答案摘要，在返回某题的答案列表的时候，不需要返回每条答案全部内容，只要截取一条文字并返回是否有图片、语音即可
                //返回的文字只要截取前70个字
                for (var j = doc.msg.length - 1; j >= 0; j--) {
                    switch (doc.msg[j].type) {
                        case 'text':
                        {//文字消息
                            summary.text = doc.msg[j].msg.substr(0, 70);
                        }
                            break;
                        case 'voice':
                        {//语音消息
                            summary.voice = true;
                        }
                            break;
                        case 'image':
                        {//图片消息
                            summary.image = true;
                        }
                            break;
                        default :
                            break;
                    }
                }
                detail.summary = summary;
                //最终处理，组合数据，返回结果
                var ep = eventproxy.create('topic', 'author', 'user', 'collect', 'reply', function(topic, author, user, collect, reply){
                    //
                    detail.topic = topic;
                    detail.author_nick = author.nick;
                    detail.author_avatar = author.avatar;
                    if(param.operUserID) {
                        detail.userInfo = user;
                    }
                    detail.collected = collect;
                    detail.replied = reply;
                    callback(null, detail);
                });
                //失败处理
                ep.fail(function(err2){
                    log.error('get offline answer detail eventproxy error: ' + err2.message);
                    callback(err2);
                });
                //答案的问题信息
                db.offlineTopics.findOne({_id: new objectId(detail.off_id)}, {topic: 1}, function(err2, doc2){
                    if(err2){
                        ep.emit('error', err2);
                    }else{
                        if(doc2) {
                            ep.emit('topic', doc2.topic);
                        }else{
                            ep.emit('topic', '')
                        }
                    }
                });
                if(param.operUserID) {
                    //执行操作的用户信息
                    db.users.findOne({_id: operUserID}, {_id: 1, nick: 1, 'userInfo.avatar': 1}, function (err2, doc2) {
                        if (err2) {
                            log.error('get offline answer list error: ' + err2.message);
                            ep.emit('error', err2);
                        } else {
                            if (doc2) {
                                ep.emit('user', {
                                    userID: doc2._id.toString(),
                                    nick: doc2.nick,
                                    avatar: doc2.userInfo.avatar || ''
                                });
                            } else {
                                ep.emit('user', {userID: '', nick: '', avatar: ''})
                            }
                        }
                    });
                }else{
                    ep.emit('user', null);
                }
                //答案的作者信息
                db.users.findOne({_id: new objectId(detail.author_id)}, {_id: 1, nick: 1, 'userInfo.avatar': 1}, function (err2, doc2) {
                    if (err2) {
                        log.error('get offline answer list error: ' + err2.message);
                        ep.emit('error', err2);
                    } else {
                        if (doc2) {
                            ep.emit('author', {nick: doc2.nick, avatar: doc2.userInfo.avatar || ''});
                        } else {
                            ep.emit('author', {nick: '', avatar: ''})
                        }
                    }
                });
                //是否收藏过
                db.answerCollect.findOne({userID: param.userID, answer_id: param.answer_id}, function(err2, doc2){
                    if (err2) {
                        log.error('get offline answer list error: ' + err2.message);
                        ep.emit('error', err2);
                    } else {
                        ep.emit('collect', !!doc2);
                    }
                });
                //是否回复过
                db.offlineAnsReply.find({author_id: param.userID, answer_id: param.answer_id}, function(err2, doc2){
                    if (err2) {
                        log.error('get offline answer list error: ' + err2.message);
                        ep.emit('error', err2);
                    } else {
                        ep.emit('reply', doc2.length > 0);
                    }
                });
            } else {
                log.error('answer_id: ' + param.answer_id + ' not exists.');
                callback(null, {});
            }
        }
    });
};
