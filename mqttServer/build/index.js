/**
 * Created by MengLei on 2015/2/22.
 */

var router = require('../router');
var db = require('../../config').db;
var log = require('./../../utils/log').mqtt;

//建立订单的流程：
module.exports = function (content) {
    if (content.status) {
        //如果是学生端给的反馈，那么会包含state字段，该消息返回给教师
        log.trace('build order: from student to teacher: ' + JSON.stringify(content));
        router.buidlChat(content, content.t_id);

        //学生进入聊天页面之后，需要首先自动给学生发送一条消息，【老师已经接单，正在阅读题目，请耐心等待。】
        //router.sendMsg({
        //    o_id: content.o_id,
        //    msgid: '1000001',
        //    from: content.t_id,
        //    to: content.s_id,
        //    type: 'text',
        //    msg: '同学您好，老师已经接单，正在阅读题目，请耐心等待！',
        //    t: (new Date()).getTime()
        //}, content.s_id);

        //TODO:根据会话能否建立成功，修改数据库中状态
        //changeStatus(content);  //暂时先不用管这一部分，这个状态先由app server去处理
    } else {
        //如果是教师端发的请求，则不包含state字段，该消息发送给学生
        log.trace('build order: from teacher to student: ' + JSON.stringify(content));
        router.buidlChat(content, content.s_id);
    }
};

//如果学生返回给教师端的状态是可以建立连接，那么则认为会话建立成功，此时将学生和教师的在线状态都改为chatting状态。
var changeStatus = function (content) {
    if (content.status == '2') {
        //state = 2为会话建立不成功，则不去改变数据库状态
        return;
    }

    db.user.update({uid: content.from}, {$set: {status: 'chatting'}}, function (err, doc) {
        if (err) {
            //handle error
        } else {
            db.user.update({uid: content.from}, {$set: {status: 'chatting'}}, function (err, doc) {
                if (err) {
                    //handle error
                } else {
                    //状态改变成功
                }
            });
        }
    })
};