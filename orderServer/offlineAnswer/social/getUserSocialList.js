/**
 * Created by MengLei on 2015/9/6.
 */

var db = require('../../../config').db;
var config = require('../../../config');
var objectId = require('mongojs').ObjectId;
var hot = require("hot-ranking");
var log = require('./../../../utils/log').order;

//获取某个用户的社交关系，param={userID: '', u_id: '', type: 'following/followers',startPos: '', pageSize: '', getType: ''}
//如果传u_id的话，就取那个u_id的，如果没传，则取userID的
module.exports = function(param, callback){
    var _id = new objectId();
    try{
        if(param.u_id) {
            _id = new objectId(param.u_id);
        }else if(param.userID){
            _id = new objectId(param.userID);
        }
    } catch(ex) {
        log.error('get user social list error.');
        callback({statusCode: 919, message: ex.message});
        return;
    }
    var start = parseInt(param.startPos || 1);
    if(start > 1){
        callback({statusCode: 900, list: []});
        return;
    }
    var cursor = db.userFollowing;

    if (param.type == 'following' || param.type == 'public') {
        cursor = db.userFollowing;
    } else if (param.type == 'followers') {
        cursor = db.userFollowers;
    }
    cursor.findOne({_id: _id}, function(err, doc){
        if(err){
            log.error('get my social error: ' + err.message);
            callback({statusCode: 905, message: err.message});
        }else{
            if(doc) {
                //有记录，组织数据
                var ids = [];
                if (param.type == 'public') {
                    if(!doc.pubList){
                        //如果没有，那么赋给一个空list
                        doc.pubList = [];
                    }
                    //只有在获取关注的人的时候，才可以获取关注的公众号
                    for (var i = 0; i < doc.pubList.length; i++) {
                        try {
                            ids.push(new objectId(doc.pubList[i]));
                        } catch (ex) {
                            log.error('get my social ids exception: ' + ex.message);
                        }
                    }
                } else {
                    if(!doc.list){
                        //如果没有，那么赋给一个空list
                        doc.list = [];
                    }
                    for (var j = 0; j < doc.list.length; j++) {
                        try {
                            ids.push(new objectId(doc.list[j]));
                        } catch (ex) {
                            log.error('get my social ids exception: ' + ex.message);
                        }
                    }
                }
                db.users.find({_id: {$in: ids}}, {
                    _id: 1,
                    nick: 1,
                    'userInfo.avatar': 1,
                    intro: 1,
                    userType: 1,
                    'userInfo.teacher_info.verify_type': 1,
                    'userInfo.verify_info.verify_type': 1
                }, function (err2, doc2) {
                    if (err2) {
                        log.error('get my social error: ' + err2.message);
                        callback({statusCode: 905, message: err2.message});
                    } else {
                        var list = [];
                        for (var i = 0; i < doc2.length; i++) {
                            var item = {
                                userID: doc2[i]._id.toString(),
                                nick: doc2[i].nick,
                                intro: doc2[i].intro,
                                avatar: doc2[i].userInfo.avatar || '',
                                userType: doc2[i].userType,
                                followed: true
                            };
                            if (item.userType == 'teacher') {
                                item.verify_type = doc2[i].userInfo.teacher_info.verify_type;
                            } else if (item.userType == 'public') {
                                item.verify_type = doc2[i].userInfo.verify_info.verify_type;
                            }
                            list.push(item);
                        }
                        if (param.type == 'followers') {
                            //对于关注我的人列表，需要对每一个用户进行判断，我是否关注了ta
                            var userID = new objectId();
                            if(param.userID){
                                try{
                                    userID = new objectId(param.userID);
                                }catch (ex){
                                    //
                                }
                            }
                            db.userFollowing.findOne({_id: userID}, function (err3, doc3) {
                                if (err3) {
                                    callback({statusCode: 905, message: err3.message});
                                } else {
                                    var followList = [];
                                    if (doc3 && doc3.list) {
                                        followList = doc3.list;
                                    }
                                    for (var i = 0; i < list.length; i++) {
                                        list[i].followed = (followList.indexOf(list[i].userID) >= 0);
                                    }
                                    callback({statusCode: 900, list: list});
                                }
                            });
                        } else {
                            //对于我关注的人的列表，直接返回结果即可
                            callback({statusCode: 900, list: list});
                        }
                    }
                });
            } else {
                //没记录，返回空数组
                log.trace('get my social empty.');
                callback({statusCode: 900, list: []});
            }
        }
    });
};
