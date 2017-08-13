/**
 * Created by MengLei on 2015/2/19.
 */

var db = require('../../config').db;
var router = require('../router');
var CronJob = require('cron').CronJob;
var badgeUtil = require('../utils/badgeUtil');
var log = require('./../../utils/log').mqtt;

//提取出msg部分的逻辑
module.exports = function (content) {
    //var msgid = content.msgid;
    if (content.status) {
        //如果是接收者的消息反馈，那么走该分支，只有反馈才会带有status
        receiveResponse(content);
    } else {
        //否则走这个分支
        receiveFromSender(content);
    }
};

//服务端收到发送者发送过来的消息
function receiveFromSender(content) {
    log.trace('mqtt server: chat_msg=' + JSON.stringify(content));
    var msgid = content.msgid;
    var o_id = content.o_id;
    var from = content.from;
    content.status = 'sent';
    content.t = (new Date()).getTime().toString();
    //先入库再进行接下来的操作
    db.orders.update({o_id: o_id}, {$push: {chat_msg: content}}, function (err, doc) {
        if (err) {
            //handle error
        } else {
            //msg内容入库，接下来要返给发送者一个sent，表示发送者处的消息已经发出
            router.sendMsg({msgid: msgid, status: 'sent'}, from);
            //sendMsg(content);
            //直接发送就可以了，没有必要再去数据库中读取
            delete(content.status); //去掉status字段
            router.sendMsg(content, content.to);   //发送给消息接收者

            //下面计算每单回复超过8条以及图片、语音一条的徽章
            badgeUtil.calcBadge(o_id);
        }
    })
}

//发送过来的消息入库之后，再发送给接收者
function sendMsg(content) {
    db.orders.findOne({o_id: content.o_id}, function (err, doc) {
        if (err) {
            //handle error
        } else {
            if (doc) {
                for (var i = 0; i < doc.chat_msg.length; i++) {
                    if (doc.chat_msg[i].msgid == content.msgid) {
                        doc.chat_msg[i].status = 'pending';
                        var chatMsg = doc.chat_msg;
                        var o_id = doc.o_id;
                        var msgToSend = doc.chat_msg[i];
                        delete(content.status);
                        db.orders.update({o_id: o_id}, {$set: {chat_msg: chatMsg}}, function (err, doc) {
                            if (err) {
                                //handle error
                            } else {
                                router.sendMsg(msgToSend);
                            }
                        });
                    }
                }
            }
        }
    })
}

//服务端收到接收者发送的反馈，先入库，然后反馈给消息发送者
function receiveResponse(content) {
    log.trace('mqtt server: chat_msg response: ' + JSON.stringify(content));
    var msgid = content.msgid;
    var from = content.from;
    if (content.status == 'received') {
        db.orders.findOne({o_id: content.o_id}, function (err, doc) {
            if (err) {
                //handle error
            } else {
                if (doc) {
                    for (var i = 0; i < doc.chat_msg.length; i++) {
                        if (doc.chat_msg[i].msgid == msgid) {
                            doc.chat_msg[i].status = 'received';   //修改对应的消息状态为received
                            var chatMsg = doc.chat_msg;
                            var o_id = doc.o_id;
                            db.orders.update({o_id: o_id}, {$set: {chat_msg: chatMsg}}, function (err, doc) {
                                if (err) {
                                    //handle error
                                } else {
                                    //将反馈发送给消息发送者
                                    router.sendMsg(content, from);
                                }
                            });
                        }
                    }
                }
            }
        });
    }
}