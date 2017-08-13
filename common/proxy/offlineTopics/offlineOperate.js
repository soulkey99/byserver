/**
 * Created by MengLei on 2016-05-30.
 */
"use strict";
const model = require('../../model');
const eventproxy = require('eventproxy');
const OfflineOperate = model.OfflineOperate;

/**
 * 添加一条离线操作记录
 * Callback;
 * - err, 数据库异常
 * - doc, 返回结果
 * @param {Object} param={userID: '', operType: '', operID: '', time: ''}
 * @param {Function} [callback] 回调函数
 */
exports.add = function (param, callback) {
    let oo = new OfflineOperate({userID: param.userID, operType: param.operType, operID: param.operID});
    oo.save(callback);
    OfflineOperate.update({
        userID: param.userID,
        operType: param.operType,
        operID: param.operID,
        time: {$gte: Date.now() - 86400000, $lte: Date.now() - 1500}
    }, {$set: {display: false}}, {multi: true}).exec();
};

/**
 * 添加一条收件箱相关的记录(关注问题、收藏答案、回答问题、回复答案、赞答案、赞回复、关注用户)
 * Callback;
 * - err, 数据库异常
 * - doc, 返回结果
 * @param {Object} param={userID: '', operType: '', operID: '', time: ''}
  */
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

/**
 * 获取我的朋友圈信息(我以及我关注的人和公众号的动态)
 * Callback;
 * - err, 数据库异常
 * - doc, 返回结果
 * @param {Object} param={userID: '', type: '', startPos: '', pageSize: '', time: 123}，type是过滤信息类型
 * @param {Function} callback 回调函数
 */
exports.getMyCircle = function (param, callback) {
    let start = Number.parseInt(param.startPos || '1') - 1;
    let count = Number.parseInt(param.pageSize || '10');
    let circleIDs = [param.userID];
    model.UserFollowing.findById(param.userID, (err, following)=> {
        if (err) {
            return callback(err);
        }
        if (following) {
            if (following.list) {
                following.list.forEach(item=> {
                    circleIDs.push(item);
                });
            }
            if (following.pubList) {
                following.pubList.forEach(item=> {
                    circleIDs.push(item);
                });
            }
        }
        let query = {userID: {$in: circleIDs}, display: true};
        if (param.type) {
            query['operType'] = {$in: param.type.split(',')};
        }
    });
};
