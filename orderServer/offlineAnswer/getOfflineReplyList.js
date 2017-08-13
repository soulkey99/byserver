/**
 * Created by MengLei on 2015/8/11.
 */

var db = require('../../config').db;
var config = require('../../config');
var objectId = require('mongojs').ObjectId;
var log = require('./../../utils/log').order;


//获取某条离线问答的答案的回复列表param={userID: '', answer_id: '', startPos: '', pageSize: ''}
module.exports = function(param, callback){
    //
    var query = {delete: false, answer_id: param.answer_id};

    var start = param.startPos ? param.startPos : 1;
    var count = param.pageSize ? param.pageSize : 10;
    db.offlineAnsReply.find(query).sort({createTime: 1}).skip((parseInt(start) - 1) < 0 ? 0 : (parseInt(start) - 1)).limit(parseInt(count)).toArray(function (err, doc) {
        if (err) {
            log.error('get offline reply list error: ' + err.message);
            return callback(err);
        } else {
            if (doc.length > 0) {
                //有内容，对内容进行加工
                var list = [];
                var author_idArray = [];
                var author_idObj = {};
                for (var i = 0; i < doc.length; i++) {
                    var item = {
                        answer_reply_id: doc[i]._id.toString(),
                        off_id: doc[i].off_id,
                        answer_id: doc[i].answer_id,
                        author_id: doc[i].author_id,
                        msg: doc[i].msg,
                        createTime: doc[i].createTime,
                        delete: doc[i].delete
                    };
                    if(doc[i].ups){
                        item.ups = doc[i].ups.length || 0;
                        item.up = doc[i].ups.indexOf(param.userID) >= 0 ;
                    }else{
                        item.ups = 0;
                        item.up = false;
                    }
                    if(doc[i].downs){
                        item.downs = doc[i].downs.length || 0;
                        item.down = doc[i].downs.indexOf(param.userID) >= 0 ;
                    }else{
                        item.downs = 0;
                        item.down = false;
                    }
                    if(doc[i].reply_id){
                        item.reply_id = doc[i].reply_id;
                    }
                    list.push(item);
                    author_idObj[item.author_id] = 1;
                }
                for (var id in author_idObj) {
                    author_idArray.push(new objectId(id));
                }
                db.users.find({_id: {$in: author_idArray}}, {nick: 1, 'userInfo.avatar': 1}, function (err2, doc2) {
                    if (err2) {
                        log.error('get offline reply list error: ' + err2.message);
                        return callback(err2);
                    } else {
                        for (var i = 0; i < list.length; i++) {
                            for (var j = 0; j < doc2.length; j++) {
                                if (list[i].author_id == doc2[j]._id.toString()) {
                                    list[i].author_nick = doc2[j].nick;
                                    list[i].author_avatar = doc2[j].userInfo.avatar || '';
                                }
                            }
                        }
                        callback(null, list);
                    }
                });
            } else {
                //直接回复空数组
                callback(null, []);
            }
        }
    });
};

