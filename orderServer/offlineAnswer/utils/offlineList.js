/**
 * Created by MengLei on 2015/8/26.
 */

var db = require('../../../config').db;
var config = require('../../../config');
var objectId = require('mongojs').ObjectId;
var eventproxy = require('eventproxy');
var log = require('./../../../utils/log').order;

//组织离线问题列表，param={doc: list, userID: ''}
module.exports = function(param, callback) {
    //
    var doc = param.doc;
    var userID = param.userID;
    var list = [];
    var author_idArray = [];
    var off_id_list = [];
    for (var i = 0; i < doc.length; i++) {

        var item = {
            off_id: doc[i]._id.toString(),
            author_id: doc[i].author_id,
            grade: doc[i].grade,
            subject: doc[i].subject,
            tag: doc[i].tag,
            topic: doc[i].topic || '',
            createTime: doc[i].createTime,
            updateTime: doc[i].updateTime,
            lastReplyTime: doc[i].lastReplyTime,
            collect: doc[i].collect,
            watch: doc[i].watch,
            visit: doc[i].visit,
            reply: doc[i].reply,
            replied: false,
            recommend: doc[i].recommend,
            bonus: doc[i].bonus,
            delete: doc[i].delete,
            status: doc[i].status
        };
        //所有的off_id
        off_id_list.push(item.off_id);
        //问题的空摘要，下面才会填入数据
        var q_summary = {
            text: '',    //一条文字
            image: '',      //一条图片
            orientation: '',    //图片方向
            voice: '',      //一条语音
            time: 0        //语音时长
        };
        //生成一个问题摘要，在返回列表的时候，不需要返回问题全部内容，只要截取一条文字一张图片一段语音即可，如果没有的话，也可以不取
        for (var j = doc[i].q_msg.length - 1; j >= 0; j--) {
            switch (doc[i].q_msg[j].type) {
                case 'text':
                {//文字消息
                    q_summary.text = doc[i].q_msg[j].msg;
                }
                    break;
                case 'voice':
                {//语音消息
                    q_summary.voice = doc[i].q_msg[j].msg || '';
                    q_summary.time = doc[i].q_msg[j].time;
                }
                    break;
                case 'image':
                {//图片消息
                    q_summary.image = doc[i].q_msg[j].msg || '';
                    q_summary.orientation = doc[i].q_msg[j].orientation;
                }
                    break;
                default :
                    break;
            }
        }

        item.q_summary = q_summary;
        list.push(item);
        var author_id = '';
        try {
            author_id = new objectId(item.author_id);
        }catch(ex){
            log.error('author_id error: ' + ex.message);
        }
        author_idArray.push(author_id);
    }

    var ep = eventproxy.create('user', 'answer', 'watch', 'collect', function (user, answer, watch, collect) {
        var replied = [];
        var watched = [];
        var collected = [];
        //log.trace('answer: ' + JSON.stringify(answer));
        //log.trace('watch: ' + JSON.stringify(watch));
        //log.trace('collect: ' + JSON.stringify(collect));
        //回复id列表
        for(var k=0; k<answer.length; k++){
            replied.push(answer[k].off_id);
        }
        //关注id列表
        for(var m=0; m<watch.length; m++){
            watched.push(watch[m].off_id);
        }
        //收藏id列表
        for(var n=0; n<collect.length; n++){
            collected.push(collect[n].off_id)
        }

        //log.trace('answer: ' + JSON.stringify(replied));
        //log.trace('watch: ' + JSON.stringify(watched));
        //log.trace('collect: ' + JSON.stringify(collected));

        for (var i = 0; i < list.length; i++) {
            for (var j = 0; j < user.length; j++) {
                //赋值作者信息
                if (list[i].author_id == user[j]._id.toString()) {
                    list[i].author_nick = user[j].nick;
                    list[i].author_avatar = user[j].userInfo.avatar || '';
                }
            }

            //是否回复过
            list[i].replied = (replied.indexOf(list[i].off_id) >= 0);
            //是否关注过
            list[i].watched = (watched.indexOf(list[i].off_id) >= 0);
            //是否收藏过
            list[i].collected = (collected.indexOf(list[i].off_id) >= 0);
            log.trace('off_id: ' + list[i].off_id + ', replied: ' + list[i].replied + ', watched: ' + list[i].watched + ', collected: ' + list[i].collected);
        }

        callback(null, list);
    });

    //处理错误
    ep.fail(function (err) {
        log.error('get offline topic list error: ' + err.message);
        callback(err);
    });

    //查询用户信息
    db.users.find({_id: {$in: author_idArray}}, {nick: 1, 'userInfo.avatar': 1}, function (err2, doc2) {
        if (err2) {
            ep.emit('error', err2);
        } else {
            ep.emit('user', doc2);
        }
    });

    //查询用户是否回答过对应的问题
    db.offlineAnswers.find({author_id: userID, off_id: {$in: off_id_list}}, {_id: 0, off_id: 1}, function (err2, doc2) {
        if (err2) {
            ep.emit('error', err2);
        } else {
            ep.emit('answer', doc2);
        }
    });

    //log.trace('author_id: ' + userID + ', off_id_list: ' + JSON.stringify(off_id_list));
    //查询用户是否关注过对应的问题
    db.topicWatch.find({userID: userID, off_id: {$in: off_id_list}}, {_id: 0, off_id: 1}, function (err2, doc2) {
        if (err2) {
            ep.emit('error', err2);
        } else {
            ep.emit('watch', doc2);
        }
    });

    //查询用户是否收藏过对应的问题
    db.topicCollect.find({userID: userID, off_id: {$in: off_id_list}}, {_id: 0, off_id: 1}, function (err2, doc2) {
        if (err2) {
            ep.emit('error', err2);
        } else {
            ep.emit('collect', doc2);
        }
    });
};


