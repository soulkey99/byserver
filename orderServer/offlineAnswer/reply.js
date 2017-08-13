/**
 * Created by MengLei on 2015/8/10.
 */

var db = require('../../config').db;
var config = require('../../config');
var objectId = require('mongojs').ObjectId;
var hot = require("hot-ranking");
var log = require('./../../utils/log').order;
var offlineOperate = require('./utils/offlineOperate');
var dnode = require('../utils/dnodeClient');
var rankData = require('./rank/data');

//回复自由答param={userID: '', off_id: '', msg: [], rely_id: '', answer_id: '可选，编辑时才传递'}
//msg结构：[{msg: '消息内容', type: '消息类型', orientation: '图片方向', time: '语音时长', seq: '消息顺序，从1开始'}]
module.exports = function(param, callback) {
    //
    var curTime = new Date().getTime();
    var msg = [];
    try {
        msg = JSON.parse(param.msg);
    } catch (ex) {
        return callback(ex);
    }
    var ans_id = new objectId();    //answer_id的ObjectId形式

    var msg_ok = [];    //预处理一下
    for(var i=0; i<msg.length; i++){
        var item = {type: msg[i].type, seq: msg[i].seq || (i+1), msg: msg[i].msg || ''};
        switch (msg[i].type){
            case 'voice'://语音
                item.time = msg[i].time;
                break;
            case 'image'://图片
                item.orientation = msg[i].orientation;
                break;
            default ://默认按照文字的方式
                break;
        }
        msg_ok.push(item);
    }

    if (param.answer_id) {
        //如果传进来的参数有answer_id，那么就是编辑，否则就是新增
        try {
            ans_id = new objectId(param.answer_id);
        } catch (ex) {
            //如果answer_id有错误
            log.error('modify offline answer error: ' + ex.message);
            callback(ex);
            return;
        }
        var setObj = {
            msg: msg_ok,
            updateTime: curTime
        };
        if(param.reply_id){
            setObj.reply_id = param.reply_id;
        }

        var off_id = '';
        try {
            off_id = new objectId(param.off_id);
        } catch (ex) {
            log.error('modify reply error: off_id ' + ex.message);
            callback(ex);
            return;
        }

        //先判断离线问题是否存在
        db.offlineTopics.findOne({_id: off_id}, {_id: 1}, function (err, doc) {
            if (err) {
                log.error('modify offline answers error: ' + err.message);
                return callback(err);
            } else {
                if (doc) {
                    //离线问题存在，可以回复
                    //在判断离线答案是否存在，只有存在了才能进行编辑
                    db.offlineAnswers.findOne({_id: ans_id}, {_id: 1}, function(err2, doc2){
                        if(err2){
                            log.error('modify offline answers error: ' + err2.message);
                            return callback(err2);
                        }else{
                            if(doc2){
                                //离线答案存在，可以编辑
                                //首先更新离线问题的一些基本信息，最后回复时间，最后回复的answer_id，但是回复数和回复指数不需要更新
                                db.offlineTopics.update({_id: off_id}, {
                                    $set: {
                                        lastReplyTime: curTime,
                                        lastReplyID: param.answer_id
                                    }
                                });
                                //然后对答案内容进行编辑，保存新内容
                                db.offlineAnswers.update({_id: ans_id}, {$set: setObj}, function (err3) {
                                    if (err3) {
                                        log.error('modify offline answers error: ' + err3.message);
                                        return callback(err3);
                                    } else {
                                        log.trace('modify offline answers success, userID=' + param.userID);
                                        callback(null, {_id: ans_id, answer_id: param.answer_id});
                                        //记录编辑离线问题答案的操作
                                        offlineOperate({userID: param.userID, operType: 'editAnswer', operID: param.answer_id});
                                    }
                                });
                            }else{
                                //离线答案不存在，返回错误
                                log.error('modify offline answer error: id not exists. answer_id=' + param.answer_id);
                                callback(new Error('编辑离线答案失败，离线答案ID不存在！'));
                            }
                        }
                    });
                } else {
                    //离线问题不存在，返回错误
                    log.error('reply offline topic error: id not exists. id=' + param.off_id);
                    callback(new Error('离线答案ID不存在！'));
                }
            }
        });
    } else {
        //这里面是新增离线答案的逻辑
        var info = {
            _id: new objectId(),        //answer_id
            author_id: param.userID,    //作者id
            off_id: param.off_id,       //离线回答id
            msg: msg_ok,         //内容
            ups: [],            //支持者id数组
            downs: [],          //反对者id数组
            upIndex: parseFloat(hot(0, 0, new Date(curTime))),     //点赞指数
            reply: 0,       //回复数
            replyIndex: parseFloat(hot(0, 0, new Date(curTime))),     //回复指数
            collect: 0,     //收藏数
            collectIndex: parseFloat(hot(0, 0, new Date(curTime))),    //收藏指数
            createTime: curTime,    //创建时间
            updateTime: curTime,    //修改时间
            delete: false       //预留删除标记
        };

        if (param.reply_id) {
            info.reply_id = param.reply_id; //回复某条评论的id
        }
        var _id = '';
        try {
            _id = new objectId(param.off_id);
        } catch (ex) {
            log.error('reply error: id ' + ex.message);
            callback(ex);
            return;
        }
        db.offlineTopics.findOne({_id: _id}, {reply: 1, updateTime: 1}, function (err, doc) {
            if (err) {
                log.error('reply offline topic error: ' + err.message);
                callback(err);
            } else {
                if (doc) {
                    //离线问题存在，可以回复
                    //首先更新离线问题的一些基本信息，保存最后回复时间，最后回复的answer_id，回复数，并且更新回复指数
                    db.offlineTopics.update({_id: _id}, {
                        $set: {
                            lastReplyTime: curTime,
                            lastReplyID: info._id.toString(),
                            replyIndex: parseFloat(hot((doc.reply || 0) + 1, 0, new Date(doc.updateTime)))
                        },
                        $inc: {reply: 1}
                    });
                    //更新分日回复数，加一
                    rankData({off_id: param.off_id, operate: 'reply'});

                    //然后回复内容进行保存
                    db.offlineAnswers.insert(info, function (err, doc) {
                        if (err) {
                            log.error('reply offline answers error: ' + err.message);
                            callback(err);
                        } else {
                            log.trace('reply offline answers success, userID=' + param.userID);
                            callback(null, info);
                            //记录回答离线问题的操作
                            offlineOperate({userID: info.author_id, operType: 'answer', operID: info._id.toString()});
                        }
                    });
                } else {
                    //离线问题不存在，返回错误
                    log.error('reply offline topic error: id not exists. id=' + param.off_id);
                    callback(new Error('离线问题ID不存在！'));
                }
            }
        });
    }
};


