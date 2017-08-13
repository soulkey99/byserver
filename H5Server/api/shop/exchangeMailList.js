/**
 * Created by MengLei on 2015/8/4.
 */

var db = require('./../../../config').db;
var config = require('./../../../config');
var objectId = require('mongojs').ObjectId;
var result = require('./../../utils/result');
var log = require('../../../utils/log').h5;

//商户兑换列表（邮寄类商品）
module.exports = function(req, res){
    var start = parseInt(req.body.startPos ? req.body.startPos : 1);  //默认起始位置是1
    var count = parseInt(req.body.pageSize ? req.body.pageSize : 10);  //默认返回每页10条

    var query = {deliver: 'mail', shopID: req.body.userID};
    if(req.user.adminType == 'admin' || req.user.adminType == 'superAdmin'){
        query = {deliver: 'mail'};
    }
    db.bonusExchange.find(query).sort({createTime: -1}).skip((start - 1) < 0 ? 0 : (start - 1)).limit(count).toArray(function(err, doc){
        if(err){
            log.error('exchange mail list error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        }else{
            var idArray = [];
            for(var i=0; i<doc.length; i++){
                try {
                    var _id = new objectId(doc[i].goodId);
                    idArray.push(_id);
                }catch(ex){

                }
            }
            db.goods.find({_id: {$in: idArray}}, function(err2, doc2){
                if(err2){
                    log.error('exchange mail list error: ' + err2.message);
                    result(res, {statusCode: 905, message: err2.message});
                }else{
                    for(var i=0; i<doc.length; i++) {
                        for (var j = 0; j < doc2.length; j++) {
                            //
                            if (doc[i].goodId == doc2[j]._id.toString()) {
                                if (!doc[i].goodName) {
                                    doc[i].goodName = doc2[j].goodName;
                                }
                            }
                        }
                    }
                    result(res, {statusCode: 900, list: doc});
                }
            })
        }
    })
};

