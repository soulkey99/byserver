/**
 * Created by MengLei on 2015/9/8.
 */

var db = require('../../../config').db;
var config = require('../../../config');
var objectId = require('mongojs').ObjectId;
var offlineOperate = require('../utils/offlineOperate');
var eventproxy = require('eventproxy');
var hot = require("hot-ranking");
var circleItem = require('./circleItem');
var log = require('./../../../utils/log').order;

//获取我的朋友圈信息(我以及我关注的人的动态)，param={userID: '', type: '', startPos: '', pageSize: '', time: 123}，type是过滤信息类型
module.exports = function(param, callback){
    var _id = new objectId(param.userID);
    var start = parseInt(param.startPos || 1) - 1;
    var count = parseInt(param.pageSize || 10);

    db.userFollowing.findOne({_id: _id}, function(err, doc){
        if(err){
            log.error('get my circle error: ' + err.message);
            callback({statusCode: 905, message: err.message});
        }else {
            var friendList = [param.userID];
            if (doc && doc.list) {
                friendList = doc.list;
                friendList.push(param.userID);
            }
            if (doc && doc.pubList) {
                for (var i = 0; i < doc.pubList.length; i++) {
                    friendList.push(doc.pubList[i]);
                }
            }
            var query = {userID: {$in: friendList}, display: true};
            if (param.type) {
                query.operType = {$in: param.type.split(',')};
            }
            var cursor = db.offlineOperate.find(query).sort({time: -1}).skip(start < 0 ? 0 : start).limit(count);
            if (param.time) {
                query.time = {$gt: parseFloat(param.time)};
                cursor = db.offlineOperate(query).sort({time: -1}).limit(count);
            }
            cursor.toArray(function (err2, doc2) {
                if (err2) {
                    log.error('get my circle error: ' + err2.message);
                    callback({statusCode: 905, message: err2.message});
                } else {
                    //获取朋友圈最新动态成功，这里处理最新动态的这些内容，准备组织数据返回值
                    var ep = new eventproxy();
                    ep.fail(function (err3) {
                        log.error('get circle list error: ' + err3.message);
                        callback({statusCode: 905, message: err3.message});
                    });
                    ep.after('circle', doc2.length, function (list) {
                        //
                        list.sort(function (a, b) {
                            return b.time - a.time;
                        });
                        callback({statusCode: 900, list: list});
                    });
                    for (var i = 0; i < doc2.length; i++) {
                        circleItem({info: doc2[i], userID: param.userID}, function (err3, doc3) {
                            if (err3) {
                                ep.emit('error', err3);
                            } else {
                                ep.emit('circle', doc3);
                            }
                        });
                    }
                }
            });
        }
    });
};

