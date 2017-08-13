/**
 * Created by MengLei on 2015/12/9.
 */
"use strict";
const model = require('../../model');
const eventproxy = require('eventproxy');
const User = require('./../user/user');
const Tags = require('./tags');
const OfflineAnswer = require('./offlineAnswer');
const TopicCollect = require('./topicCollect');
const TopicWatch = require('./topicWatch');
const RankData = require('./rankData');
const OfflineTopic = model.OfflineTopic;

/**
 * 根据ID查询离线问题记录
 * Callback:
 * - err, 数据库异常
 * - doc, 离线问题内容
 * @param {String} id 离线问题ID
 * @param {Function} callback 回调函数
 */
exports.getOfflineTopicByID = function (id, callback) {
    OfflineTopic.findById(id, callback);
};

/**
 * 根据userID查询用户发帖数
 * Callback:
 * - err, 数据库异常
 * - doc, 离线问题数
 * @param {String} id 用户userID
 * @param {Function} callback 回调函数
 */
exports.getTopicCount = function (id, callback) {
    OfflineTopic.count({author_id: id}, callback);
};

/**
 * 根据给定条件查询离线问题记录
 * Callback:
 * - err, 数据库异常
 * - doc, 离线问题id list
 * @param {Object} query 给定条件
 * @param {Object} opt 给定条件
 * @param {Function} callback 回调函数
 */
exports.getOff_idsByQuery = function (query, opt, callback) {
    OfflineTopic.find(query, {_id: 1, updateTime: 1}, opt, callback);
};

/**
 * 根据给定条件查询“我”提出的离线问题
 * Callback:
 * - err, 数据库异常
 * - doc, 离线问题id list
 * @param {Object} param 给定条件param={userID: '', u_id: '', type: 'ask/reply', startPos: '', pageSize: '', tab: 'time/collect/watch/reply'}
 * @param {Function} callback 回调函数
 */
exports.getMyOfflineTopics = function (param, callback) {
    let author_id = param.u_id || param.userID;
    let start = Number.parseInt(param.startPos || '1') - 1;
    let count = Number.parseInt(param.pageSize || '10');
    let sort = {updateTime: -1};
    switch (param.tab) {
        case 'collect':
            sort = {collect: -1};
            break;
        case 'watch':
            sort = {watch: -1};
            break;
        case 'reply':
            sort = {reply: -1};
            break;
        default :
            break;
    }
    let ep = new eventproxy();
    ep.all('query', (query)=> {
        query.sort(sort).skip(start).limit(count).exec((err, topics)=> {
            if (err) {
                return callback(err);
            }
            topicList(topics, param.userID, callback);
        });
    });
    ep.fail(callback);
    //默认返回的是“我”提出的问题，只有当传type=reply的时候，才获取我的回答的问题
    if (param.type == 'reply') {
        OfflineAnswer.distinct('off_id', {author_id: author_id}, ep.done('query', (doc)=> {
            return OfflineTopic.find({_id: {$in: doc}});
        }));
    } else {
        ep.emit('query', OfflineTopic.find({author_id: author_id}));
    }
};

/**
 * 获取离线问题详情
 * Callback:
 * - err, 数据库异常
 * - doc, 离线问题id list
 * @param {String} off_id 离线问题ID
 * @param {String} userID 用户ID（可传空）
 * @param {Function} callback 回调函数
 */
exports.getDetail = function (off_id, userID, callback) {
    OfflineTopic.findById(off_id, (err, topic)=> {
        if (err) {
            return callback(err);
        }
        if (!topic) {
            return callback();
        }
        RankData.onClick(off_id);
        topic.visit++;
        topic.save();
        topicItem(topic, userID, '', callback);
    });
};

/**
 * 组织离线问题记录详情，包括作者信息等各种字段（如果传operUserID，那么以userInfo的形式返回该用户的信息）
 * Callback:
 * - err, 数据库异常
 * - doc, 离线问题内容
 * @param {Object} topic
 * @param {String} userID
 * @param {String} operUserID
 * @param {Function} callback 回调函数
 */
function topicItem(topic, userID, operUserID, callback) {
    let item = {
        off_id: topic.off_id,
        author_id: topic.author_id,
        author_nick: '',
        author_avatar: '',
        grade: topic.grade,
        subject: topic.subject,
        tag: topic.tag,
        topic: topic.topic || '',
        q_msg: topic.q_msg,
        createTime: topic.createTime,
        updateTime: topic.updateTime,
        lastReplyTime: topic.lastReplyTime,
        lastReplyID: topic.lastReplyID,
        collect: topic.collect,
        watch: topic.watch,
        visit: topic.visit,
        reply: topic.reply,
        replied: false,
        watched: false,
        collected: false,
        recommend: topic.recommend,
        bonus: topic.bonus,
        delete: topic.delete,
        status: topic.status,
        judgeTime: topic.judgeTime,
        judgeAnswerID: topic.judgeAnswerID
    };
    //下面对问题生成摘要
    var q_summary = {
        text: '',    //一条文字
        image: '',      //一条图片
        orientation: '',    //图片方向
        voice: '',      //一条语音
        time: 0        //语音时长
    };
    //生成一个问题摘要，只要截取一条文字一张图片一段语音即可，如果没有的话，也可以不取
    for (let j = item.q_msg.length - 1; j >= 0; j--) {
        switch (item.q_msg[j].type) {
            case 'text':
            {//文字消息
                q_summary.text = item.q_msg[j].msg;
            }
                break;
            case 'voice':
            {//语音消息
                q_summary.voice = item.q_msg[j].msg || '';
                q_summary.time = item.q_msg[j].time;
            }
                break;
            case 'image':
            {//图片消息
                q_summary.image = item.q_msg[j].msg || '';
                q_summary.orientation = item.q_msg[j].orientation;
            }
                break;
            default :
                break;
        }
    }
    item.q_summary = q_summary;
    //下面获取topic的详细信息
    var ep = new eventproxy();
    ep.all('author', 'user', 'watch', 'collect', 'answer', function (author, user, watch, collect, reply) {
        item.author_nick = author.nick || '';
        item.author_avatar = author.avatar || '';
        if (user) {  //只有user存在内容的时候，才进行赋值
            item.userInfo = user;
        }
        item.watched = watch;
        item.collected = collect;
        item.replied = reply;
        callback(null, item);
    });
    ep.fail(callback);

    if (operUserID) {
        //执行该操作的用户信息，operUserID有可能为空，则该信息直接返回null
        User.getUserById(operUserID, ep.done('user', function (doc2) {
            return !!doc2 ? {userID: doc2.userID, nick: doc2.nick, avatar: doc2.userInfo.avatar} : null;
        }));
    } else {
        ep.emit('user', null);
    }
    //topic作者的信息
    User.getUserById(item.author_id, ep.done('author', function (doc2) {
        return !!doc2 ? {userID: doc2.userID, nick: doc2.nick, avatar: doc2.userInfo.avatar} : {
            userID: '',
            nick: '',
            avatar: ''
        };
    }));
    if (userID) {//如果userID传空，那么接下来几个直接返回false
        TopicCollect.isCollect(item.off_id, userID, ep.done('collect'));//"我"是否收藏
        TopicWatch.isWatch(item.off_id, userID, ep.done('watch'));//"我"是否关注
        OfflineAnswer.isExistAnswer(item.off_id, userID, ep.done('answer'));//"我"是否回答
    } else {
        ep.emit('collect', false);
        ep.emit('watch', false);
        ep.emit('answer', false);
    }

}
exports.topicItem = topicItem;

/**
 * 根据指定条件获取离线问题列表
 * Callback:
 * - err, 数据库异常
 * - doc, 离线问题内容
 * @param {Object} param={userID: '', grade: '', subject: '', tag: [], startPos: ''. timestamp: '', pageSize: '', status: [], tab: '', startTime: '', endTime: '', section: ''}
 * //广场的每个tab传不同参数，tab='recommend'推荐，tab='hot'热门，tab='collect'最多收藏，tab='reply'最多回复，tab=instant转载即时订单，用不同的方式取列表
 * //startPos和timestamp两者二取一，timestamp优先
 * @param {Function} callback 回调函数
 */
exports.getList = function (param, callback) {
    let query = {delete: false};
    let sort = {lastReplyTime: -1, updateTime: -1, createTime: -1};
    let start = Number.parseInt(param.startPos || '1') - 1;
    let count = Number.parseInt(param.pageSize || '10');
    if (param.grade) {
        query['grade'] = param.grade;
    }
    if (param.subject) {
        query['subject'] = param.subject;
    }
    if (param.tag) {
        query['tag'] = {$in: param.tag};
    }
    if (param.status) {
        query['status'] = {$in: param.status};
    } else {//如果不指定状态，那么默认只排除已删除状态的，返回其他所有状态的
        query['status'] = {$nin: ['delete']};
    }
    switch (param.tab) {
        case 'recommend'://推荐专区
            query.recommend = true;
            break;
        case 'time'://最新发布
            sort = {updateTime: -1, createTime: -1};
            break;
        case 'hot'://热门问题
            query['reply'] = {$gte: 1};//回复数必须大于1
            sort = {visitIndex: -1, lastReplyTime: -1, updateTime: -1, createTime: -1};
            break;
        case 'collect'://最多收藏
            sort = {collectIndex: -1, lastReplyTime: -1, updateTime: -1, createTime: -1};
            break;
        case 'reply'://最多回复
            query.reply = {$gte: 1};//回复数必须大于1
            sort = {replyIndex: -1, lastReplyTime: -1, updateTime: -1, createTime: -1};
            break;
        case 'watch'://最多关注
            sort = {watchIndex: -1, lastReplyTime: -1, updateTime: -1, createTime: -1};
            break;
        default :
            break;
    }
    switch (param.section) { //广场分区
        case 'no_instant':  //无即时问答转化的问题分区
            query['section'] = {$ne: 'instant'};
            break;
        case 'all': //所有问题
            delete(query.section);
            break;
        default:
        {
            if (param.section) { //默认情况下，选择对应分区
                query['section'] = param.section;
            }
        }
            break;
    }
    if (param.startTime && param.endTime) {
        query['updateTime'] = {$gte: Number.parseFloat(param.startTime), $lte: Number.parseFloat(param.endTime)};
    } else if (param.startTime) {
        query['updateTime'] = {$gte: Number.parseFloat(param.startTime)};
    } else if (param.endTime) {
        query['updateTime'] = {$lte: Number.parseFloat(param.endTime)};
    }
    let q = OfflineTopic.find(query).sort(sort).skip(start);
    if ((param.tab == 'time') && param.timestamp) {
        query['updateTime'] = {$lt: Number.parseFloat(param.timestamp)};
        q = OfflineTopic.find(query).sort(sort);
    }
    q.limit(count).exec((err, topics)=> {
        if (err) {
            return callback(err);
        }
        if (topics.length == 0) {
            return callback(null, []);
        }
        topicList(topics, param.userID, callback);
    });
};


/**
 * 创建新的离线问题
 * Callback:
 * - err, 数据库异常
 * - doc, 离线问题内容
 * @param {Object} info 离线问题内容，info = {userID: '', topic: '', grade: '', subject: '', tag: [], q_msg: [], o_id: '', bonus: '', section: ''}
 * @param {Function} callback 回调函数
 */
exports.createOfflineTopic = function (info, callback) {
    var topic = new OfflineTopic();
    var curTime = Date.now();
    if (info._id != undefined) {
        topic._id = info._id;
    }
    if (info.userID != undefined) {
        topic.author_id = info.userID;
    }
    if (info.grade != undefined) {
        topic.grade = info.grade;
    }
    if (info.subject != undefined) {
        topic.subject = info.subject;
    }
    if (info.tag != undefined) {
        topic.tag = info.tag;
        Tags.rankTags({tags: info.tag, userID: info.userID});
    }
    if (info.q_msg != undefined) {
        topic.q_msg = info.q_msg;
    }
    if (info.o_id != undefined) {
        topic.o_id = info.o_id;
    }
    if (info.bonus != undefined) {
        topic.bonus = info.bonus;
    }
    if (info.topic != undefined) {
        topic.topic = info.topic;
    }
    if (info.section != undefined) {
        topic.section = info.section;
    }
    topic.createTime = curTime;
    topic.updateTime = curTime;
    topic.save(callback);
};

/**
 * 组织离线问题列表
 * Callback:
 * - err, 数据库异常
 * - doc, 离线问题内容
 * @param {Array} topics 数据库中查出来的离线问题列表
 * @param {String} userID 用户ID
 * @param {Function} callback 回调函数
 */
function topicList(topics, userID, callback) {
    let list = [];
    let authors = [];
    let off_ids = [];
    for (let i = 0; i < topics.length; i++) {
        let item = {
            off_id: topics[i].off_id,
            author_id: topics[i].author_id,
            author_nick: '',
            author_avatar: '',
            grade: topics[i].grade,
            subject: topics[i].subject,
            tag: topics[i].tag,
            topic: topics[i].topic || '',
            createTime: topics[i].createTime,
            updateTime: topics[i].updateTime,
            lastReplyTime: topics[i].lastReplyTime,
            collect: topics[i].collect,
            watch: topics[i].watch,
            visit: topics[i].visit,
            reply: topics[i].reply,
            replied: false,
            watched: false,
            collected: false,
            recommend: topics[i].recommend,
            bonus: topics[i].bonus,
            delete: topics[i].delete,
            status: topics[i].status
        };
        //所有的off_id和author_id
        off_ids.push(item.off_id);
        authors.push(item.author_id);
        //问题的空摘要，下面才会填入数据
        let q_summary = {
            text: '',    //一条文字
            image: '',      //一条图片
            orientation: '',    //图片方向
            voice: '',      //一条语音
            time: 0        //语音时长
        };
        //生成一个问题摘要，在返回列表的时候，不需要返回问题全部内容，只要截取一条文字一张图片一段语音即可，如果没有的话，也可以不取
        for (let j = topics[i].q_msg.length - 1; j >= 0; j--) {
            switch (topics[i].q_msg[j].type) {
                case 'text':
                {//文字消息
                    q_summary.text = topics[i].q_msg[j].msg;
                }
                    break;
                case 'voice':
                {//语音消息
                    q_summary.voice = topics[i].q_msg[j].msg || '';
                    q_summary.time = topics[i].q_msg[j].time;
                }
                    break;
                case 'image':
                {//图片消息
                    q_summary.image = topics[i].q_msg[j].msg || '';
                    q_summary.orientation = topics[i].q_msg[j].orientation;
                }
                    break;
                default :
                    break;
            }
        }
        item.q_summary = q_summary;
        list.push(item);
    }
    let ep = eventproxy.create('user', 'answer', 'watch', 'collect', (user, answer, watch, collect)=> {
        let replied = [];
        let watched = [];
        let collected = [];
        answer.forEach((item)=> {
            replied.push(item.off_id);
        });
        watch.forEach((item)=> {
            watched.push(item.off_id);
        });
        collect.forEach((item)=> {
            collected.push(item.off_id);
        });
        for (let i = 0; i < list.length; i++) {
            for (let j = 0; j < user.length; j++) {
                if (list[i].author_id == user[j].userID) {
                    list[i].author_nick = user[j].nick;
                    list[i].author_avatar = user[j].userInfo.avatar;
                }
            }
            //是否回复过
            list[i].replied = (replied.indexOf(list[i].off_id) >= 0);
            //是否关注过
            list[i].watched = (watched.indexOf(list[i].off_id) >= 0);
            //是否收藏过
            list[i].collected = (collected.indexOf(list[i].off_id) >= 0);
        }
        callback(null, list);
    });
    ep.fail(callback);
    model.User.find({_id: {$in: authors}}, {nick: 1, 'userInfo.avatar': 1}, ep.done('user'));//作者信息
    model.OfflineAnswer.find({author_id: userID, off_id: {$in: off_ids}}, {off_id: 1}, ep.done('answer'));//是否回答过
    model.TopicWatch.find({userID: userID, off_id: {$in: off_ids}}, ep.done('watch'));//是否关注过
    model.TopicCollect.find({userID: userID, off_id: {$in: off_ids}}, ep.done('collect'));//是否收藏过
}
exports.topicList = topicList;
