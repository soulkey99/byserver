/**
 * Created by MengLei on 2015/11/27.
 */

var db = require('./../../config').db;
var objectId = require('mongojs').ObjectId;
var log = require('./../../utils/log').order;

//获取公众号的对话记录，param={userID: '', pub_id: '', startPos: '', pageSize: ''}
module.exports = function(param, callback) {
    var start = parseInt(param.startPos || '1') - 1;
    var count = parseInt(param.pageSize || '10');
    var query = {userID: param.userID, pub_id: param.pub_id};
    //如果传了时间，那么就只获取比这个时间更新的聊天数据
    if(param.time){
        query['time'] = {$gt: parseFloat(param.time)};
    }
    db.pubChat.find(query).sort({time: -1}).skip(start < 0 ? 0 : start).limit(count).toArray(function (err, doc) {
        if (err) {
            callback({statusCode: 905, message: err.message});
        } else {
            var list = [];
            for (var i = 0; i < doc.length; i++) {
                var item = {
                    chat_id: doc[i]._id.toString(),
                    userID: doc[i].userID,
                    pub_id: doc[i].pub_id,
                    type: doc[i].type,
                    direction: doc[i].direction,
                    time: doc[i].time
                };
                if (item.direction == 'u2p') {
                    item.text = doc[i].text;
                } else if (item.direction == 'p2u') {
                    item.detail = doc[i].detail;
                }
                list.push(item);
            }
            callback({statusCode: 900, list: list});
        }
    });
};
