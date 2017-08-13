/**
 * Created by MengLei on 2015/8/25.
 */

var db = require('../../config').db;
var config = require('../../config');
var objectId = require('mongojs').ObjectId;
var log = require('./../../utils/log').order;
var offlineAnsList = require('./utils/offlineAnsList');
var offlineList = require('./utils/offlineList');

//获取我的收藏列表，param={userID: '', startPos: '', pageSize: '', type: 'topic/answer}
module.exports = function(param, callback) {
    var start = param.startPos ? param.startPos : 1;
    var count = param.pageSize ? param.pageSize : 10;

    if(param.type == 'topic') {
        db.topicCollect.find({userID: param.userID}).sort({time: -1}).skip((parseInt(start) - 1) < 0 ? 0 : (parseInt(start) - 1)).limit(parseInt(count)).toArray(function (err, doc) {
            if (err) {
                log.error('get my collect error: ' + err.message);
                return callback(err);
            } else {
                //查询成功
                if (doc.length == 0) {
                    //如果接口为空，那么直接回复空数组
                    return callback(null, []);
                } else {
                    var _ids = [];
                    for (var i = 0; i < doc.length; i++) {
                        //
                        try {
                            _ids.push(new objectId(doc[i].off_id));
                        } catch (ex) {
                            //exception
                        }
                    }
                    db.offlineTopics.find({_id: {$in: _ids}}, function (err2, doc2) {
                        if (err2) {
                            log.error('get my collect error: ' + err2.message);
                            return callback(err2);
                        } else {
                            //
                            offlineList({doc: doc2, userID: param.userID}, function (err3, doc3) {
                                if (err3) {
                                    log.error('get my collect error: ' + err3.message);
                                    return callback(err3);
                                } else {
                                    log.trace('get my collect success. userID=' + param.userID);
                                    callback(null, doc3);
                                }
                            });
                        }
                    });
                }
            }
        });
    }else{
        //
        db.answerCollect.find({userID: param.userID}).sort({time: -1}).skip((parseInt(start) - 1) < 0 ? 0 : (parseInt(start) - 1)).limit(parseInt(count)).toArray(function (err, doc) {
            if (err) {
                log.error('get my collect error: ' + err.message);
                return callback(err);
            } else {
                //查询成功
                if (doc.length == 0) {
                    //如果接口为空，那么直接回复空数组
                    return callback(null, []);
                } else {
                    var _ids = [];
                    for (var i = 0; i < doc.length; i++) {
                        //
                        try {
                            _ids.push(new objectId(doc[i].answer_id));
                        } catch (ex) {
                            //exception
                        }
                    }
                    db.offlineAnswers.find({_id: {$in: _ids}}, function (err2, doc2) {
                        if (err2) {
                            log.error('get my collect error: ' + err2.message);
                            return callback(err2);
                        } else {
                            if (doc2.length > 0) {
                                //有内容，对内容进行加工
                                offlineAnsList({doc: doc2, userID: param.userID}, function(err3, doc3){
                                    if(err2){
                                        log.error('get offline answer list error: ' + err2.message);
                                        return callback(err3);
                                    }else{
                                        log.error('get offline answer list success.');
                                        callback(null, doc3);
                                    }
                                });
                            } else {
                                //直接回复空数组
                                callback(null, []);
                            }
                        }
                    });
                }
            }
        });
    }
};


