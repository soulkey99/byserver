/**
 * Created by MengLei on 2015/12/20.
 */

var model = require('../model');
var objectId = require('mongoose').Types.ObjectId;
var eventproxy = require('eventproxy');
var UserPorxy = require('./user/user');
var Feedback = model.Feedback;

/**
 * 根据意见反馈id获取意见反馈内容
 * Callback
 * - err, 数据库异常
 * - doc, 反馈内容
 * @param {String} id 问题id
 * @param {Function} callback 回调函数
 */
exports.getFeedbackById = function(id, callback){
    Feedback.findOne({_id: id}, callback);
};

/**
 * 根据用户id获取意见反馈列表
 * Callback
 * - err, 数据库异常
 * - doc, 反馈内容
 * @param {Object} param 输入参数，param={userID: '', time: '上次获取的列表最后一条记录的时间', startPos: '开始位置', pageSize: '获取数量', flag: '将所有消息标为已读'}
 * @param {Function} callback 回调函数
 */
exports.getFeedbacksByUser = function(param, callback){
    var start = parseInt(param.startPos || '1') - 1;
    var count = parseInt(param.pageSize || '10');
    var query = {userID: param.userID};
    if (param.time) {
        query['time'] = {$lt: parseFloat(param.time)};
    }
    if(start < 0){
        start = 0;
    }
    Feedback.find(query, {}, {skip: start, limit: count, sort: '-time'}, callback);
    if(param.flag){
        Feedback.update({userID: param.userID}, {$set: {read: true}}, {multi: true}, function(){});
    }
};

/**
 * 获取管理员端看到的意见反馈列表
 * Callback
 * - err, 数据库异常
 * - doc, 反馈内容
 * @param {Object} param 输入参数，param={startPos: '开始位置', pageSize: '获取数量', flag: '是否只获取未读'}
 * @param {Function} callback 回调函数
 */
exports.getAdminFeedbacks = function(param, callback) {
    var start = parseInt(param.startPos || '1') - 1;
    var count = parseInt(param.pageSize || '10');
    if (start < 0) {
        start = 0;
    }

    var query = {direction: {$ne: 'a2u'}};
    if(param.flag){
        query['read'] = false;
    }

    Feedback.aggregate([{$match: query}, {$sort: {time: -1}}, {$group: {_id: '$userID'}}, {$skip: start<0?0:start}, {$limit: count}], function(err, doc){
        if(err){
            return callback(err);
        }
        var ep = new eventproxy();
        ep.after('item', (count < doc.length ? count : doc.length), function(list){
            list.sort(function(a, b){
                return b.time - a.time;
            });
            callback(null, list);
        });
        ep.fail(callback);
        for(var i=0; i<doc.length; i++){
            //详细内容
            Feedback.findOne({userID: doc[i]._id.toString(), direction: {$ne: 'a2u'}}, {}, {sort: '-time'}, function(err2, doc2){
                if(err2){
                    return callback(err2);
                }
                var item = {
                    feedback_id: doc2._id.toString(),
                    userID: doc2.userID,
                    type: doc2.type,
                    content: doc2.content,
                    direction: doc2.direction,
                    qq: doc2.qq,
                    platform: doc2.platform,
                    os_version: doc2.os_version,
                    userType: doc2.userType,
                    client_version: doc2.client_version,
                    channel: doc2.channel,
                    time: doc2.time,
                    read: doc2.read,
                    replied: false
                };
                var ep2 = new eventproxy();
                ep2.all('user', 'replied', function(user, replied){
                    item.nick = !!user ? user.nick : '';
                    item.phone = !!user ? user.phone : '';
                    item.replied = !!replied;
                    ep.emit('item', item);
                });
                ep2.fail(ep.throw);
                //作者信息
                UserPorxy.getUserById(item.userID, ep2.done('user'));
                //是否回复过
                Feedback.findOne({userID: item.userID, direction: 'a2u', time: {$gt: item.time}}, ep2.done('replied'));
            });
        }
    });
};

exports.getAdminFeedbacks2 = function(param, callback) {
    var start = parseInt(param.startPos || '1') - 1;
    var count = parseInt(param.pageSize || '10');
    if (start < 0) {
        start = 0;
    }

    var query = {direction: {$ne: 'a2u'}};
    if (param.flag) {
        query['read'] = false;
    }

    Feedback.aggregate([{$match: query}, {$sort: {time: -1}}, {
        $group: {
            _id: '$userID',
            time: {$first: '$time'}
        }
    }, {$sort: {time: -1}}, {$skip: start < 0 ? 0 : start}, {$limit: count}], function (err, doc) {
        if (err) {
            return callback(err);
        }
        var ep = new eventproxy();
        ep.after('item', (count < doc.length ? count : doc.length), function (list) {
            list.sort(function (a, b) {
                return b.time - a.time;
            });
            callback(null, list);
        });
        ep.fail(callback);
        for (var i = 0; i < doc.length; i++) {
            //详细内容
            Feedback.findOne({
                userID: doc[i]._id.toString(),
                direction: {$ne: 'a2u'}
            }, {}, {sort: '-time'}, function (err2, doc2) {
                if (err2) {
                    return callback(err2);
                }
                var item = {
                    feedback_id: doc2._id.toString(),
                    userID: doc2.userID,
                    type: doc2.type,
                    content: doc2.content,
                    direction: doc2.direction,
                    qq: doc2.qq,
                    platform: doc2.platform,
                    os_version: doc2.os_version,
                    userType: doc2.userType,
                    client_version: doc2.client_version,
                    channel: doc2.channel,
                    time: doc2.time,
                    read: doc2.read,
                    replied: false
                };
                var ep2 = new eventproxy();
                ep2.all('user', 'replied', function (user, replied) {
                    item.nick = !!user ? user.nick : '';
                    item.phone = !!user ? user.phone : '';
                    item.replied = !!replied;
                    ep.emit('item', item);
                });
                ep2.fail(ep.throw);
                //作者信息
                UserPorxy.getUserById(item.userID, ep2.done('user'));
                //是否回复过
                Feedback.findOne({userID: item.userID, direction: 'a2u', time: {$gt: item.time}}, ep2.done('replied'));
            });
        }
    });
};



/**
 * 创建用户反馈
 * Callback
 * - err, 数据库异常
 * - doc, 反馈内容
 * @param {Object} info 创建用户反馈的内容
 * @param {Function} callback 回调函数
 */
exports.createFeedback = function(info, callback) {
    var feedback = new Feedback();
    if (info.userID != undefined) {
        feedback.userID = info.userID;
    }
    if (info.type != undefined) {
        feedback.type = info.type;
    }
    if (info.content != undefined) {
        feedback.content = info.content;
    }
    if(info.direction != undefined){
        feedback.direction = info.direction;
    }
    if (info.orientation != undefined) {
        feedback.orientation = info.orientation;
    }
    if (info.duration != undefined) {
        feedback.duration = parseInt(info.duration);
    }
    if (info.email != undefined) {
        feedback.email = info.email;
    }
    if (info.qq != undefined) {
        feedback.qq = info.qq;
    }
    if (info.platform != undefined) {
        feedback.platform = info.platform;
    }
    if (info.os_version != undefined) {
        feedback.os_version = info.os_version;
    }
    if (info.userType != undefined) {
        feedback.userType = info.userType;
    }
    if (info.client_version != undefined) {
        feedback.client_version = info.client_version;
    }
    if (info.channel != undefined) {
        feedback.channel = info.channel;
    }
    feedback.save(callback);
};




