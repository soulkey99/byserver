/**
 * Created by MengLei on 2015/8/8.
 */

var db = require('./../../../../config').db;
var config = require('./../../../../config');
var objectId = require('mongojs').ObjectId;
var result = require('./../../../utils/result');
var log = require('../../../../utils/log').h5;


//获取所有的兑换码列表
module.exports =function(req, res) {

    var startPos = parseInt(req.body.startPos || '1');
    var pageSize = parseInt(req.body.pageSize || '10');
    var query = {};
    if(req.body.deliver) {
        query.deliver = req.body.deliver;
    }
    if(req.body.shopID){
        query['shopID'] = req.body.shopID;
    }
    if(req.body.status){
        query['detail.status'] = (req.body.status == 'true');
    }
    if(req.body.status == 'true') {
        //只有已兑换的商品，才有checkTime
        if (req.body.startTime && req.body.endTime) {
            query['detail.checkTime'] = {$gte: parseFloat(req.body.startTime), $lte: parseFloat(req.body.endTime)};
        } else if (req.body.startTime) {
            query['detail.checkTime'] = {$gte: parseFloat(req.body.startTime)};
        } else if (req.body.endTime) {
            query['detail.checkTime'] = {$lte: parseFloat(req.body.endTime)};
        }
    } else {
        //对于发货状态不是“已发货”的查询类型，返回的数据按照兑换日期进行查询
        if (req.body.startTime && req.body.endTime) {
            query['createTime'] = {$gte: parseFloat(req.body.startTime), $lte: parseFloat(req.body.endTime)};
        } else if (req.body.startTime) {
            query['createTime'] = {$gte: parseFloat(req.body.startTime)};
        } else if (req.body.endTime) {
            query['createTime'] = {$lte: parseFloat(req.body.endTime)};
        }
    }

    db.bonusExchange.find(query).sort({createTime: -1}).skip((startPos - 1) < 0 ? 0 : (startPos - 1)).limit(pageSize).toArray(function (err, doc) {
        if (err) {
            log.error('get shop code list error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        } else {
            var list = [];
            var goodIdObj = {};
            var u_idObj = {};
            var u_idArray = [];
            var goodIdArray = [];
            for (var i = 0; i < doc.length; i++) {
                list.push({detail: doc[i].detail, deliver: doc[i].deliver, type: doc[i].type, goodId: doc[i].goodId, goodName: doc[i].goodName, time: doc[i].createTime, u_id: doc[i].userID, money: doc[i].money});
                goodIdObj[doc[i].goodId] = 1;
                u_idObj[doc[i].userID] = 1;
            }
            for (var item in goodIdObj) {
                goodIdArray.push(new objectId(item));
            }
            for(var item_u in u_idObj){
                u_idArray.push(new objectId(item_u));
            }
            db.goods.find({_id: {$in: goodIdArray}}, {_id: 1, goodName: 1, money: 1}, function (err2, doc2) {
                if (err2) {
                    //
                } else {
                    for (var i = 0; i < list.length; i++) {
                        for (var j = 0; j < doc2.length; j++) {
                            if (list[i].goodId == doc2[j]._id.toString()) {
                                if(!list[i].goodName) {
                                    list[i].goodName = doc2[j].goodName;
                                }
                                if(list[i].type == 'lottery'){
                                    list[i].goodName = ('【转盘抽奖】' + list[i].goodName)
                                }
                                if(list[i].money == undefined){
                                    list[i].money = doc2[j].money;
                                }
                            }
                        }
                    }
                    db.users.find({_id: {$in: u_idArray}}, {phone: 1, nick: 1}, function (err3, doc3) {
                        if (err3) {
                            //
                        } else {
                            for (var i = 0; i < list.length; i++) {
                                for (var j = 0; j < doc3.length; j++) {
                                    if (list[i].u_id == doc3[j]._id.toString()) {
                                        list[i].nick = doc3[j].nick;
                                        list[i].phone = doc3[j].phone;
                                    }
                                }
                            }
                            result(res, {statusCode: 900, list: list});
                        }
                    });
                }
            });
        }
    });
};
