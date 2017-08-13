/**
 * Created by MengLei on 2015/12/10.
 */
"use strict";
const model = require('../../model');
const eventproxy = require('eventproxy');
const User = require('./../user/user');
const OfflineTopic = require('./offlineTopic');
const AnswerCollect = require('./answerCollect');
const OfflineAnsReply = require('./offlineAnsReply');
const OfflineAnswer = model.OfflineAnswer;
const ObjectId = require('mongoose').Types.ObjectId;
const bonusProxy = require('./../bonus');
const RankData = require('./rankData');
const offlineOperate = require('../../../orderServer/offlineAnswer/utils/offlineOperate');

/**
 * 根据ID查询离线答案记录
 * Callback:
 * - err, 数据库异常
 * - doc, 离线问题内容
 * @param {String} id 离线问题ID
 * @param {Function} callback 回调函数
 */
exports.getOfflineAnswerByID = function (id, callback) {
    OfflineAnswer.findOne({_id: id}, callback);
};

/**
 * 根据ID查询离线答案数
 * Callback:
 * - err, 数据库异常
 * - doc, 离线答案数
 * @param {String} id 用户userID
 * @param {Function} callback 回调函数
 */
exports.getAnswerCount = function (id, callback) {
    OfflineAnswer.count({author_id: id}, callback);
};

/**
 * 根据query查询离线答案记录
 * Callback:
 * - err, 数据库异常
 * - doc, 离线问题内容
 * @param {Object} query 查询条件
 * @param {Object} path 查询条件
 * @param {Object} opt 查询条件
 * @param {Function} callback 回调函数
 */
exports.getOfflineAnswersByQuery = function (query, path, opt, callback) {
    OfflineAnswer.find(query, path, opt, callback);
};

/**
 * 根据ID查询离线答案的摘要
 * Callback:
 * - err, 数据库异常
 * - doc, 离线问题内容
 * @param {String} id 离线答案ID
 * @param {Function} callback 回调函数
 */
exports.getOfflineAnswerSummaryByID = function (id, callback) {
    OfflineAnswer.findOne({_id: id}, function (err, doc) {
        if (err) {
            return callback(err);
        }
        var summary = {
            text: '',
            voice: false,
            image: false
        };
        if (doc) {
            //生成一个答案摘要，在返回某题的答案列表的时候，不需要返回每条答案全部内容，只要截取一条文字并返回是否有图片、语音即可
            //返回的文字只要截取前70个字
            for (var j = doc.msg.length - 1; j >= 0; j--) {
                switch (doc.msg[j].type) {
                    case 'text':
                    {//文字消息
                        summary.text = doc.msg[j].msg;
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
        }
        callback(null, summary);
    });
};

/**
 * 根据off_id和userID查询用户是否回答过该问题
 * Callback:
 * - err, 数据库异常
 * - doc, 离线问题内容
 * @param {String} off_id 离线问题ID
 * @param {String} userID 用户userID
 * @param {Function} callback 回调函数
 */
exports.isExistAnswer = function (off_id, userID, callback) {
    OfflineAnswer.findOne({off_id: off_id, author_id: userID}, function (err, doc) {
        if (err) {
            return callback(err);
        }
        callback(null, !!doc);
    });
};

/**
 * 根据answer_id支持、反对问题的答案
 * Callback:
 * - err, 数据库异常
 * - doc, 操作结果，true：操作成功，false：问题不存在
 * @param {String} answer_id 离线问题ID
 * @param {String} userID 用户userID
 * @param {String} action 操作类型up/down/cancelup/canceldown
 * @param {Function} callback 回调函数
 */
exports.rateAnswer = function (userID, answer_id, action, callback) {
    OfflineAnswer.findOne({_id: answer_id}, function (err, doc) {
        if (err) {
            return callback(err);
        }
        if (!doc) {
            return callback(null, false);
        }
        var offlineOperParam = {userID: userID, operID: answer_id};  //记录离线操作用的参数
        switch (action) {
            case 'down':    //反对
            {
                offlineOperParam.operType = 'downAnswer';
                //如果是没有反对过，那么就是加入反对
                if (doc.downs.indexOf(userID) < 0) {
                    doc.downs.push(userID);
                }
                //还要判断之前是否支持过，如果支持过，那么一定要取消支持
                if (doc.ups.indexOf(userID) >= 0) {
                    doc.ups.splice(doc.ups.indexOf(userID), 1);
                    bonusProxy.upAnswer({userID: userID, answer_id: answer_id, action: 'cancelup'});
                }
            }
                break;
            case 'cancelup':    //取消支持
            {
                offlineOperParam.operType = 'cancelupAnswer';
                //如果是已经支持过了，那么取消支持
                if (doc.ups.indexOf(userID) >= 0) {
                    doc.ups.splice(doc.ups.indexOf(userID), 1);
                    bonusProxy.upAnswer({userID: userID, answer_id: answer_id, action: 'cancelup'});
                }
            }
                break;
            case 'canceldown':  //取消反对
            {
                offlineOperParam.operType = 'canceldownAnswer';
                //如果是已经反对过了，那么取消反对
                if (doc.downs.indexOf(userID) >= 0) {
                    doc.downs.splice(doc.downs.indexOf(userID), 1);
                }
            }
                break;
            case 'up':  //支持
            default:    //默认，支持
            {
                offlineOperParam.operType = 'upAnswer';
                //如果是没有支持过，那么就是加入支持
                if (doc.ups.indexOf(userID) < 0) {
                    doc.ups.push(userID);
                    bonusProxy.upAnswer({userID: userID, answer_id: answer_id, action: 'up'});
                }
                //还要判断之前是否反对过，如果反对过，那么一定要取消反对
                if (doc.downs.indexOf(userID) >= 0) {
                    doc.downs.splice(doc.downs.indexOf(userID), 1);
                }
            }
                break;
        }
        doc.save(callback);
        //记录操作信息
        offlineOperate(offlineOperParam);
    });
};

/**
 * 获取我回复过的离线问答列表
 * Callback:
 * - err, 数据库异常
 * - doc, 操作结果
 * @param {Object} param = {userID: '', u_id: '', startPos: '', pageSize: '', tab: 'time/collect/watch/reply'};
 * @param {Function} callback 回调函数
 */
exports.getMyOfflineAnswers = function (param, callback) {
    let author_id = param.u_id || param.userID;
    let start = Number.parseInt(param.startPos || '1') - 1;
    let count = Number.parseInt(param.pageSize || '10');
    let sort = {createTime: -1};
    switch (param.tab) {
        case 'collect':
            sort = {collect: -1};
            break;
        case 'up':
            sort = {upIndex: -1};
            break;
        case 'reply':
            sort = {reply: -1};
            break;
        default :
            break;
    }
    OfflineAnswer.find({
        author_id: author_id,
        delete: false
    }).sort(sort).skip(start).limit(count).exec((err, answers)=> {
        if (err) {
            return callback(err);
        }
        answerList(answers, param.userID, callback);
    });
};

/**
 * 获取离线答案详情
 * Callback:
 * - err, 数据库异常
 * - doc, 离线问题id list
 * @param {String} answer_id 离线答案ID
 * @param {String} userID 用户ID（可传空）
 * @param {Function} callback 回调函数
 */
exports.getDetail = function (answer_id, userID, callback) {
    OfflineAnswer.findById(answer_id, (err, answer)=> {
        if (err) {
            return callback(err);
        }
        if (!answer) {
            return callback();
        }
        answerItem(answer, userID, '', callback);
    });
};

/**
 * 组织离线答案记录详情，包括作者信息等各种字段（如果传operUserID，那么以userInfo的形式返回该用户的信息）
 * Callback:
 * - err, 数据库异常
 * - doc, 离线问题内容
 * @param {Object} answer 离线答案内容
 * @param {String} userID '我'的userID
 * @param {String} operUserID 对问题进行操作的用户的userID
 * @param {Function} callback 回调函数
 */
function answerItem(answer, userID, operUserID, callback) {
    let detail = {
        answer_id: answer.answer_id,
        off_id: answer.off_id,
        author_id: answer.author_id,
        author_nick: '',
        author_avatar: '',
        createTime: answer.createTime,
        updateTime: answer.updateTime || doc[i].createTime,  //没有更新时间的，取创建时间
        reply: answer.reply,
        topic: '',
        msg: answer.msg,
        q_summary: {},
        replied: false,
        collected: false,
        reply_id: answer.reply_id,
        delete: answer.delete,
        ups: answer.ups.length,
        up: (answer.ups.indexOf(userID) >= 0),
        downs: answer.downs.length,
        down: (answer.downs.indexOf(userID) >= 0)
    };
    var summary = {
        text: '',
        voice: false,
        image: false
    };
    //生成一个答案摘要，在返回某题的答案列表的时候，不需要返回每条答案全部内容，只要截取一条文字并返回是否有图片、语音即可
    //返回的文字只要截取前70个字
    for (var j = answer.msg.length - 1; j >= 0; j--) {
        switch (answer.msg[j].type) {
            case 'text':
            {//文字消息
                summary.text = answer.msg[j].msg.substr(0, 70);
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
    detail.summary = summary;
    //最终处理，组合数据，返回结果
    let ep = eventproxy.create('topic', 'author', 'user', 'collect', 'reply', (topic, author, user, collect, reply) => {
        //
        detail.topic = topic;
        detail.author_nick = author.nick;
        detail.author_avatar = author.avatar;
        if (operUserID) {
            detail.userInfo = user;
        }
        detail.collected = collect;
        detail.replied = reply;
        callback(null, detail);
    });
    //失败处理
    ep.fail(callback);
    //答案的问题信息
    OfflineTopic.getOfflineTopicByID(detail.off_id, ep.done('topic', doc2 => !!doc2 ? doc2.topic : ''));
    if (operUserID) {
        //执行操作的用户信息
        User.getUserById(operUserID, ep.done('user', doc2=>!!doc2 ? {
            userID: doc2._id.toString(),
            nick: doc2.nick,
            avatar: doc2.userInfo.avatar || ''
        } : null));
    } else {
        ep.emit('user', null);
    }
    //答案的作者信息
    User.getUserById(detail.author_id, ep.done('author', doc2=>!!doc2 ? {
        nick: doc2.nick,
        avatar: doc2.userInfo.avatar || ''
    } : {nick: '', avatar: ''}));
    if (userID) {
        AnswerCollect.isCollect(detail.answer_id, userID, ep.done('collect'));//是否收藏过
        OfflineAnsReply.isExistReply(detail.answer_id, userID, ep.done('reply'));//是否回复过
    } else {
        ep.emit('collect', false);
        ep.emit('reply', false);
    }

}
exports.answerItem = answerItem;

/**
 * 选定某个答案为最佳答案
 * Callback:
 * - err, 数据库异常
 * - doc, 离线问题内容
 * @param {Object} param = {userID: '', off_id: '', answer_id: ''}
 * @param {Function} callback 回调函数
 */
exports.judgeAnswer = function (param, callback) {
    OfflineTopic.getOfflineTopicByID(param.off_id, (err, topic)=> {
        if (err) {
            return callback(err);
        }
        if (!topic) {
            return callback(new Error('离线问题ID对应内容不存在！'), 914);
        }
        if (topic.author_id != param.userID) {
            return callback(new Error('无权操作不是自己的订单！'), 917);
        }
        if (topic.status != 'open') {
            return callback(new Error('订单状态不允许！'), 916);
        }
        OfflineAnswer.findById(param.answer_id, (err, answer)=> {
            if (err) {
                return callback(err);
            }
            if (!answer) {
                return callback(new Error('离线问题答案ID对应内容不存在！'), 915);
            }
            if (answer.off_id != topic.off_id) {
                return callback(new Error('离线问题答案ID对应内容不存在！'), 915);
            }
            topic.status = 'judge';
            topic.judgeTime = Date.now();
            topic.judgeAnswerID = param.answer_id;
            topic.save(callback);
        });
    });
};


/**
 * 获取某个问题的离线答案列表
 * Callback:
 * - err, 数据库异常
 * - doc, 离线问题内容
 * @param {Object} param = {userID: '', off_id: '', startPos: '', pageSize: '', sort: 'asc/desc'}
 * sort=asc，按照时间升序，sort=desc：按照时间降序，默认按照点赞指数排序
 * @param {Function} callback 回调函数
 */
exports.getList = function (param, callback) {
    let query = {off_id: param.off_id, delete: false};
    let start = Number.parseInt(param.startPos || '1') - 1;
    let count = Number.parseInt(param.pageSize || '10');
    let sort = {};
    switch (param.sort) {
        case 'asc':
            sort = {createTime: 1};
            break;
        case 'desc':
            sort = {createTime: -1};
            break;
        default:
            sort = {upIndex: -1};
            break;
    }
    OfflineAnswer.find(query).sort(sort).skip(start).limit(count).exec((err, answers)=> {
        if (err) {
            return callback(err);
        }
        if (answers.length == 0) {
            return callback(null, []);
        }
        answerList(answers, param.userID, callback);
    });
};

/**
 * 创建、编辑离线答案
 * Callback:
 * - err, 数据库异常
 * - doc, 离线问题内容
 * @param {Object} info 离线答案内容{userID: '', answer_id: '可选，编辑时才传递', off_id: '', msg: [], reply_id: ''}
 * @param {Function} callback 回调函数
 */
exports.editAnswer = function (info, callback) {
    var answer = new OfflineAnswer();
    let ep = eventproxy.create('topic', 'answer', (topic, answer) => {
        if (!topic) {
            return callback(new Error('离线问题ID对应内容不存在！'), 914);
        }
        if (!answer) {
            return callback(new Error('离线答案ID对应内容不存在！'), 915);
        }
        if (info.msg) {
            try {
                info.msg = JSON.parse(info.msg);
            } catch (ex) {
                return callback(new Error('离线回答消息json解析错误！'), 942);
            }
        }
        if (info.msg != undefined) {
            let msg_ok = [];    //预处理一下
            for (let i = 0; i < info.msg.length; i++) {
                let item = {type: info.msg[i].type, seq: info.msg[i].seq || (i + 1), msg: info.msg[i].msg || ''};
                switch (info.msg[i].type) {
                    case 'voice'://语音
                        item.time = info.msg[i].time;
                        break;
                    case 'image'://图片
                        item.orientation = info.msg[i].orientation;
                        break;
                    default ://默认按照文字的方式
                        break;
                }
                msg_ok.push(item);
            }
            answer.msg = msg_ok;
        }
        if (info.answer_id) {   //是编辑回复
            if (answer.author_id != info.userID) {
                return callback(new Error('用户无权编辑不是自己的答案！'), 917);
            }
            offlineOperate({userID: info.userID, operType: 'editAnswer', operID: answer.answer_id});
            answer.updateTime = Date.now(); //是编辑，更新updateTime
        } else {    //是新增回复
            answer.author_id = info.userID;
            answer._id = new ObjectId();
            if (info.off_id != undefined) {
                answer.off_id = info.off_id;
            }
            if (info.reply_id != undefined) {
                answer.reply_id = info.reply_id;
            }
            RankData.onReply(topic.off_id);
            offlineOperate({userID: info.userID, operType: 'answer', operID: answer.answer_id});
            topic.reply++;
            topic.lastReplyTime = Date.now();
            topic.lastReplyID = answer.answer_id;
            topic.save();
        }
        answer.save(callback);
    });
    ep.fail(callback);
    if (info.answer_id) {
        OfflineAnswer.findById(info.answer_id, ep.done('answer'));
    } else {
        ep.emit('answer', new OfflineAnswer());
    }
    OfflineTopic.getOfflineTopicByID(info.off_id, ep.done('topic'));
};

/**
 * 组织离线问题的答案列表
 * Callback:
 * - err, 数据库异常
 * - doc, 离线问题内容
 * @param {Array} answers 数据库中查出来的离线答案列表
 * @param {String} userID 用户ID（有可能为空）
 * @param {Function} callback 回调函数
 */
function answerList(answers, userID, callback) {
    let authors = [];
    let answer_ids = [];
    let off_ids = [];
    let list = [];
    for (let i = 0; i < answers.length; i++) {
        let item = {
            answer_id: answers[i].answer_id,
            off_id: answers[i].off_id,
            author_id: answers[i].author_id,
            author_nick: '',
            author_avatar: '',
            createTime: answers[i].createTime,
            updateTime: answers[i].updateTime || doc[i].createTime,  //没有更新时间的，取创建时间
            reply: answers[i].reply,
            topic: '',
            q_summary: {},
            replied: false,
            collected: false,
            reply_id: answers[i].reply_id,
            delete: answers[i].delete,
            ups: answers[i].ups.length,
            up: (answers[i].ups.indexOf(userID) >= 0),
            downs: answers[i].downs.length,
            down: (answers[i].downs.indexOf(userID) >= 0)
        };
        answer_ids.push(item.answer_id);
        authors.push(item.author_id);
        off_ids.push(item.off_id);
        let summary = {
            text: '',
            voice: false,
            image: false
        };
        //生成一个答案摘要，在返回某题的答案列表的时候，不需要返回每条答案全部内容，只要截取一条文字并返回是否有图片、语音即可
        //返回的文字只要截取前70个字
        for (let j = answers[i].msg.length - 1; j >= 0; j--) {
            switch (answers[i].msg[j].type) {
                case 'text':
                {//文字消息
                    summary.text = answers[i].msg[j].msg.substr(0, 70);
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
    }
    let ep = eventproxy.create('user', 'topic', 'reply', 'collect', (user, topic, reply, collect)=> {
        let replied = [];
        let collected = [];
        for (let i = 0; i < reply.length; i++) {
            replied.push(reply[i].answer_id);
        }
        for (let i = 0; i < collect.length; i++) {
            collected.push(collect[i].answer_id);
        }
        for (let i = 0; i < list.length; i++) {
            for (let j = 0; j < user.length; j++) {
                if (list[i].author_id == user[j].userID) {
                    list[i].author_nick = user[j].nick;
                    list[i].author_avatar = user[j].userInfo.avatar || '';
                }
            }
            list[i].replied = (replied.indexOf(list[i].answer_id) >= 0);
            list[i].collected = (collected.indexOf(list[i].answer_id) >= 0);
            for (let k = 0; k < topic.length; k++) {
                if (list[i].off_id == topic[k].off_id) {
                    list[i].topic = topic[k].topic;
                    //生成一个问题摘要
                    let q_summary = {
                        text: '',    //一条文字
                        image: '',      //一条图片
                        orientation: '',    //图片方向
                        voice: '',      //一条语音
                        time: 0        //语音时长
                    };
                    for (let ki = 0; ki < topic[k].q_msg.length; ki++) {
                        switch (topic[k].q_msg[ki].type) {
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
    ep.fail(callback);
    model.User.find({_id: {$in: authors}}, {nick: 1, 'userInfo.avatar': 1}, ep.done('user'));
    model.OfflineTopic.find({_id: {$in: off_ids}}, {tag: 1, topic: 1, q_msg: 1}, ep.done('topic'));
    model.OfflineAnsReply.find({author_id: userID, answer_id: {$in: answer_ids}}, {answer_id: 1}, ep.done('reply'));
    model.AnswerCollect.find({userID: userID, answer_id: {$in: answer_ids}}, {answer_id: 1}, ep.done('collect'));
}
exports.answerList = answerList;
