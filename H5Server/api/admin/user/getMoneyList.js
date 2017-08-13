/**
 * Created by MengLei on 2015/12/1.
 */
var db = require('./../../../../config').db;
var objectId = require('mongojs').ObjectId;
var eventproxy = require('eventproxy');
var result = require('../../../utils/result');
var log = require('../../../../utils/log').http;

//获取用户的资金列表
module.exports = function(req, res) {
    var _id = new objectId();
    var query = {};
    //首先查询用户，如果传手机号，那么按照手机号进行查找，否则按照用户id进行查找
    if (req.body.phone) {
        query = {phone: req.body.phone};
    } else if(req.body.u_id) {
        try {
            _id = new objectId(req.body.u_id);
        } catch (ex) {
            result(res, {statusCode: 919, message: ex.message});
            return;
        }
        query = {_id: _id};
    } else {
        //
    }
    db.users.findOne(query, {_id: 1}, function (err, doc) {
        if (err) {
            result(res, {statusCode: 905, message: err.message});
        } else {
            if (doc) {
                //用户存在，进一步查找用户的资金列表
                queryList(req, res, doc);
            } else {
                result(res, {statusCode: 902, message: '用户不存在！'});
            }
        }
    });
};

function queryList(req, res, doc){
    var start = parseInt(req.body.startPos || '1');
    var count = parseInt(req.body.pageSize || '10');
    var query = {};
    if(!!doc) {
        if (req.body.userType == 'teacher') {
            query = {t_id: doc._id.toString()};
        } else {
            query = {userID: doc._id.toString()};
        }
    }
    if (req.body.type) {
        query['type'] = req.body.type;
    }
    if (req.body.status) {
        query['status'] = req.body.status;
    }
    if (req.body.startTime && req.body.endTime) {
        query['createTime'] = {$gte: parseFloat(req.body.startTime), $lte: parseFloat(req.body.endTime)};
    } else if (req.body.startTime) {
        query['createTime'] = {$gte: parseFloat(req.body.startTime)};
    } else if (req.body.endTime) {
        query['endTime'] = {$lte: parseFloat(req.body.endTime)};
    }
    db.money.find(query).sort({createTime: -1}).skip(start < 0 ? 0 : start).limit(count).toArray(function (err2, doc2) {
        if (err2) {
            result(res, {statusCode: 905, message: err2.message});
        } else {
            var list = [];
            var ep = new eventproxy();
            ep.after('item', doc2.length, function (list) {
                list.sort(function(a, b){ return b.createTime - a.createTime; });
                result(res, {statusCode: 900, list: list});
            });
            ep.fail(function(err){
                result(res, {statusCode: 905, message: err.message});
            });
            for (var i = 0; i < doc2.length; i++) {
                var item = {
                    money_id: doc2[i]._id.toString(),
                    type: doc2[i].type,
                    amount: doc2[i].amount,
                    bonus: doc2[i].bonus || 0,
                    status: doc2[i].status,
                    createTime: doc2[i].createTime
                };
                if (item.type == 'rewardTeacher') {
                    item.o_id = doc2[i].o_id;
                    orderInfo(item, ep.done('item'));
                }else{
                    ep.emit('item', item);
                }
            }
        }
    });
}

function orderInfo(item, callback) {
    var _id = new objectId(item.o_id);
    var ep = new eventproxy();
    item.grade = '';
    item.subject = '';
    item.t_info = {t_id: '', nick: '', phone: ''};
    item.s_info = {s_id: '', nick: '', phone: ''};
    ep.all('order', 't_info', 's_info', function(order, t_info, s_info){
        if(order){
            item.grade = order.grade;
            item.subject = order.subject;
        }
        if(t_info){
            item.t_info = {t_id: t_info._id.toString(), nick: t_info.nick, phone: t_info.phone};
        }
        if(s_info){
            item.s_info = {s_id: s_info._id.toString(), nick: s_info.nick, phone: s_info.phone};
        }
        callback(null, item);
    });
    ep.fail(function(err){
        callback(err);
    });
    db.orders.findOne({_id: _id}, {grade: 1, subject: 1, t_id: 1, s_id: 1}, function (err, doc) {
        if (err) {
            ep.throw(err);
        } else {
            if (doc) {
                ep.emit('order', doc);
                if(doc.t_id){
                    db.users.findOne({_id: new objectId(doc.t_id)}, {nick: 1, phone: 1}, ep.done('t_info'));
                }else{
                    ep.emit('t_info', null);
                }
                if(doc.s_id){
                    db.users.findOne({_id: new objectId(doc.s_id)}, {nick: 1, phone: 1}, ep.done('s_info'));
                }else{
                    ep.emit('s_info', null);
                }
            }else{
                ep.emit('order', null);
                ep.emit('t_info', null);
                ep.emit('s_info', null);
            }
        }
    });
}
