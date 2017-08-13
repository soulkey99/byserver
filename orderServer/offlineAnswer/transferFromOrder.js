/**
 * Created by MengLei on 2015/8/10.
 */

var db = require('../../config').db;
var config = require('../../config');
var objectId = require('mongojs').ObjectId;
var hot = require("hot-ranking");
var log = require('./../../utils/log').order;
var cancelOrder = require('../instantOrder/cancelOrder');
var eventproxy = require('eventproxy');
var dnode = require('../utils/dnodeClient');


//从普通订单转为自由答订单param={userID: '', o_id: '', topic: ''}
module.exports = function(param, callback) {
    //
    var o_id = new objectId();
    var u_id = new objectId();
    try {
        if (param.o_id) {
            o_id = new objectId(param.o_id);
        }
        if (param.userID) {
            u_id = new objectId(param.userID);
        }
    } catch (ex) {
        log.error('tranform from order error: ' + ex.message);
        callback(ex);
        return;
    }
    var ep = new eventproxy();
    ep.all('user', 'order', function (user, order) {
        //
        if (order) {
            if(order.off_id){
                //如果订单存在off_id，那么就是已经转化过了，不允许再次转化
                callback(new Error('已经转过离线订单，不允许再转！'));
                return;
            }
            //拼装默认topic，小明的高中数学即时订单
            var topic = '';
            if (user) {
                topic = user.nick + '的' + order.grade + order.subject + '即时提问';
            }
            var curTime = new Date().getTime();
            var _id = new objectId();
            //订单存在，可以转化
            var info = {
                _id: _id,       //off_id
                author_id: param.userID,
                grade: order.grade,
                subject: order.subject,
                tag: [],    //tag
                topic: param.topic || topic,    //主题(如果传了，就取传过来的，如果没传，那么就根据信息拼一个)
                section: param.section || 'instant',    //预留，分区
                q_msg: order.q_msg,
                o_id: param.o_id,  //原始订单id
                createTime: curTime,    //创建时间
                updateTime: curTime,    //更新时间
                lastReplyTime: curTime, //最新回复时间，没有回复时候默认设置为创建时间
                lastReplyID: '', //最新回复的 answer_id
                recommend: false,   //推荐标记，默认false
                visit: 0,       //点击数
                collect: 0,     //收藏数
                watch: 0,       //关注数
                reply: 0,       //回复数
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
            db.offlineTopics.insert(info);
            //同时将原始订单设置已转化标识，写入对应离线问题的id，方便将来跳转
            db.orders.update({_id: order._id}, {$set: {off_id: info._id.toString()}});
            info.off_id = _id.toString();
            delete(info._id);
            callback(null, info);
            if (order.status == 'pending') {
                //如果原来订单状态是pending，同时将原来的即时问答订单取消，并通知相关人员订单已经取消
                cancelOrder(param, function () {
                });
            }
        } else {
            //订单不存在
            log.error('transform from order error: order not exists.');
            callback(new Error('订单ID不存在！'));
        }
    });
    db.orders.findOne({_id: o_id}, ep.done('order'));
    db.users.findOne({_id: u_id}, {nick: 1}, ep.done('user'));
};
