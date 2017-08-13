/**
 * Created by MengLei on 2015/12/10.
 */
"use strict";
const model = require('../../model');
const eventproxy = require('eventproxy');
const ObjectId = require('mongoose').Types.ObjectId;
const User = require('../user/user');
const OfflineTopic = require('./offlineTopic');
const OfflineAnswer = require('./offlineAnswer');
const AnswerCollect = require('./answerCollect');
const OfflineAnsReply = model.OfflineAnsReply;
const offlineOperate = require('../../../orderServer/offlineAnswer/utils/offlineOperate');

/**
 * 根据ID查询离线回复的记录
 * Callback:
 * - err, 数据库异常
 * - doc, 离线回复内容
 * @param {String} id 离线回复ID
 * @param {Function} callback 回调函数
 */
exports.getOfflineReplyByID = function (id, callback) {
    OfflineAnsReply.findOne({_id: id}, callback);
};

/**
 * 根据answer_id和userID查询用户是否回复过该答案
 * Callback:
 * - err, 数据库异常
 * - doc, 是否回复过
 * @param {String} id 离线答案ID
 * @param {String} userID 用户userID
 * @param {Function} callback 回调函数
 */
exports.isExistReply = function (id, userID, callback) {
    OfflineAnsReply.findOne({answer_id: id, author_id: userID}, function (err, doc) {
        if (err) {
            return callback(err);
        }
        callback(null, !!doc);
    });
};

/**
 * 根据answer_reply_id支持、反对问题答案的回复
 * Callback:
 * - err, 数据库异常
 * - doc, 操作结果，true：操作成功，false：问题不存在
 * @param {String} answer_reply_id 离线问题ID
 * @param {String} userID 用户userID
 * @param {String} action 操作类型up/down/cancelup/canceldown
 * @param {Function} callback 回调函数
 */
exports.rateOfflineAnsReply = function (userID, answer_reply_id, action, callback) {
    OfflineAnsReply.findById(answer_reply_id, (err, ans_reply)=> {
        if (err) {
            return callback(err);
        }
        if (!ans_reply) {
            return callback();
        }
        let offlineOperParam = {userID: userID, operID: answer_reply_id};
        switch (action) {
            case 'down':
            {
                offlineOperParam['operType'] = 'downAnswer';
                if (ans_reply.downs.indexOf(userID) < 0) {//如果是没有反对过，那么就是加入反对
                    ans_reply.downs.push(userID);
                }
                if (ans_reply.ups.indexOf(userID) >= 0) {//还要判断之前是否支持过，如果支持过，那么一定要取消支持
                    ans_reply.ups.splice(ans_reply.ups.indexOf(userID), 1);
                }
            }
                break;
            case 'cancelup':
            {
                offlineOperParam['operType'] = 'cancelupAnswer';
                if (ans_reply.ups.indexOf(userID) >= 0) {//如果是已经支持过了，那么取消支持
                    ans_reply.ups.splice(ans_reply.ups.indexOf(userID), 1);
                }
            }
                break;
            case 'canceldown':
            {
                offlineOperParam['operType'] = 'canceldownAnswer';
                if (ans_reply.downs.indexOf(userID) >= 0) {//如果是已经反对过了，那么取消反对
                    ans_reply.downs.splice(ans_reply.downs.indexOf(userID), 1);
                }
            }
                break;
            case 'up':
            default:
            {
                offlineOperParam['operType'] = 'upAnswer';
                if (ans_reply.ups.indexOf(userID) < 0) {//如果是没有支持过，那么就是加入支持
                    ans_reply.ups.push(userID);
                }
                if (ans_reply.downs.indexOf(userID) >= 0) {//还要判断之前是否反对过，如果反对过，那么一定要取消反对
                    ans_reply.downs.splice(ans_reply.downs.indexOf(userID), 1);
                }
            }
                break;
        }
        ans_reply.save(callback);
        //记录操作信息
        offlineOperate(offlineOperParam);
    });
};


/**
 * 根据ID查询离线回复记录详情，包括作者信息等各种字段
 * Callback:
 * - err, 数据库异常
 * - doc, 离线问题内容
 * @param {String} id 离线答案ID
 * @param {String} userID '我'的userID
 * @param {String} operUserID 对问题进行操作的用户的userID
 * @param {Function} callback 回调函数
 */
exports.getOfflineReplyItem = function (id, userID, operUserID, callback) {
    OfflineAnsReply.findOne({_id: id}, function (err, doc) {
        if (err) {
            callback(err);
        } else {
            if (!doc) {//空记录
                return callback();
            }
            var item = doc.toObject({getter: true});
            item.ups = doc.ups.length;
            item.up = doc.ups.indexOf(userID) >= 0;
            item.downs = doc.downs.length;
            item.down = doc.downs.indexOf(userID) >= 0;
            var ep = new eventproxy();
            ep.all('topic', 'answer', 'author', 'user', function (topic, answer, author, user) {
                //
                item.topic = topic;
                item.summary = answer;
                item.author_nick = author.nick;
                item.author_avatar = author.avatar;
                if (operUserID) {
                    item.userInfo = user;
                }
                callback(null, item);
            });
            ep.fail(callback);
            //离线问题的信息
            OfflineTopic.getOfflineTopicByID(item.off_id, ep.done('topic', function (doc2) {
                return !!doc2 ? (doc2.topic || '') : '';
            }));
            //答案的摘要信息
            OfflineAnswer.getOfflineAnswerSummaryByID(item.answer_id, ep.done('answer'));
            //答案的回复的作者信息
            User.getUserById(item.author_id, ep.done('author', function (doc2) {
                return !!doc2 ? {
                    userID: doc2._id.toString(),
                    nick: doc2.nick,
                    avatar: doc2.userInfo.avatar || ''
                } : {userID: '', nick: '', avatar: ''};
            }));
            //执行操作的用户的信息
            if (operUserID) {
                User.getUserById(operUserID, ep.done('user', function (doc2) {
                    return !!doc2 ? {
                        userID: doc2._id.toString(),
                        nick: doc2.nick,
                        avatar: doc2.userInfo.avatar || ''
                    } : {userID: '', nick: '', avatar: ''};
                }));
            } else {
                ep.emit('user', null);
            }
        }
    });
};

/**
 * 获取某个离线答案的回复列表
 * Callback:
 * - err, 数据库异常
 * - doc, 离线问题内容
 * @param {Object} param = {userID: '', answer_id: '', startPos: '', pageSize: ''}
 * @param {Function} callback 回调函数
 */
exports.getList = function (param, callback) {
    let query = {delete: false, answer_id: param.answer_id};
    let start = Number.parseInt(param.startPos || '1') - 1;
    let count = Number.parseInt(param.pageSize || '10');
    OfflineAnsReply.find(query).sort({createTime: -1}).skip(start).limit(count).exec((err, replies)=> {
        if (err) {
            return callback(err);
        }
        if (replies.length == 0) {
            return callback(null, []);
        }
        replyList(replies, param.userID, callback);
    });
};

/**
 * 创建、编辑离线回复
 * Callback:
 * - err, 数据库异常
 * - doc, 离线问题内容
 * @param {Object} info 离线回复内容{userID: '', answer_reply_id: '', off_id: '', answer_id: '', reply_id: '', msg: ''}，限制只能是纯文本
 * @param {Function} callback 回调函数
 */
exports.editReply = function (info, callback) {
    var reply = new OfflineAnsReply();
    let ep = eventproxy.create('answer', 'reply', (answer, reply)=> {
        if (!answer) {
            return callback(new Error('离线答案ID对应内容不存在！'), 915);
        }
        if (!reply) {
            return callback(new Error('离线答案的回复ID对应内容不存在！'), 915);
        }
        if (info.msg != undefined) {
            reply.msg = info.msg;
        }
        if (info.answer_reply_id) {   //编辑
            if (reply.author_id != info.userID) {
                return callback(new Error('用户无权编辑不是自己的回复！'), 917);
            }
            offlineOperate({userID: reply.author_id, operType: 'editReply', operID: reply.answer_reply_id});
            reply.updateTime = Date.now();
        } else {  //新建
            reply._id = new ObjectId();
            if (info.userID != undefined) {
                reply.author_id = info.userID;
            }
            if (info.off_id != undefined) {
                reply.off_id = info.off_id;
            }
            if (info.answer_id != undefined) {
                reply.answer_id = info.answer_id;
            }
            if (info.reply_id != undefined) {
                reply.reply_id = info.reply_id;
            }
            answer.reply++;
            answer.save();
            offlineOperate({userID: reply.author_id, operType: 'reply', operID: reply.answer_reply_id});
        }
        reply.save(callback);
    });
    if (info.answer_reply_id) {
        OfflineAnsReply.findById(info.answer_reply_id, ep.done('reply'));
    } else {
        ep.emit('reply', new OfflineAnsReply());
    }
    OfflineAnswer.getOfflineAnswerByID(info.answer_id, ep.done('answer'));
};


/**
 * 组织离线列表的回复列表
 * Callback:
 * - err, 数据库异常
 * - doc, 离线问题内容
 * @param {Array} replies 数据库中查出来的离线答案的回复列表
 * @param {String} userID 用户ID（有可能为空）
 * @param {Function} callback 回调函数
 */
function replyList(replies, userID, callback) {
    let list = [];
    let authors = [];
    for (let i = 0; i < replies.length; i++) {
        list.push({
            answer_reply_id: replies[i].answer_reply_id,
            off_id: replies[i].off_id,
            answer_id: replies[i].answer_id,
            author_id: replies[i].author_id,
            author_nick: '',
            author_avatar: '',
            msg: replies[i].msg,
            createTime: replies[i].createTime,
            reply_id: replies[i].reply_id,
            delete: replies[i].delete,
            ups: replies[i].ups.length,
            up: replies[i].ups.indexOf(userID) >= 0,
            downs: replies[i].downs.length,
            down: replies[i].downs.indexOf(userID) >= 0
        });
        authors.push(replies[i].author_id);
    }
    model.User.find({_id: {$in: authors}}, {nick: 1, 'userInfo.avatar': 1}, (err, users)=> {
        if (err) {
            return callback(err);
        }
        for (let i = 0; i < list.length; i++) {
            for (let j = 0; j < users.length; j++) {
                if (list[i].author_id == users[j].userID) {
                    list[i].author_nick = users[j].nick;
                    list[i].author_avatar = users[j].userInfo.avatar || '';
                }
            }
        }
        callback(null, list);
    });
}
