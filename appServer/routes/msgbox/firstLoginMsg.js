/**
 * Created by MengLei on 2015/9/30.
 */

var db = require('../../../config').db;
var objectId = require('mongojs').ObjectId;
var proxy = require('../../../common/proxy');
var log = require('./../../../utils/log').http;

//对于首次登录教师端、学生端的用户，发送提示信息
module.exports = function notifyTeacher(userID, userType){
    var query = {from: 'welcome_s', to: userID};
    if(userType == 'teacher'){
        query.from = 'welcome_t';
    }
    //console.log('first login, userID: ' + userID + ', userType: ' + userType);
    db.msgbox.findOne(query, function(err, doc){
        if(err){
            log.error('first login msg error: ' + err.message);
        } else {
            if(doc){
                //之前发过通知了，就不用再发送了
                //console.log('first reg msg: ' + JSON.stringify(doc) + ', query: ' + JSON.stringify(query));
            }else{
                //之前没有发送过通知，这里发送一次
                //默认发学生端
                var msg = {
                    "from" : "welcome_s",
                    "to" : userID,
                    "type" : "system",
                    "detail" : {
                        "type" : "link",
                        "topic" : "欢迎使用CallCall教师-学生端",
                        "content" : "尊敬的用户，感谢您使用callcall教师-学生端，请点击查看操作引导。",
                        "link" : "http://callcall.soulkey99.com:8061/guide/studentIndex.html"
                    },
                    "time" : (new Date()).getTime(),
                    "delete" : false,
                    "read" : false,
                    "display" : true
                };
                if(userType == 'teacher'){
                    //如果用户类型是教师，那么发教师端
                    msg.from = 'welcome_t';
                    msg.detail.topic = "欢迎使用CallCall教师-教师端";
                    msg.detail.content = '尊敬的用户，感谢您使用callcall教师-教师端，请点击查看操作引导。';
                    msg.detail.link = 'http://callcall.soulkey99.com:8061/guide/teacherIndex.html';
                }
                log.trace('first reg msg from system to userID: ' + userID + ', type: ' + userType);
                //保存消息
                db.msgbox.insert(msg);
            }
        }
    });
    return;
    proxy.User.getUserById(userID, function(err, doc){
        if(err){
            console.log('first login msg error: ' + err.message);
        } else {
            if(doc) {
                console.log('get user by id success, phone: ' + doc.phone + ', userID: ' + doc._id.toString() + ', create time: ' + new Date(doc.userInfo.create_time).toLocaleString());
            }
            if (doc && (doc.userType == 'teacher') && (doc.userInfo.create_time > 1450686425160)) {
                console.log('get user by id inside if');
                //xx时间之后注册的教师端，才去进行查找
                proxy.Msgbox.getMsgByQuery({from: 'sojump20151221', to: userID}, {}, function (err2, doc2) {
                    if (err2) {
                        //
                    } else {
                        console.log('msg length: ' + doc2.length);
                        if (doc2.length == 0) {
                            //如果有消息了，那么就不管
                            //没有消息的话就发送这条消息
                            var msg = {
                                "from": "sojump20151221",
                                "to": userID,
                                "type": "system",
                                "detail": {
                                    "type": "link",
                                    "topic": "点开有惊喜，积分免费送",
                                    "content": "CallCall教师有奖调查问卷",
                                    "link": "http://www.sojump.com/jq/6833933.aspx"
                                },
                                "time": Date.now(),
                                "delete": false,
                                "read": false,
                                "display": true
                            };
                            db.msgbox.insert(msg);
                            console.log('send msg success.');
                        }
                    }
                });
            }
        }
    });
};
