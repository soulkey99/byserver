/**
 * Created by MengLei on 2015/10/19.
 */

var db = require('./../../../config').db;
var config = require('./../../../config');
var objectId = require('mongojs').ObjectId;
var result = require('./../../utils/result');
var nodeExcel = require('excel-export-fast');
var log = require('../../../utils/log').h5;

//商户获取自己的兑换列表
module.exports = function(req, res) {
    var start = parseInt(req.body.startPos ? req.body.startPos : 1);  //默认起始位置是1
    var count = parseInt(req.body.pageSize ? req.body.pageSize : 10);  //默认返回每页10条
    var query = {shopID: req.body.userID};
    if(req.user.adminType == 'admin' || req.user.adminType == 'superAdmin'){
        query = {};
    }

    if (req.body.startTime && req.body.endTime) {
        query['detail.checkTime'] = {$gte: parseFloat(req.body.startTime), $lte: parseFloat(req.body.endTime)};
    } else if (req.body.startTime) {
        query['detail.checkTime'] = {$gte: parseFloat(req.body.startTime)};
    } else if (req.body.endTime) {
        query['detail.checkTime'] = {$lte: parseFloat(req.body.endTime)};
    }

    var sort = {'detail.checkTime': -1, createTime: -1};
    if (req.body.deliver) {//按物流方式查询
        query.deliver = req.body.deliver;
    }else{
        //不传deliver默认返回物流类型
        query.deliver = 'mail';
    }
    if (req.body.status) {
        query['detail.status'] = (req.body.status == 'true');
        if(req.body.status == 'true'){
            //只有在查询已兑换列表的时候，才会有意义
        }else{
            delete(query['detail.checkTime']);
        }
    } else {
    }
    //如果不传status，默认查全部，但是如果是查code类型的列表，只返回status=true的结果
    if(req.body.deliver == 'code') {
        //如果是兑换码，那么管理员可以查所有状态的兑换码，但是商户只能看到已经兑换过的兑换码
        if (req.user.adminType == 'admin' || req.user.adminType == 'superAdmin') {
        } else {
            query['detail.status'] = true;
        }
        sort = {'detail.checkTime': -1};
    }
    if(req.body.code){
        //如果传入了兑换码，那么只查该兑换码的内容，其他的查询条件都忽略
        query = {'detail.code': req.body.code};
        //包括翻页参数也都忽略，只显示第一页的内容（按理说此处返回数量不会超过一条）
        start = 1;
        count = 15;
    }
    db.bonusExchange.find(query).sort(sort).skip((start - 1) < 0 ? 0 : (start - 1)).limit(count).toArray(function (err, doc) {
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
            db.goods.find({_id: {$in: idArray}}, function (err2, doc2) {
                if (err2) {
                    log.error('exchange mail list error: ' + err2.message);
                    result(res, {statusCode: 905, message: err2.message});
                } else {
                    for (var i = 0; i < doc.length; i++) {
                        for (var j = 0; j < doc2.length; j++) {
                            //
                            if (doc[i].goodId == doc2[j]._id.toString()) {
                                if (!doc[i].goodName) { //如果记录了奖品名称，那么就使用记录下来的，不用再取商品数据记录中的那个了
                                    doc[i].goodName = doc2[j].goodName;
                                }
                                if(doc[i].money == undefined){  //如果记录了奖品结算价，那么就不再取商品数据中的记录了
                                    doc[i].money = doc2[j].money;
                                }
                            }
                        }
                    }
                    if(req.body.export == 'true'){
                        //导出excel
                    } else {
                        //正常返回数据
                        result(res, {statusCode: 900, list: doc});
                    }
                }
            });
        }
    });
};


function exportExcel(data, callback){
    //
}