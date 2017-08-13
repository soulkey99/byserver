/**
 * Created by MengLei on 2015/8/31.
 */

var db = require('../../config').db;
var config = require('../../config');
var objectId = require('mongojs').ObjectId;
var log = require('./../../utils/log').order;
var offlineList = require('./utils/offlineList');

//获取我提出、回答的离线问答，param={userID: '', u_id: '', type: 'ask/reply', startPos: '', pageSize: '', tab: 'time/collect/watch/reply'}
//如果传u_id，则取u_id的，否则获取我的
module.exports = function (param, callback) {
    //首先取u_id，如果没有，再取userID
    var author_id = param.u_id || param.userID;

    var start = param.startPos ? param.startPos : 1;
    var count = param.pageSize ? param.pageSize : 10;
    var sort = {updateTime: -1};    //默认时间倒序排列
    switch (param.tab) {
        case 'collect':
            sort = {collect: -1};
            break;
        case 'watch':
            sort = {watch: -1};
            break;
        case 'reply':
            sort = {reply: -1};
            break;
        default :
            break;
    }

    //默认获取我提出的问题，只有当传type=reply的时候，才获取我的回答的问题
    if (param.type == 'reply') {
        db.offlineAnswers.distinct('off_id', {author_id: author_id}, function (err, doc) {
            if (err) {
                log.error('get my reply offline orders error: ' + err.message);
                return callback(err);
            } else {
                //
                var idArray = [];
                for (var i = 0; i < doc.length; i++) {
                    try {
                        idArray.push(new objectId(doc[i]));
                    } catch (ex) {
                        log.error('get my reply offline orders, off_id exception: ' + ex.message);
                    }
                }
                //以下循环是将去重之后的off_id倒序分段取出时使用的，现在是取
                //for (var j = Math.max(-1, doc.length - start); j > Math.max(-1, doc.length - start - count); j--) {
                //    try{
                //        idArray.push(new objectId(doc[j]));
                //    }catch(ex){
                //        log.error('get my reply offline orders, off_id exception: ' + ex.message);
                //    }
                //}
                db.offlineTopics.find({_id: {$in: idArray}}).sort(sort).skip((parseInt(start) - 1) < 0 ? 0 : (parseInt(start) - 1)).limit(parseInt(count)).toArray(function (err2, doc2) {
                    if (err2) {
                        log.error('get reply offline orders error: ' + err2.message);
                        return callback(err2);
                    } else {
                        offlineList({doc: doc2, userID: param.userID}, function (err3, doc3) {
                            if (err3) {
                                log.error('get reply offline orders error: ' + err2.message);
                                return callback(err3);
                            } else {
                                log.trace('get reply offline orders success, userID=' + param.userID);
                                return callback(null, doc3);
                            }
                        });
                    }
                });
            }
        });
    } else {
        db.offlineTopics.find({author_id: author_id}).sort(sort).skip((parseInt(start) - 1) < 0 ? 0 : (parseInt(start) - 1)).limit(parseInt(count)).toArray(function (err, doc) {
            if (err) {
                log.error('get offline orders error: ' + err.message);
                return callback(err);
            } else {
                offlineList({doc: doc, userID: param.userID}, function (err2, doc2) {
                    if (err2) {
                        log.error('get offline orders, offline list error: ' + err2.message);
                        return callback(err2);
                    } else {
                        log.trace('get offline orders success, userID=' + param.userID);
                        return callback(null, doc2);
                    }
                });
            }
        });
    }
};
