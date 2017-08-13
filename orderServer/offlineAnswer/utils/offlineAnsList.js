/**
 * Created by MengLei on 2015/9/9.
 */

var db = require('../../../config').db;
var config = require('../../../config');
var objectId = require('mongojs').ObjectId;
var eventproxy = require('eventproxy');
var log = require('./../../../utils/log').order;

//离线答案列表进行加工，param={doc: list, userID: ''}
module.exports = function(param, callback){
    //
    var doc = param.doc;
    var list = [];
    var author_idArray = [];
    var ans_id_list = [];
    var author_idObj = {};
    var off_id_list = [];
    for (var i = 0; i < doc.length; i++) {
        var item = {
            answer_id: doc[i]._id.toString(),
            off_id: doc[i].off_id,
            author_id: doc[i].author_id,
            type: doc[i].type,
            createTime: doc[i].createTime,
            updateTime: doc[i].updateTime || doc[i].createTime,  //没有更新时间的，取创建时间
            reply: doc[i].reply,
            delete: doc[i].delete
        };
        ans_id_list.push(item.answer_id);
        //点赞数，是否点赞
        if (doc[i].ups) {
            item.ups = doc[i].ups.length || 0;
            item.up = (doc[i].ups.indexOf(param.userID) >= 0);
        } else {
            item.ups = 0;
            item.up = false;
        }
        //反对数，是否反对
        if (doc[i].downs) {
            item.downs = doc[i].downs.length || 0;
            item.down = (doc[i].downs.indexOf(param.userID) >= 0);
        } else {
            item.downs = 0;
            item.down = false;
        }
        if (doc[i].reply_id) {
            item.reply_id = doc[i].reply_id;
        }
        if (doc[i].orientation) {
            item.orientation = doc[i].orientation;
        }
        if (doc[i].time) {
            item.time = doc[i].time;
        }
        var summary = {
            text: '',
            voice: false,
            image: false
        };
        //生成一个答案摘要，在返回某题的答案列表的时候，不需要返回每条答案全部内容，只要截取一条文字并返回是否有图片、语音即可
        //返回的文字只要截取前70个字
        for (var j = doc[i].msg.length - 1; j >= 0; j--) {
            switch (doc[i].msg[j].type) {
                case 'text':
                {//文字消息
                    summary.text = doc[i].msg[j].msg.substr(0, 70);
                }
                    break;
                case 'voice':
                {//语音消息
                    summary.voice = true;
                }
                    break;
                case 'image':
                {//图片消息
                    summary.image = true;
                }
                    break;
                default :
                    break;
            }
        }

        item.summary = summary;
        list.push(item);
        //作者
        author_idObj[item.author_id] = 1;
        //离线topic数组
        try {
            off_id_list.push(new objectId(doc[i].off_id));
        }catch(ex){
            log.error('get my offline error: ' + ex.message);
        }
    }
    for (var id in author_idObj) {
        author_idArray.push(new objectId(id));
    }
    var ep = eventproxy.create('user', 'topic', 'reply', 'collect', function(user, topic, reply, collect){
        //
        var replied = [];
        var collected = [];

        for(var m = 0; m<reply.length; m++){
            replied.push(reply[m].answer_id);
        }
        for(var n = 0; n<collect.length; n++){
            collected.push(collect[n].answer_id);
        }
        //log.trace('collected: ' + JSON.stringify(collected));
        for (var i = 0; i < list.length; i++) {
            for (var j = 0; j < user.length; j++) {
                if (list[i].author_id == user[j]._id.toString()) {
                    list[i].author_nick = user[j].nick;
                    list[i].author_avatar = user[j].userInfo.avatar || '';
                }
            }
            list[i].replied = (replied.indexOf(list[i].answer_id) >= 0);
            list[i].collected = (collected.indexOf(list[i].answer_id) >= 0);
            for(var k = 0; k<topic.length; k++){
                if(list[i].off_id == topic[k]._id.toString()){
                    list[i].topic = topic[k].topic;
                    //生成一个问题摘要
                    var q_summary = {
                        text:'',    //一条文字
                        image: '',      //一条图片
                        orientation: '',    //图片方向
                        voice: '',      //一条语音
                        time: 0        //语音时长
                    };
                    for(var ki = 0; ki < topic[k].q_msg.length; ki++){
                        switch (topic[k].q_msg[ki].type){
                            case 'text':
                            {//文字消息
                                q_summary.text = topic[k].q_msg[ki].msg;
                            }
                                break;
                            case 'voice':
                            {//语音消息
                                q_summary.voice = topic[k].q_msg[ki].msg || '';
                                q_summary.time = topic[k].q_msg[ki].time;
                            }
                                break;
                            case 'image':
                            {//图片消息
                                q_summary.image = topic[k].q_msg[ki].msg || '';
                                q_summary.orientation = topic[k].q_msg[ki].orientation;
                            }
                                break;
                            default :
                                break;
                        }
                    }
                    list[i].q_summary = q_summary;
                }
            }
        }
        callback(null, list);
    });
    ep.fail(function(err2){
        log.error('get offline answer error: ' + err2.message);
        callback(err2);
    });
    //获取用户信息
    db.users.find({_id: {$in: author_idArray}}, {nick: 1, 'userInfo.avatar': 1}, function (err2, doc2) {
        if (err2) {
            log.error('get offline answer list, get user info error: ' + err2.message);
            ep.emit('error', err2);
        } else {
            log.trace('get offline answer list, get user info success');
            ep.emit('user', doc2);
        }
    });
    //这些离线答案的对应的topic
    db.offlineTopics.find({_id: {$in: off_id_list}}, {_id: 1, tag: 1, topic: 1, q_msg: 1}, function(err2, doc2){
        if (err2) {
            log.error('get offline answer list, get topics info error: ' + err2.message);
            ep.emit('error', err2);
        } else {
            log.trace('get offline answer list, get topics info success');
            ep.emit('topic', doc2);
        }
    });
    //获取回复信息
    db.offlineAnsReply.find({author_id: param.userID, answer_id: {$in: ans_id_list}}, {answer_id: 1}, function(err2, doc2){
        if(err2){
            log.error('get offline answer list, get reply info error: ' + err2.message);
            ep.emit('error', err2);
        }else{
            log.trace('get offline answer list, get reply info success');
            ep.emit('reply', doc2);
        }
    });

    //log.trace({userID: param.userID, answer_id: {$in: ans_id_list}});
    //获取收藏信息
    db.answerCollect.find({userID: param.userID, answer_id: {$in: ans_id_list}}, {answer_id: 1}, function(err2, doc2){
        if(err2){
            log.error('get offline answer list, get collect info error: ' + err2.message);
            ep.emit('error', err2);
        }else{
            log.trace('get offline answer list, get collect info success');
            ep.emit('collect', doc2);
        }
    });
};