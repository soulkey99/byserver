/**
 * Created by MengLei on 2015/9/23.
 */

var db = require('../../../config').db;
var objectId = require('mongojs').ObjectId;
var result = require('../../utils/result');
var eventproxy = require('eventproxy');
var log = require('../../../utils/log').http;

//获取一些的配置信息
module.exports = function(req, res) {
    var ep = new eventproxy();
    ep.all('msg', function (msg) {
        result(res, {
            statusCode: 900,
            unreadMsg: (msg.person || msg.sys),
            unreadPerson: (msg.person ? 1 : 0),
            unreadSys: (msg.sys ? 1 : 0)
        });
    });
    ep.fail(function (err) {
        log.error('event proxy fail: error: ' + err.message);
        result(res, {statusCode: 905, message: err.message});
    });
    unreadMsg(req.body.userID, function(err, doc){
        if(err){
            ep.emit('error', err);
        }else{
            ep.emit('msg', doc);
        }
    });
};


//判断是否有未读消息
function unreadMsg(userID, callback){
    //
    var ep = new eventproxy();
    ep.all('sys_msg', 'person_msg', function(sys_msg, person_msg){
        callback(null, {person: (!!person_msg), sys: (!!sys_msg)});
    });
    ep.fail(function(err){
        callback(err);
    });
    //只取这四种类型的消息是否有未读，其他类型不管
    var query = {to: userID, read: false, type: {$in: ['watchTopic', 'answer', 'upAnswer', 'reply', 'system']}};
    db.msgbox.find(query, function (err, doc) {
        if (err) {
            log.error('get config find msg error: ' + err.message);
            ep.emit('error', err);
        } else {
            //console.log('doc.length' + doc.length);
            ep.emit('person_msg', doc.length > 0);
        }
    });
    db.users.findOne({_id: new objectId(userID)}, {'userInfo.create_time': 1, userType: 1}, function (err, doc) {
        if (err) {
            ep.emit('error', err);
        } else {
            db.msgbox.find({
                $or: [{type: ('broadcast' + (doc.userType == 'teacher' ? '_t' : '_s'))}, {type: 'broadcast'}],
                time: {$gte: doc.userInfo.create_time}
            }, {_id: 1}, function (err2, doc2) {
                if (err2) {
                    ep.emit('error', err2);
                } else {
                    var ids = [];
                    for (var i = 0; i < doc2.length; i++) {
                        ids.push(doc2[i]._id.toString());
                    }
                    db.msgStatus.find({msgid: {$in: ids}, userID: userID}, function (err3, doc3) {
                        if (err3) {
                            ep.emit('error', err3);
                        } else {
                            //console.log('doc3.length=' + doc3.length + ', doc2.length=' + doc2.length);
                            ep.emit('sys_msg', doc3.length < doc2.length);
                        }
                    });
                }
            });
        }
    });
}