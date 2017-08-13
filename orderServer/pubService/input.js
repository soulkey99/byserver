/**
 * Created by MengLei on 2015/11/27.
 */

var db = require('./../../config').db;
var objectId = require('mongojs').ObjectId;
var log = require('./../../utils/log').order;

//用户在公众号界面输入文字param={userID: '用户id', pub_id: '公众号id', text: '文字内容'}
module.exports = function(param, callback) {
    //
    if (param.reply_id) {
        //如果过来的是reply_id，那么就是客户端直接获取，不需要将这个请求记录入数据库
        getReply(param, function (err2, doc2) {
            if (err2) {
                callback({statusCode: 905, message: err2.message});
            } else {
                if (doc2) {
                    db.pubChat.insert(doc2);
                    callback({statusCode: 900, reply: doc2});
                } else {
                    callback({statusCode: 900, reply: {}});
                }
            }
        });
    } else {
        var item = {
            userID: param.userID,
            pub_id: param.pub_id,
            type: 'pubChat',
            direction: 'u2p',
            text: param.text,
            time: Date.now()
        };
        db.pubChat.insert(item, function (err) {
            if (err) {
                callback({statusCode: 905, message: err.message});
            } else {
                //这里做一些工作，进行回复，并且要将回复的记录同样保存到数据库中
                getReply(param, function (err2, doc2) {
                    if (err2) {
                        callback({statusCode: 905, message: err2.message});
                    } else {
                        if (doc2) {
                            db.pubChat.insert(doc2);
                            callback({statusCode: 900, reply: doc2});
                        } else {
                            callback({statusCode: 900, reply: {}});
                        }
                    }
                });
            }
        });
    }
};

function getReply(param, callback) {
    var query = {userID: param.pub_id, text: param.text};
    var reply = {
        userID: param.userID,
        pub_id: param.pub_id,
        type: 'pubChat',
        direction: 'p2u',
        detail: {
            type: 'text',
            text: ''
        },
        time: Date.now()
    };
    if(param.reply_id){
        var _id = new objectId();
        try{
            _id = new objectId(param.reply_id);
        }catch (ex){
            //
        }
        query = {_id: _id};
        reply['type'] = 'menuClick';
    }else{
        reply['type'] = 'pubChat';
    }

    db.pubAutoReply.findOne(query, function (err, doc) {
        if (err) {
            calllback(err);
        } else {
            if (doc) {
                //有结果，进行处理
                reply.detail.type = doc.type;
                switch (doc.type){
                    case 'text':
                        reply.detail.text = doc.reply;
                        callback(null, reply);
                        break;
                    case 'pubTopic':
                        getPubTopic(doc.reply, function(err2, doc2) {
                            if (err2) {
                                callback(err2);
                            } else {
                                if (doc2) {
                                    reply.detail.pt_id = doc2.pt_id;
                                    reply.detail.title = doc2.title;
                                    reply.detail.summary = doc2.summary;
                                    reply.detail.cover = doc2.cover;
                                    callback(null, reply);
                                } else {
                                    callback();
                                }
                            }
                        });
                        break;
                    default:
                        callback();
                        break;
                }
            } else {
                //没有结果去做模糊匹配
                db.pubAutoReply.findOne({userID: param.pub_id, text: {$regex: param.text}}, function (err2, doc2) {
                    if (err2) {
                        callback(err2);
                    } else {
                        if (doc2) {
                            reply.detail.type = doc2.type;
                            //有结果，进行处理
                            switch (doc2.type){
                                case 'text':
                                    reply.detail.text = doc2.reply;
                                    callback(null, reply);
                                    break;
                                case 'pubTopic':
                                    getPubTopic(doc2.reply, function(err3, doc3) {
                                        if (err3) {
                                            callback(err3);
                                        } else {
                                            if (doc3) {
                                                reply.detail.pt_id = doc3.pt_id;
                                                reply.detail.title = doc3.title;
                                                reply.detail.summary = doc3.summary;
                                                reply.detail.cover = doc3.cover;
                                                callback(null, detail);
                                            } else {
                                                callback();
                                            }
                                        }
                                    });
                                    break;
                                default:
                                    callback();
                                    break;
                            }
                        } else {
                            //没有结果，返回空
                            callback();
                        }
                    }
                });
            }
        }
    });
}

function getPubTopic(id, callback){
    var _id = new objectId();
    try{
        _id = new objectId(id);
    }catch (ex){
        callback(ex);
    }
    db.pubTopics.findOne({_id: _id}, function(err2, doc2){
        if(err2){
            callback(err2);
        }else{
            if(doc2){
                callback(null, {pt_id: doc2._id.toString(), title: doc2.title, summary: doc2.summary, cover: doc2.cover})
            }else{
                callback();
            }
        }
    });
}
