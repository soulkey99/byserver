/**
 * Created by MengLei on 2015/8/3.
 */

var db = require('../../../../config').db;
var config = require('../../../../config');
var objectId = require('mongojs').ObjectId;
var eventproxy = require('eventproxy');
var result = require('../../../utils/result');
var log = require('../../../../utils/log').h5;

module.exports = function(req, res){
    var _id = '';
    try{
        _id = new objectId(req.body.goodId);
    }catch(ex){
        log.error('good id not valid. error: ' + ex.message);
        result(res, {statusCode: 919, message: ex.message});
        return;
    }

    db.goods.findOne({_id: _id}, function(err, doc){
        if(err){
            //handle error
        }else{
            if(doc){
                //
                if(doc.type == 'vSale' || doc.type == 'vLucky'){
                    //虚拟兑换、虚拟抽奖，需要去库存表中查数量
                }else{
                    //实物商品，直接写库存
                    log.trace('get good detail success.');
                    doc.goodId = doc._id.toString();
                    delete(doc._id);
                    var ownerid = '';
                    try{
                        ownerid = new objectId(doc.owner);
                    }catch(ex){
                        log.error('admin good detail, get owner error: ' + ex.message);
                        result(res, {statusCode: 919, message: ex.message});
                        return;
                    }
                    db.admins.findOne({_id: ownerid}, {nick: 1}, function(err2, doc2){
                        if(err){
                            result(res, {statusCode: 905, message: err2.message});
                        }else{
                            if(doc2){
                                doc.ownerName = doc2.nick;
                            }else{
                                doc.ownerName = '';
                            }
                        }
                        result(res, {statusCode: 900, detail: doc});
                    });
                }
            }else{
                //商品id不存在
                result(res, {statusCode: 9})
            }
        }
    });
};

