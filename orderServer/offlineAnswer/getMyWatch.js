/**
 * Created by MengLei on 2015/8/26.
 */

var db = require('../../config').db;
var config = require('../../config');
var objectId = require('mongojs').ObjectId;
var log = require('./../../utils/log').order;
var offlineList = require('./utils/offlineList');

//获取我的关注列表，param={userID: '', startPos: '', pageSize: ''}
module.exports = function(param, callback) {
    var start = param.startPos ? param.startPos : 1;
    var count = param.pageSize ? param.pageSize : 10;

    db.topicWatch.find({userID: param.userID}).sort({time: -1}).skip((parseInt(start) - 1) < 0 ? 0 : (parseInt(start) - 1)).limit(parseInt(count)).toArray(function (err, doc) {
        if (err) {
            log.error('get my watch error: ' + err.message);
            return callback(err);
        } else {
            //查询成功
            if (doc.length == 0) {
                //如果列表为空，那么直接回复空数组
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
                        log.error('get my watch error: ' + err2.message);
                        return callback(err2);
                    } else {
                        //
                        offlineList({doc: doc2, userID: param.userID}, function (err3, doc3) {
                            if (err3) {
                                log.error('get my watch error: ' + err3.message);
                                return callback(err3);
                            } else {
                                log.trace('get my watch success. userID=' + param.userID);
                                return callback(null, doc3);
                            }
                        });
                    }
                });
            }
        }
    });
};
