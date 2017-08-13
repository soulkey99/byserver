/**
 * Created by MengLei on 2015/9/11.
 */

var db = require('../../../config').db;
var objectId = require('mongojs').ObjectId;
var eventproxy = require('eventproxy');
var log = require('./../../../utils/log').order;

//获取答案的回复的一条item，param={userID: '', answer_reply_id: '', operUserID: ''}
module.exports = function(param, callback) {
    var _id = '';
    var userID = '';
    var operUserID = '';
    try {
        _id = new objectId(param.answer_reply_id);
        userID = new objectId(param.userID);
        operUserID = new objectId(param.operUserID);
    } catch (ex) {
        log.error('offline reply item error: ' + ex.message);
        callback(ex);
        return;
    }
    db.offlineAnsReply.findOne({_id: _id}, function (err, doc) {
        if (err) {
            //handle error
            log.error('get offline reply error: ' + err.message);
            callback(err);
        } else {
            if (doc) {
                //有内容，继续处理
                var item = {
                    answer_reply_id: doc._id.toString(),
                    off_id: doc.off_id,
                    answer_id: doc.answer_id,
                    author_id: doc.author_id,
                    msg: doc.msg,
                    createTime: doc.createTime,
                    delete: doc.delete
                };
                if (doc.ups) {
                    item.ups = doc.ups.length || 0;
                    item.up = doc.ups.indexOf(param.userID) >= 0;
                } else {
                    item.ups = 0;
                    item.up = false;
                }
                if (doc.downs) {
                    item.downs = doc.downs.length || 0;
                    item.down = doc.downs.indexOf(param.userID) >= 0;
                } else {
                    item.downs = 0;
                    item.down = false;
                }
                if (doc.reply_id) {
                    item.reply_id = doc.reply_id;
                }

                var ep = eventproxy.create('topic', 'answer', 'author', 'user', function (topic, answer, author, user) {
                    //
                    item.topic = topic;
                    item.summary = answer;
                    item.author_nick = author.nick;
                    item.author_avatar = author.avatar;
                    if(param.operUserID) {
                        item.userInfo = user;
                    }
                    callback(null, item);
                });
                ep.fail(function (err2) {
                    callback(err2);
                });
                //离线问题的信息
                db.offlineTopics.findOne({_id: new objectId(item.off_id)}, {topic: 1}, function (err2, doc2) {
                    if (err2) {
                        ep.emit('error', err2);
                    } else {
                        if(doc2) {
                            ep.emit('topic', doc2.topic || '');
                        }else{
                            ep.emit('topic', '');
                        }
                    }
                });
                //答案的信息
                db.offlineAnswers.findOne({_id: new objectId(item.answer_id)}, {msg: 1}, function (err2, doc2) {
                    if (err2) {
                        ep.emit('error', err2);
                    } else {
                        if (doc2) {
                            var summary = {
                                text: '',
                                voice: false,
                                image: false
                            };
                            //生成一个答案摘要，在返回某题的答案列表的时候，不需要返回每条答案全部内容，只要截取一条文字并返回是否有图片、语音即可
                            //返回的文字只要截取前70个字
                            for (var j = doc2.msg.length - 1; j >= 0; j--) {
                                switch (doc2.msg[j].type) {
                                    case 'text':
                                    {//文字消息
                                        summary.text = doc2.msg[j].msg;
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
                            ep.emit('answer', summary);
                        } else {
                            ep.emit('answer', {text: '', voice: false, image: false});
                        }
                    }
                });

                //答案的回复的作者信息
                db.users.findOne({_id: new objectId(item.author_id)}, {
                    _id: 1,
                    nick: 1,
                    'userInfo.avatar': 1
                }, function (err2, doc2) {
                    if (err2) {
                        ep.emit('error', err2);
                    } else {
                        if (doc) {
                            ep.emit('author', {userID: doc2._id.toString(), nick: doc2.nick, avatar: doc2.userInfo.avatar || ''});
                        } else {
                            ep.emit('author', {userID: '', nick: '', avatar: ''});
                        }
                    }
                });
                //用户的信息
                if(param.operUserID) {
                    db.users.findOne({_id: operUserID}, {_id: 1, nick: 1, 'userInfo.avatar': 1}, function (err2, doc2) {
                        if (err2) {
                            ep.emit('error', err2);
                        } else {
                            if (doc) {
                                ep.emit('user', {
                                    userID: doc2._id.toString(),
                                    nick: doc2.nick,
                                    avatar: doc2.userInfo.avatar || ''
                                });
                            } else {
                                ep.emit('user', {userID: '', nick: '', avatar: ''});
                            }
                        }
                    });
                }else{
                    ep.emit('user', null);
                }

            } else {
                //id不存在
                callback(null, {});
            }
        }
    });
};