/**
 * Created by MengLei on 2015/8/6.
 */

var db = require('./../../../config').db;
var config = require('./../../../config');
var objectId = require('mongojs').ObjectId;
var result = require('./../../utils/result');
var log = require('../../../utils/log').h5;


//检查兑换码有效性
module.exports = function(req, res){
    db.bonusExchange.findOne({'detail.code': req.body.code}, function(err, doc){
        if(err){
            log.error('check code error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        }else{
            if(doc){
                //
                db.goods.findOne({_id:new objectId(doc.goodId)}, function(err2, doc2){
                    if(err2){
                        result(res, {statusCode: 905, message: err2.message});
                    }else{
                        if(doc.goodName) {
                            doc.detail.goodName = doc.goodName;
                        }else{
                            doc.detail.goodName = doc2.goodName;
                        }
                        result(res, {statusCode: 900, detail: doc.detail});
                    }
                });
            }else {
                result(res, {statusCode: 940, message: 'code not exists.'});
            }
        }
    });
};

