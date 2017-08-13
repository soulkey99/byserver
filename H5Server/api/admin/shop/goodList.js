/**
 * Created by MengLei on 2015/8/3.
 */

var db = require('./../../../../config').db;
var config = require('./../../../../config');
var objectId = require('mongojs').ObjectId;
var result = require('./../../../utils/result');
var log = require('../../../../utils/log').h5;

module.exports = function(req, res) {
    //
    var start = parseInt(req.body.startPos ? req.body.startPos : 1);  //默认起始位置是1
    var count = parseInt(req.body.pageSize ? req.body.pageSize : 10);  //默认返回每页10条
    var query = {};
    //根据最高价格和最低价格进行过滤，可选条件
    if(req.body.valid){
        query['valid'] = (req.body.valid == 'true');
    }
    if(req.body.shopID){
        query['owner'] = req.body.shopID;
    }
    if(req.body.goodName){
        query['goodName'] = {$regex: req.body.goodName};
    }
    if(req.body.category){
        query['category'] = req.body.category;
    }
    if(req.body.type){
        query['type'] = req.body.type;
    }
    if(req.body.hot) {  //筛选推荐商品，hot=='true'，返回推荐商品列表，hot=='false'，返回未推荐商品列表，hot==''，返回全部商品列表
        if (req.body.hot == 'true') {
            query['hot'] = true;
        } else {
            query['hot'] = {$ne: true};
        }
    }
    var cursor = db.goods.find(query).sort({seq: 1, createTime: -1}).skip((start - 1) < 0 ? 0 : (start - 1)).limit(count);
    if(req.body.getType == 'simple'){
        cursor = db.goods.find({}, {_id: 1, goodName: 1});
    }
    cursor.toArray(function (err, doc) {
        if (err) {
            //handle error
            log.error('get goods list error: ' + err.message);
            result(res, {statusCode: 905, message: 'get goods list error: ' + err.message});
        } else {
            log.trace('get goods list success.');
            if(req.body.getType == 'simple'){
                var list = [];
                for(var j=0; j<doc.length; j++){
                    list.push({
                        goodId: doc[j]._id.toString(),
                        goodName: doc[j].goodName
                    });
                }
                result(res, {statusCode: 900, goodList: list});
            }else {
                var goodList = [];
                var vGoodIds = [];  //虚拟商品id集合
                var allOwnerIds = [];  //所有商品id集合
                for (var i = 0; i < doc.length; i++) {
                    goodList.push({
                        goodId: doc[i]._id.toString(),
                        goodName: doc[i].goodName,
                        price: doc[i].price,
                        type: doc[i].type,
                        valid: doc[i].valid,
                        category: doc[i].category,
                        owner: doc[i].owner,
                        createTime: doc[i].createTime,
                        validTime: doc[i].validTime,
                        hot: doc[i].hot || false,
                        stock: doc[i].stock
                    });
                    //商品类型：vSale虚拟兑换/rSale实物兑换/vLucky虚拟抽奖/rLucky实物抽奖/dvSale每日虚拟兑换/drSale每日实物兑换/dvLucky每日虚拟抽奖/drLucky每日实物抽奖/api直接调用接口充值
                    if (doc[i].type == 'vSale' || doc[i].type == 'vLucky' || doc[i].type == 'dvSale' || doc[i].type == 'dvLucky') {
                        //虚拟商品要到库存中去统计存量，实物商品直接计数即可，接口调用类型的商品也是直接计数就可以了
                        vGoodIds.push(doc[i]._id.toString());
                    }
                    //所有商品id集合
                    var ownerid = '';
                    try {
                        ownerid = new objectId(doc[i].owner);
                        allOwnerIds.push(ownerid);
                    } catch (ex) {
                        log.error('owner id exception: ' + ex.message);
                    }
                }
                queryStock(vGoodIds, function (err, doc) {
                    if (err) {
                        //handle error
                    } else {
                        //
                        for (var i = 0; i < goodList.length; i++) {
                            if (doc[goodList[i].goodId]) {
                                goodList[i].stock = doc[goodList[i].goodId];
                            }
                        }
                        db.admins.find({_id: {$in: allOwnerIds}}, {_id: 1, nick: 1}, function (err3, doc3) {
                            for (var k = 0; k < goodList.length; k++) {
                                for (var j = 0; j < doc3.length; j++) {
                                    if (goodList[k].owner.toString() == doc3[j]._id.toString()) {
                                        goodList[k].ownerName = doc3[j].nick;
                                    }
                                }
                            }
                            result(res, {statusCode: 900, goodList: goodList});
                        });
                    }
                });
            }
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
