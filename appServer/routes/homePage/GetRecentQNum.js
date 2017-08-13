/**
 * Created by MengLei on 2015/12/8.
 */

var db = require('../../../config').db;
var objectId = require('mongojs').ObjectId;
var result = require('../../utils/result');
var eventproxy = require('eventproxy');
var log = require('../../../utils/log').http;

//获取系统最近问题数量
module.exports = function(req, res){
    var t = 600000; //默认获取10分钟内的，时间客户端可以自定义
    if(req.body.time){
        t = parseFloat(req.body.time);
    }
    //如果传today=true，那么就取当天系统产生问题的数量（从零点开始到现在），忽略time字段
    if(req.body.today == 'true'){
        var t1 = Date.now();
        var t2 = new Date();
        t2.setHours(0, 0, 0, 0);
        t = t1  - t2.getTime();
    }
    if(!req.body.userID){   //游客访问的时候，没有userID，那么就随机生成一个
        req.body.userID = (new objectId()).toString();
    }
    var ep = new eventproxy();
    ep.all('my', 'sys', function(my, sys){
        result(res, {statusCode: 900, sys: sys, my: my});
    });
    ep.fail(function(err){
        result(res, {statusCode: 905, message: err.message});
    });
    db.orders.count({create_time: {$gt: Date.now() - t}}, ep.done('sys'));
    db.orders.count({create_time: {$gt: Date.now() - t}, t_id: req.body.userID}, ep.done('my'));
};
