/**
 * Created by MengLei on 2015/8/11.
 */

var db = require('../../config').db;
var config = require('../../config');
var objectId = require('mongojs').ObjectId;
var log = require('./../../utils/log').order;
var offlineList = require('./utils/offlineList');


//获取离线问题列表，param={userID: '', grade: '', subject: '', tag: [], startPos: ''. timestamp: '', pageSize: '', status: [], tab: '', startTime: '', endTime: '', section: ''}
//广场的每个tab传不同参数，tab='recommend'推荐，tab='hot'热门，tab='collect'最多收藏，tab='reply'最多回复，tab=instant转载即时订单，用不同的方式取列表
//startPos和timestamp两者二取一，timestamp优先
module.exports = function(param, callback) {
    var query = {delete: false};

    if (param.grade) {
        query.grade = param.grade;
    }
    if (param.subject) {
        query.subject = param.subject;
    }
    if (param.tag) {
        query.tag = {$in: param.tag};
    }
    if (param.status) {
        query.status = {$in: param.status};
    } else {
        //如果不指定状态，那么默认只排除已删除状态的，返回其他所有状态的
        query.status = {$nin: ['delete']};
    }
    var start = param.startPos ? param.startPos : 1;
    var count = param.pageSize ? param.pageSize : 10;

    var sort = {lastReplyTime: -1, updateTime: -1, createTime: -1};
    switch (param.tab) {
        case 'recommend':
            //推荐专区
            query.recommend = true;
            break;
        case 'time':
            //最新发布
            sort = {updateTime: -1, createTime: -1};
            break;
        case 'hot':
            //热门问题
            query.reply = {$gte: 1};//回复数必须大于1
            sort = {visitIndex: -1, lastReplyTime: -1, updateTime: -1, createTime: -1};
            break;
        case 'collect':
            //最多收藏
            sort = {collectIndex: -1, lastReplyTime: -1, updateTime: -1, createTime: -1};
            break;
        case 'reply':
            //最多回复
            query.reply = {$gte: 1};//回复数必须大于1
            sort = {replyIndex: -1, lastReplyTime: -1, updateTime: -1, createTime: -1};
            break;
        case 'watch':
            sort = {watchIndex: -1, lastReplyTime: -1, updateTime: -1, createTime: -1};
            break;
        default :
            break;
    }
    switch (param.section){
        case 'no_instant':
            query['section'] = {$ne: 'instant'};
            break;
        case 'all':
            delete(query.section);
            break;
        default:
        {
            if(param.section) {
                query['section'] = param.section;
            }
        }
            break;
    }
    if(param.startTime&&param.endTime){
        query.updateTime = {$gte: parseFloat(param.startTime), $lte: parseFloat(param.endTime)};
    }else if(param.startTime){
        query.updateTime = {$gte: parseFloat(param.startTime)};
    }else if(param.endTime){
        query.updateTime = {$lte: parseFloat(param.endTime)};
    }
    var cursor = '';
    if ((param.tab == 'time') && param.timestamp) {
        //仅在tab=time的情况下生效，如果传进来的参数是时间戳，那么按照时间戳的方式进行返回数据
        query.updateTime = {$lt: parseFloat(param.timestamp)};
        log.trace('timestamp=' + param.timestamp);
        cursor = db.offlineTopics.find(query).sort(sort).limit(parseInt(count));
    } else {
        //如果没传进来时间戳，那么按照正常排序
        cursor = db.offlineTopics.find(query).sort(sort).skip((parseInt(start) - 1) < 0 ? 0 : (parseInt(start) - 1)).limit(parseInt(count));
    }
    cursor.toArray(function (err, doc) {
        if (err) {
            log.error('get offline topic list error: ' + err.message);
            return callback(err);
        } else {
            if (doc.length > 0) {
                //有内容，对内容进行加工
                offlineList({doc: doc, userID: param.userID}, function (err3, doc3) {
                    if (err3) {
                        log.error('get offline topic list error: ' + err3.message);
                        return callback(err3);
                    } else {
                        log.trace('get offline topic list success. userID=' + param.userID);
                        return callback(null, doc3);
                    }
                });
            } else {
                //直接回复空数组
                return callback(null, []);
            }
        }
    });
};