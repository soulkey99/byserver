/**
 * Created by MengLei on 2015/10/28.
 */
var db = require('./../../config').db;
var objectId = require('mongojs').ObjectId;
var eventproxy = require('eventproxy');
var result = require('./../../utils/result');
var log = require('../../utils/log').h5;

//获取公众号发布的历史消息，param = {userID: '', u_id: '', startPos: '', pageSize: ''}
module.exports = function(param, callback) {
    var start = parseInt(param.startPos || 1) - 1;
    var count = parseInt(param.pageSize || 10);
    db.pubMsg.find({author_id: param.u_id, delete: false}).sort({createTime: -1}).skip(start < 0 ? 0 : start).limit(count).toArray(function (err, doc) {
        if (err) {
            log.error('get pub history error: ' + err.message);
            callback({statusCode: 905, message: err.message});
        } else {
            if (doc.length > 0) {
                //有内容
                var ep = new eventproxy();
                ep.after('item', doc.length, function (items) {
                    items.sort(function(a, b){return b.createTime - a.createTime});

                    //查作者信息
                    db.users.findOne({_id: new objectId(param.u_id)}, {nick: 1, 'userInfo.avatar': 1}, function(err, doc){
                        if(err){
                            callback({statusCode: 905, message: err.message});
                        }else{
                            if(doc){
                                for(var i=0; i<items.length; i++){
                                    items[i].author_nick = doc.nick;
                                    items[i].author_avatar = doc.userInfo.avatar;
                                }
                            }
                            callback({statusCode: 900, list: items});
                        }
                    });
                });
                ep.fail(function (err) {
                    log.error('get pub history error: ' + err.message);
                    callback({statusCode: 905, message: err.message});
                });
                for (var i = 0; i < doc.length; i++) {
                    switch (doc[i].type) {
                        case 'single':
                        {
                            //对于单条消息，直接取pt_id，查对应的消息摘要即可
                            single(doc[i], function(err2, doc2){
                                ep.emit('item', doc2);
                            });
                        }
                            break;
                        case 'multi':
                        {
                            //对于多条消息，消息中的每一条数据取pt_id，然后组装
                            multi(doc[i], function(err2, doc2){
                                ep.emit('item', doc2);
                            });
                        }
                            break;
                        case 'link':
                            //对于链接类型的消息
                            link(doc[i], function(err2, doc2){
                                ep.emit('item', doc2);
                            });
                            break;
                        case 'text':
                            //对于纯文本消息
                            text(doc[i], function(err2, doc2){
                                ep.emit('item', doc2);
                            });
                            break;
                        case 'richText':
                            //对于富文本消息
                            richText(doc[i], function(err2, doc2){
                                ep.emit('item', doc2);
                            });
                            break;
                        default:
                            ep.emit('item', doc[i]);
                            break;
                    }
                }
            } else {
                //如果是空列表，那么直接返回空
                callback({statusCode: 900, list: []});
            }
        }
    });
};


//对于single类型的公众号消息，组织数据
function single(pm, callback){
    var item = {pm_id: pm._id.toString(), createTime: pm.createTime, author_id: pm.author_id, delete: pm.delete, type: 'single', castType: pm.castType, pt_id: pm.pt_id, title: '', cover: '', summary: ''};
    db.pubTopics.findOne({_id: new objectId(pm.pt_id)}, {_id: 1, title: 1, cover: 1, summary: 1}, function (err, doc) {
        if (err) {
            callback(err);
        } else {
            if (doc) {
                //存在记录，取出摘要信息，组装数据
                item.title = doc.title;
                item.cover = doc.cover;
                item.summary = doc.summary;
            } else {
                //记录不存在，不去赋值
            }
            //返回结果
            callback(null, item);
        }
    });
}


//对于multi类型的公众号消息，组装数据
function multi(pm, callback) {
    var item = {
        pm_id: pm._id.toString(),
        createTime: pm.createTime,
        author_id: pm.author_id,
        delete: pm.delete,
        type: 'multi',
        castType: pm.castType,
        list: pm.list
    };
    var ep = new eventproxy();
    ep.after('item', pm.list.length, function (items) {
        for(var j=0; j<item.list.length; j++){
            for(var k=0; k<items.length; k++){
                if(items[k] && items[k].pt_id == item.list[j].pt_id){
                    item.list[j].title = items[k].title;
                    item.list[j].cover = items[k].cover;
                    item.list[j].summary = items[k].summary;
                }
            }
        }
        callback(null, item);
    });
    ep.fail(function (err) {
        callback(err);
    });
    for (var i = 0; i < pm.list.length; i++) {
        db.pubTopics.findOne({_id: new objectId(pm.list[i].pt_id)}, {_id: 1, title: 1, cover: 1, summary: 1}, function (err, doc) {
            if (err) {
                callback(err);
            } else {
                if (doc) {
                    //
                    ep.emit('item', {pt_id: doc._id.toString(), title: doc.title, cover: doc.cover, summary: doc.summary});
                } else {
                    //
                    ep.emit('item', null);
                }
            }
        });
    }
}

function link(pm, callback){
    var item = {
        pm_id: pm._id.toString(),
        createTime: pm.createTime,
        author_id: pm.author_id,
        delete: pm.delete,
        type: 'link',
        castType: pm.castType,
        title: pm.title,
        text: pm.text,
        cover: pm.cover,
        link: pm.link
    };
    callback(null, item);
}

function text(pm, callback){
    var item = {
        pm_id: pm._id.toString(),
        createTime: pm.createTime,
        author_id: pm.author_id,
        delete: pm.delete,
        type: 'text',
        castType: pm.castType,
        text: pm.text
    };
    callback(null, item);
}

function richText(pm, callback){
    var item = {
        pm_id: pm._id.toString(),
        createTime: pm.createTime,
        author_id: pm.author_id,
        delete: pm.delete,
        type: 'richText',
        castType: pm.castType,
        title: pm.title,
        text: pm.text
    };
    callback(null, item);
}