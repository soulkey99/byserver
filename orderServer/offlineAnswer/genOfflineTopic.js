/**
 * Created by MengLei on 2015/8/19.
 */

var db = require('../../config').db;
var config = require('../../config');
var objectId = require('mongojs').ObjectId;
var hot = require("hot-ranking");
var rankTags = require('./rank/tags');
var offlineOperate = require('./utils/offlineOperate');
var log = require('./../../utils/log').order;


//直接生成离线问答订单param={userID: '', grade: '', subject: '', tag: '', topic: '', q_msg: []}
//q_msg结构：[{msg: '消息内容', type: '消息类型', orientation: '图片方向', time: '语音时长', seq: '消息顺序，从1开始'}]
module.exports = function(param, callback) {
    //
    log.trace('gen offline topic, userID: ' + param.userID + ', topic: ' + param.topic);
    var _id = new objectId();
    log.trace('before timestamp.');
    var curTime = new Date().getTime();
    log.trace('before new info.');
    var info = {
        _id: _id,       //off_id
        author_id: param.userID,
        grade: param.grade,
        subject: param.subject,
        tag: param.tag || [],    //tag
        topic: param.topic || '',     //主题
        section: param.section || 'default',    //预留，分区
        q_msg: [],
        o_id: null,  //原始订单id，如果不是从原始订单转成的，则为空
        createTime: curTime,    //创建时间
        updateTime: curTime,    //更新时间
        lastReplyTime: curTime, //最新回复时间，没有回复时候默认设置为创建时间
        lastReplyID: '', //最新回复的 answer_id
        recommend: false,   //推荐标记，默认false
        visit: 0,       //访问数
        collect: 0,     //收藏数
        watch: 0,       //关注数
        reply: 0,       //直接回复数
        visitIndex: parseFloat(hot(0, 0, new Date(curTime))),  //点击数计算指数
        collectIndex: parseFloat(hot(0, 0, new Date(curTime))),    //收藏数计算指数
        watchIndex: parseFloat(hot(0, 0, new Date(curTime))),      //关注数计算指数
        replyIndex: parseFloat(hot(0, 0, new Date(curTime))),      //回复数计算指数
        delete: false,  //预留，删除标记
        bonus: 0,//预留，奖励积分
        status: 'open',  //open：开放状态，judge：已选出最佳答案，仍可以评论，close：问题关闭，不许添加新回复，delete：问题被删除
        judgeTime: 0, //选出最佳答案时间
        judgeAnswerID: '' //最佳答案id
    };

    log.trace('gen offline topic, before loop.');
    for (var i = 0; i < param.q_msg.length; i++) {
        var item = {type: param.q_msg[i].type, seq: param.q_msg[i].seq || (i + 1), msg: (param.q_msg[i].msg || '')};
        switch (param.q_msg[i].type) {
            case 'voice'://语音
                item.time = param.q_msg[i].time;
                break;
            case 'image'://图片
                item.orientation = param.q_msg[i].orientation;
                break;
            default ://默认按照文字的方式
                break;
        }
        info.q_msg.push(item);
    }
    log.trace('gen offline topic, after loop.');
    //统计tags信息
    rankTags({tags: info.tag, userID: param.userID, createTime: info.createTime});

    db.offlineTopics.insert(info, function (err, doc) {
        if (err) {
            log.error('gen offline topic error: ' + err.message);
            return callback(err);
        } else {
            log.trace('gen offline topic success. off_id=' + info._id.toString());
            callback(null, info);
            //记录下单成功的操作
            offlineOperate({userID: info.author_id, operType: 'topic', operID: info._id.toString()});
        }
    });
};


