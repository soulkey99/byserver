/**
 * Created by MengLei on 2015/9/8.
 */

var db = require('../../../config').db;
var config = require('../../../config');
var objectId = require('mongojs').ObjectId;
var eventproxy = require('eventproxy');
var hot = require("hot-ranking");
var log = require('./../../../utils/log').order;


//获取某个用户的社交信息，param={userID: '', u_id: ''}
//如果传u_id，则取那个u_id的，如果没传，则取那个userID的
module.exports = function (param, callback) {
    var _id = new objectId();
    if (param.u_id) {
        try {
            _id = new objectId(param.u_id);
        } catch (ex) {
            log.error('get user social info error: ' + ex.message);
            callback({statusCode: 919, message: ex.message});
            return;
        }
    } else {
        try {
            _id = new objectId(param.userID)
        } catch (ex) {
            return callback(ex);
        }
    }
    db.users.findOne({_id: _id}, {
        _id: 1,
        nick: 1,
        'userInfo.avatar': 1,
        intro: 1,
        userType: 1,
        'userInfo.teacher_info.verify_type': 1,
        'userInfo.verify_info.verify_type': 1
    }, function (err, doc) {
        if (err) {
            log.error('get user social info error: ' + err.message);
            callback({statusCode: 905, message: err.message});
        } else {
            if (doc) {
                var info = {
                    userID: doc._id.toString(),
                    nick: doc.nick,
                    avatar: doc.userInfo.avatar,
                    userType: doc.userType,
                    intro: doc.intro || '这个人很懒，什么也没留下...'
                };
                if (info.userType == 'public') {
                    //公众号
                    //对于公众号，返回认证状态
                    info.verify_type = doc.userInfo.verify_info.verify_type;
                    var ep2 = new eventproxy();
                    ep2.all('followers', 'followed', function (followers, followed) {
                        //
                        info.followers = followers;
                        info.followed = followed;
                        callback({statusCode: 900, info: info});
                    });
                    ep2.fail(function (err2) {
                        log.error('get user social info error: ' + err2.message);
                        callback({statusCode: 905, message: err2.message});
                    });
                    //被多少人关注
                    db.userFollowers.findOne({_id: _id}, function (err2, doc2) {
                        if (err2) {
                            ep2.emit('error', err2);
                        } else {
                            if (doc2) {
                                //
                                log.trace('get user followers count ' + doc2.list.length);
                                ep2.emit('followers', doc2.list.length);
                                ep2.emit('followed', (doc2.list.indexOf(param.userID) >= 0));
                            } else {
                                log.trace('get user followers count 0');
                                ep2.emit('followers', 0);
                                ep2.emit('followed', false);
                            }
                        }
                    });
                } else {
                    //普通用户
                    var ep = new eventproxy();
                    ep.all('following', 'followed', 'followers', 'ups', 'collect', function (following, followed, followers, ups, collect) {
                        //
                        info.following = following;
                        info.followers = followers;
                        info.followed = followed;
                        info.ups = ups;
                        info.collect = collect;
                        if (info.userType == 'teacher') {
                            //如果用户类型是教师，那么返回教室认证状态
                            info.verify_type = doc.userInfo.teacher_info.verify_type;
                        }
                        callback({statusCode: 900, info: info});
                    });
                    ep.fail(function (err2) {
                        log.error('get user social info error: ' + err2.message);
                        callback({statusCode: 905, message: err2.message});
                    });
                    //关注了多少人
                    db.userFollowing.findOne({_id: _id}, function (err2, doc2) {
                        if (err2) {
                            ep.emit('error', err2);
                        } else {
                            if (doc2) {
                                //
                                //log.trace('get user following count ' + doc2.list.length);
                                if (doc2.list) {
                                    log.trace('get user following count ' + doc2.list.length);
                                    ep.emit('following', doc2.list.length);
                                } else {
                                    ep.emit('following', 0);
                                }
                            } else {
                                log.trace('get user following count 0');
                                ep.emit('following', 0);
                            }
                        }
                    });
                    //被多少人关注
                    db.userFollowers.findOne({_id: _id}, function (err2, doc2) {
                        if (err2) {
                            ep.emit('error', err2);
                        } else {
                            if (doc2) {
                                //
                                log.trace('get user followers count ' + doc2.list.length);
                                ep.emit('followers', doc2.list.length);
                                ep.emit('followed', (doc2.list.indexOf(param.userID) >= 0));
                            } else {
                                log.trace('get user followers count 0');
                                ep.emit('followers', 0);
                                ep.emit('followed', false);
                            }
                        }
                    });
                    //回答了多少问题，获得了多少赞，答案被多少收藏
                    db.offlineAnswers.find({author_id: _id.toString()}, {ups: 1, collect: 1}, function (err2, doc2) {
                        if (err2) {
                            ep.emit('error', err2);
                        } else {
                            var ups = 0;
                            var collect = 0;
                            for (var i = 0; i < doc2.length; i++) {
                                ups += doc2[i].ups.length;
                                collect += doc2[i].collect;
                            }
                            ep.emit('ups', ups);
                            ep.emit('collect', collect);
                        }
                    });
                }
            } else {
                //用户不存在
                log.error('get user social info error, u_id not exists.');
                callback({statusCode: 902, message: 'user not exists.'});
            }
        }
    })
};

