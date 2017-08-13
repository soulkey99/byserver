/**
 * Created by MengLei on 2016/2/3.
 */
"use strict";
const proxy = require('./../../common/proxy');
const eventproxy = require('eventproxy');
const log = require('../../utils/log').common;

//获取排行榜param={type: 'global/friend', userID: ''}
module.exports = function (param, callback) {
    var ep = new eventproxy();
    var ep2 = new eventproxy();
    ep.all('userRecord', 'self', function (userRecord, self) {
        var u_ids = [];
        var before20 = false;   //标志位，用户本人是否在前20名中
        for (var i = 0; i < userRecord.length; i++) {
            u_ids.push(userRecord[i]._id.toString());
        }
        if (u_ids.indexOf(self._id.toString()) >= 0) {
            before20 = true;
        } else {  //如果用户本人不在前20名中，那么需要额外将用户本人id加入到列表中
            u_ids.push(self._id.toString());
            userRecord.push(self);
        }
        proxy.User.getUsersByIds(u_ids, function (err, doc) {
            if (err) {
                return callback(err);
            }
            var list = [];
            for (var i = 0; i < userRecord.length; i++) {
                var obj = {
                    userID: userRecord[i]._id.toString(),
                    rank: userRecord[i].rank,
                    nick: '',
                    avatar: '',
                    level: userRecord[i].level,
                    win: userRecord[i].weekly.win,
                    finish: userRecord[i].weekly.finish,
                    intellectual: userRecord[i].weekly.intellectual
                };
                for (var j = 0; j < doc.length; j++) {
                    if (obj.userID == doc[j]._id.toString()) {
                        obj.nick = doc[j].nick;
                        obj.avatar = doc[j].userInfo.avatar;
                        break;
                    }
                }
                list.push(obj);
            }
            callback(null, list);
        });
    });
    ep.fail(callback);
    ep2.all('following', 'ai', function (following, ai) {
        //查排行榜前20名
        var query = {_id: {$nin: ai}};
        if (following) {
            query = {_id: {$in: following}};
        }
        proxy.GameUserRecord.getRecordByQuery(query, {
            sort: '-weekly.intellectual -weekly.finish',
            limit: 20
        }, ep.done('userRecord', function (doc) {
            var list = [];
            for (var i = 0; i < doc.length; i++) {
                var obj = doc[i].toObject();
                obj.rank = i + 1;
                list.push(obj);
            }
            return list;
        }));
        //查用户自己在排行榜上面的位置
        log.trace('get rank, userID: ' + param.userID + ', param: ' + JSON.stringify(param));
        proxy.GameUserRecord.getRecordByUserID(param.userID, function (err, doc) {
            if (err) {
                return ep.throw(err);
            }
            var resp = doc.toObject();
            var query = {};
            if (param.type == 'friend') {
                query = {_id: {$in: following}};
            }
            proxy.GameUserRecord.getRecordCountByQuery(query, ep.done('self', function (doc2) {
                resp.rank = (doc2 + 1);
                return resp;
            }));
        });
    });
    ep2.fail(function (err) {
        ep.throw(err);
    });
    //对于获取类型进行判断，如果是查询好友榜，那么要首先查询好友列表信息
    if (param.type == 'friend') {
        proxy.Follow.getUserFollowingByID(param.userID, '', '', ep2.done('following', function (doc) {
            var list = [];
            for (let i = 0; i < doc.length; i++) {
                list.push(doc[i].userID);
            }
            list.push(param.userID);
            return list;
        }));
    } else {
        ep2.emit('following');
    }
    proxy.User.getUsersByQuery({userType: 'gameAI'}, {}, ep2.done('ai', function (doc) {
        var list = [];
        for (var i = 0; i < doc.length; i++) {
            list.push(doc[i]._id);
        }
        return list;
    }));
};

