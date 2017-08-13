/**
 * Created by MengLei on 2015/9/11.
 */

var db = require('../../../config').db;
var log = require('./../../../utils/log').order;

//记录用户的各种操作，param={userID: '', operType: '', operID: '', time: 123}，如果有传进来的时间，就取传进来的时间，否则就取当前时间
//genOrder：下单，grabOrder：抢单，addTime：增加订单时间，tEndOrder：教师确认结束订单，sEndOrder：学生确认结束订单，cancelOrder：取消订单，remark：评价订单
module.exports = function(param){
    //
    var curTime = (new Date()).getTime();
    db.orderOperate.insert({userID: param.userID, operType: param.operType, operID: param.operID, time: param.time || curTime});
};