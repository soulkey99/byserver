/**
 * Created by MengLei on 2015/11/6.
 */

var objectId = require('mongojs').ObjectId;
var eventproxy = require('eventproxy');
var db = require('./../../../../../config').db;

module.exports = function(pm, callback){
//对于single类型的公众号消息，组织数据
    switch(pm.type){
        case 'single':
            single(pm, function(err, doc){
                callback(err, doc);
            });
            break;
        case 'multi':
            multi(pm, function(err, doc){
                callback(err, doc);
            });
            break;
        case 'text':
            text(pm, function(err, doc){
                callback(err, doc);
            });
            break;
        case 'link':
            link(pm, function(err, doc){
                callback(err, doc);
            });
            break;
        case 'richText':
            richText(pm, function(err, doc){
                callback(err, doc);
            });
            break;
        default:
            callback(null, pm);
            break;
    }
};

function single(pm, callback)
{
    var item = {
        pm_id: pm._id.toString(),
        createTime: pm.createTime,
        author_id: pm.author_id,
        delete: pm.delete,
        type: 'single',
        castType: pm.castType,
        pt_id: pm.pt_id,
        title: '',
        cover: '',
        summary: ''
    };
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
        for (var j = 0; j < item.list.length; j++) {
            for (var k = 0; k < items.length; k++) {
                if (items[k] && items[k].pt_id == item.list[j].pt_id) {
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
        db.pubTopics.findOne({_id: new objectId(pm.list[i].pt_id)}, {
            _id: 1,
            title: 1,
            cover: 1,
            summary: 1
        }, function (err, doc) {
            if (err) {
                callback(err);
            } else {
                if (doc) {
                    //
                    ep.emit('item', {
                        pt_id: doc._id.toString(),
                        title: doc.title,
                        cover: doc.cover,
                        summary: doc.summary
                    });
                } else {
                    //
                    ep.emit('item', null);
                }
            }
        });
    }
}

//link超链接类型
function link(pm, callback) {
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

//text纯文本类型
function text(pm, callback) {
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

//富文本类型
function richText(pm, callback) {
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
