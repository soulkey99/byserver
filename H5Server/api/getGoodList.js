/**
 * Created by MengLei on 2015/4/21.
 */

var db = require('./../../config').db;
var config = require('./../../config');
var objectId = require('mongojs').ObjectId;
var result = require('./../utils/result');
var log = require('../../utils/log').h5;

module.exports = function(req, res) {
    //
    var start = parseInt(req.body.startPos ? req.body.startPos : 1);  //默认起始位置是1
    var count = parseInt(req.body.pageSize ? req.body.pageSize : 10);  //默认返回每页5条

    //获取商品列表，只获取可用的商品，排除超期、不可用、库存为零等各种不可用的商品
    var query = {$or: [{stock: {$gt: 0}}, {type: 'lottery'}], valid: true, validTime: {$gt: Date.now()}};
    //根据最高价格和最低价格进行过滤，可选条件
    if (req.body.priceMax) {
        query.price = {$lte: parseInt(req.body.priceMax)};
    }
    if (req.body.priceMin) {
        if (query.price) {
            query.price.$gte = parseInt(req.body.priceMin);
        } else {
            query.price = {$gte: parseInt(req.body.priceMin)};
        }
    }
    if(req.body.category) {
        query.category = req.body.category;
    }
    if(req.body.city) {  //如果传city参数，那么只查找覆盖全国的和面向该城市的两种，如果不传，那么返回所有结果，不按照
        query['$or'] = [{city: {$eq: []}}, {city: req.body.city}, {city: {$eq: null}}];
    }
    //查找热门商品，则忽略其他因素，todo：是否加入地区因素，待考虑
    if(req.body.hot == 'true'){
        query = {hot: true, valid: true, validTime: {$gt: Date.now()}};
    }

    db.goods.find(query).sort({seq: 1}).skip((start - 1) < 0 ? 0 : (start - 1)).limit(count).toArray(function (err, doc) {
        if (err) {
            //handle error
            log.error('get goods list error: ' + err.message);
            result(res, {statusCode: 905, message: 'get goods list error: ' + err.message});
        } else {
            log.trace('get goods list success.');
            var goodList = [];
            var goodIds = [];
            for (var i = 0; i < doc.length; i++) {
                goodList.push({
                    goodId: doc[i]._id.toString(),
                    goodName: doc[i].goodName,
                    avatar: doc[i].avatar || '',
                    goodPic: doc[i].goodPic,
                    goodInfo: doc[i].goodInfo,
                    price: doc[i].price,
                    type: doc[i].type,
                    stock: doc[i].stock,
                    validTime: doc[i].validTime,
                    category: doc[i].category || ''
                });
                //商品类型：vSale虚拟兑换/rSale实物兑换/vLucky虚拟抽奖/rLucky实物抽奖/dvSale每日虚拟兑换/drSale每日实物兑换/dvLucky每日虚拟抽奖/drLucky每日实物抽奖/api直接调用接口充值
                if(doc[i].type == 'vSale' || doc[i].type == 'vLucky' || doc[i].type == 'dvSale' || doc[i].type == 'dvLucky'){
                    //虚拟商品要到库存中去统计存量，实物商品直接计数即可，接口调用类型的商品也是直接计数就可以了
                    goodIds.push(doc[i]._id.toString());
                }
            }
            queryStock(goodIds, function(err, doc){
                if(err){
                    //handle error
                }else{
                    //
                    for(var i=0; i<goodList.length; i++){
                        if(doc[goodList[i].goodId]) {
                            goodList[i].stock = doc[goodList[i].goodId];
                        }
                    }
                    result(res, {statusCode: 900, goodList: goodList});
                }
            });
        }
    });
};


function queryStock(ids, callback){
    db.stocks.find({goodId: {$in: ids}}, function(err, doc){
        if(err){
            //handle error
            callback(err);
        }else{
            var result = {};
            for(var i=0; i<ids.length; i++){
                result[ids[i]] = 0;
                for(var j=0; j<doc.length; j++){
                    if(doc[j].goodId == ids[i]){
                        result[ids[i]] ++;
                    }
                }
            }
            callback(null, result);
        }
    })
}
