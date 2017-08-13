/**
 * Created by MengLei on 2015/11/5.
 */

var db = require('./../../../config').db;
var config = require('./../../../config');
var objectId = require('mongojs').ObjectId;
var result = require('./../../utils/result');
var log = require('../../../utils/log').h5;

//账务统计
module.exports = function(req, res){
    //统计账务的时候，只计算已经兑换过的，未兑换的不计算
    var query = {shopID: req.body.userID, 'detail.status': true};
    if(req.user.adminType == 'admin' || req.user.adminType == 'superAdmin'){
        //如果是管理员身份调用账务统计接口，那么直接返回错误
    }
    if (req.body.startTime && req.body.endTime) {
        query.createTime = {$gte: parseFloat(req.body.startTime), $lte: parseFloat(req.body.endTime)};
    } else if (req.body.startTime) {
        query.createTime = {$gte: parseFloat(req.body.startTime)};
    } else if (req.body.endTime) {
        query.createTime = {$lte: parseFloat(req.body.endTime)};
    }
    var sort = {createTime: -1};
    if (req.body.deliver) {//按物流方式查询
        query.deliver = req.body.deliver;
    } else {
        //不传deliver默认返回物流类型
        query.deliver = 'mail';
    }
    db.bonusExchange.find(query, {goodId: 1, money: 1}, function (err, doc) {
        if (err) {
            log.error('exchange mail list error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        } else {
            var idArray = [];
            for (var i = 0; i < doc.length; i++) {
                try {
                    var _id = new objectId(doc[i].goodId);
                    idArray.push(_id);
                } catch (ex) {

                }
            }
            db.goods.find({_id: {$in: idArray}}, {money: 1}, function (err2, doc2) {
                if (err2) {
                    log.error('exchange mail list error: ' + err2.message);
                    result(res, {statusCode: 905, message: err2.message});
                } else {
                    var total = 0;
                    for (var i = 0; i < doc.length; i++) {
                        for (var j = 0; j < doc2.length; j++) {
                            //
                            if (doc[i].goodId == doc2[j]._id.toString()) {
                                if (doc[i].money == undefined) {  //如果记录了奖品结算价，那么就不再取商品数据中的记录了
                                    total += parseFloat(doc2[j].money);
                                } else {
                                    total += parseFloat(doc[i].money);
                                }
                            }
                        }
                    }
                    result(res, {statusCode: 900, total: total});
                }
            });
        }
    });
};
