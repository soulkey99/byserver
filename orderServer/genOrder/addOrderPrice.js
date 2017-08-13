/**
 * Created by MengLei on 2015/5/14.
 */

var db = require('../../config').db;
var config = require('../../config');
var objectId = require('mongojs').ObjectId;
//var result = require('../utils/result');
var log = require('./../../utils/log').order;

module.exports = function(param, result){
    //订单增加小费
    log.trace('order server, add order price.');
    var _id = '';
    var addPrice = parseInt(param.addPrice);
    try{
        _id = new objectId(param.o_id);
    }catch(ex){
        log.error('add order price, order id invalid.');
        result({statusCode: 905, message: 'order id invalid.'});
        return;
    }
    db.orders.update({_id: _id}, {$set: {addPrice: addPrice}}, function(err){
        if(err){
            log.error('add order price error: ' + err.message);
            result({statusCode: 905, message: err.message});
        }else{
            //同时增加一条消费记录
            //db.money.insert({
            //    userID: req.body.userID,
            //    money: addPrice,
            //    type: '3',
            //    status: 'success',
            //    detail: {desc: '提问，追加小费', time: (new Date().getTime()), o_id: req.body.o_id}
            //});
            result({statusCode: 900});
        }
    })
};