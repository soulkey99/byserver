/**
 * Created by MengLei on 2015/9/7.
 */

var db = require('../../../config').db;
var config = require('../../../config');
var objectId = require('mongojs').ObjectId;
var eventproxy = require('eventproxy');
var log = require('./../../../utils/log').order;

//用户的各种离线操作，都在这里进行记录，param={userID: '', operType: '', operID: '', time: 123}，如果有传进来的时间，就取
//传进来的时间，否则就取当前时间
//operType：topic发布离线问题，answer回答离线问题，editAnswer编辑离线回答，reply评论离线答案，upAnswer支持离线答案，downAnswer反对离线答案，
//cancelupAnswer取消支持离线答案，canceldownAnswer取消反对离线答案，upReply支持离线回复，downReply反对离线回复，cancelupReply取消支持离线回复，
//canceldownReply取消反对离线回复，watchTopic关注离线问题，unwatchTopic取消关注离线问题，collectTopic收藏离线问题，uncollectTopic取消收藏离线问题，
//collectAnswer收藏离线答案，uncollecteAnswer取消收藏离线答案，follow关注了用户，unfollow取消关注，
module.exports = function (param) {
    //
    if (param.operType) {//只有操作类型为非空的时候，才允许记录
        var curTime = (new Date()).getTime();
        db.offlineOperate.insert({
            userID: param.userID,
            operType: param.operType,
            operID: param.operID,
            time: param.time || curTime,
            display: true
        });
        //操作的时候，还要判断一下，如果24小时之内有相同的操作，那么将之前那个操作在圈子中隐藏，不再显示
        var query = {
            userID: param.userID,
            operType: param.operType,
            operID: param.operID,
            time: {$gte: curTime - 86400000, $lte: curTime - 1500}
        };
        // console.log(JSON.stringify(query));
        db.offlineOperate.update(query, {$set: {display: false}}, {multi: true});
        //收件箱相关
        msgBox(param);
    }
};


//下面是收件箱相关的(关注问题、收藏答案、回答问题、回复答案、赞答案、赞回复、关注用户)
function msgBox(param) {
    switch (param.operType) {
        case 'watchTopic'://关注离线问题
        case 'unwatchTopic'://取消关注离线问题
            watchTopic(param, addMsg);
            break;
        case 'collectAnswer'://收藏离线答案
        case 'uncollectAnswer'://取消收藏离线答案
            collectAnswer(param, addMsg);
            break;

        case 'answer'://回答离线问题
            answerTopic(param, addMsg);
            break;
        case 'upAnswer'://支持离线答案
        case 'downAnswer'://反对离线答案
        case 'cancelupAnswer'://取消支持离线答案
        case 'canceldownAnswer'://取消反对离线答案
            rateAnswer(param, addMsg);
            break;
        case 'reply'://评论离线答案
            replyAnswer(param, addMsg);
            break;
        case 'upReply'://支持离线回复
        case 'downReply'://反对离线回复
        case 'cancelupReply'://取消支持离线回复
        case 'canceldownReply'://取消反对离线回复
            rateReply(param, addMsg);
            break;
        case 'follow'://关注了用户
        case 'unfollow'://取消关注
            follow(param, addMsg);
            break;
        default :
            break;
    }
}

//对于关注类、收藏类的操作，只通知作者
function watchTopic(param, callback) {//关注问题
    db.offlineTopics.findOne({_id: new objectId(param.operID)}, {author_id: 1}, function (err, doc) {
        if (err) {
            //
        } else {
            if (doc) {
                callback(param, [{type: 'owner', u_type: 'owner', u_id: doc.author_id}]);
            }
        }
    });
}

function collectAnswer(param, callback) {//收藏答案
    db.offlineAnswers.findOne({_id: new objectId(param.operID)}, {author_id: 1}, function (err, doc) {
        if (err) {
            //
        } else {
            if (doc) {
                callback(param, [{type: 'owner', u_id: doc.author_id}]);
            }
        }
    })
}

//回答问题，通知问题的作者及所有关注者
function answerTopic(param, callback) {
    db.offlineAnswers.findOne({_id: new objectId(param.operID)}, {off_id: 1}, function (err, doc) {
        if (err) {
            //
        } else {
            if (doc) {
                db.offlineTopics.findOne({_id: new objectId(doc.off_id)}, {author_id: 1}, function (err2, doc2) {
                    if (err2) {
                        //
                    } else {
                        if (doc2) {
                            db.topicWatch.find({off_id: doc.off_id}, {userID: 1}, function (err3, doc3) {
                                if (err3) {
                                    //
                                } else {
                                    //查找到曾经关注过这个问题的人
                                    var list = [{type: 'owner', u_id: doc2.author_id}];
                                    for (var i = 0; i < doc3.length; i++) {
                                        if (doc3[i].userID == doc2.author_id) {
                                            //如果关注者列表中有作者（作者关注了自己的问题），那么就不以关注者的身份给作者发通知
                                        } else {
                                            list.push({type: 'watcher', u_id: doc3[i].userID});
                                        }
                                    }
                                    callback(param, list);
                                }
                            });
                        }
                    }
                });
            }
        }
    });
}

//回复答案，通知答案的作者及关注者（暂时没有关注者）
function replyAnswer(param, callback) {
    db.offlineAnsReply.findOne({_id: new objectId(param.operID)}, {answer_id: 1}, function (err, doc) {
        if (err) {
            //
        } else {
            if (doc) {
                db.offlineAnswers.findOne({_id: new objectId(doc.answer_id)}, {author_id: 1}, function (err2, doc2) {
                    if (err2) {
                        //
                    } else {
                        if (doc2) {
                            callback(param, [{type: 'owner', u_id: doc2.author_id}]);
                        }
                    }
                });
            }
        }
    });
}

//赞同，通知作者以及所有关注者（暂时没有关注）
function rateAnswer(param, callback) {//赞同答案
    db.offlineAnswers.findOne({_id: new objectId(param.operID)}, {author_id: 1}, function (err, doc) {
        if (err) {
            //
        } else {
            if (doc) {
                callback(param, [{type: 'owner', u_id: doc.author_id}]);
            }
        }
    });
}
function rateReply(param, callback) {//赞同回复
    db.offlineAnswers.findOne({_id: new objectId(param.operID)}, {author_id: 1}, function (err, doc) {
        if (err) {
            //
        } else {
            if (doc) {
                callback(param, [{type: 'owner', u_id: doc.author_id}]);
            }
        }
    });
}
//关注、取消关注，通知被操作的人
function follow(param, callback) {
    callback(param, [{type: 'self', u_id: param.operID}]);
}


//增加消息记录
function addMsg(param, list) {
    for (var i = 0; i < list.length; i++) {
        var item = {
            from: 'system',
            to: list[i].u_id,
            type: param.operType,
            detail: {
                u_id: param.userID, //发出动作者的id
                type: list[i].type,  //接受动作者与下面这个id的关系（作者、关注者？）
                id: param.operID    //接受动作的topic、answer、reply、user的id
            },
            time: (new Date()).getTime(),
            display: true,
            delete: false,
            read: false
        };
        db.msgbox.insert(item);
    }
}

