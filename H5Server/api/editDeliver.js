/**
 * Created by MengLei on 2015/10/16.
 */

var db = require('./../../config').db;
var config = require('./../../config');
var objectId = require('mongojs').ObjectId;
var result = require('./../utils/result');
var log = require('../../utils/log').h5;
var query = require('query-mobile-phone-area');
var dnode = require('./../utils/dnodeClient');

//包邮类兑换，编辑物流信息
module.exports = function(req, res){
    var detailId = new objectId();
    try{
        detailId = new objectId(req.body.detailId);
    } catch(ex) {
        result(res, {statusCode: 919, message: ex.message});
        return;
    }
    db.bonusExchange.findOne({_id: detailId}, function(err, doc){
        if(err){
            result(res, {statusCode: 905, message: err.message});
        }else {
            if (doc) {//记录存在
                if (doc.userID == req.user._id.toString()) {  //是用户本人的记录，可以修改
                    if(doc.deliver == 'mail') {//包邮类的兑换
                        if (!doc.detail.status) { //没发货的可以改
                            var setObj = {};
                            if (req.body.name != undefined) {
                                setObj['detail.name'] = req.body.name;
                            }
                            if (req.body.phone != undefined) {
                                setObj['detail.phone'] = req.body.phone;
                            }
                            if (req.body.address != undefined) {
                                setObj['detail.address'] = req.body.address;
                            }
                            if (req.body.postCode != undefined) {
                                setObj['detail.postCode'] = req.body.postCode;
                            }
                            if (req.body.remark != undefined) {
                                setObj['detail.remark'] = req.body.remark || '';
                            }
                            db.bonusExchange.update({_id: detailId}, {$set: setObj}, function (err2) {
                                if (err2) {
                                    result(res, {statusCode: 905, message: err2.message});
                                } else {
                                    result(res, {statusCode: 900});
                                }
                            });
                        } else {
                            //发货之后，就不能修改了
                            result(res, {statusCode: 917, message: '已发货，无法修改！'});
                        }
                    }else if(doc.deliver == 'api'){ //流量充值类的兑换
                        if(doc.detail.phone){
                            //有手机号，那么就是已经充值，不允许修改
                            result(res, {statusCode: 917, message: '已充值，无法修改！'});
                            return;
                        }
                        db.bonusExchange.update({_id: detailId}, {$set: {'detail.phone': req.body.phone}}, function(err2){
                            if(err2){
                                return result(res, {statusCode: 905, message: err2.message});
                            }
                            log.trace('edit deliver, charge flow success, phone: ' + req.body.phone);
                            chargeFlow(req.body.phone);
                            return result(res, {statusCode: 900});
                        });
                    }
                } else {
                    //不是用户本人的记录，无权修改
                    result(res, {statusCode: 917, message: '无权操作别人的兑换记录！'});
                }
            } else {
                //兑换记录不存在
                result(res, {statusCode: 937, message: '积分兑换记录不存在！'});
            }
        }
    });
};

//充值流量
function chargeFlow(phone){
    var q = query(phone);
    var quantity = 10;
    if (q) {
        if (q.type == '中国移动') {
            //10M
            quantity = 10;
        } else if (q.type == '中国联通') {
            //20M
            quantity = 20;
        } else if (q.type == '中国电信') {
            //10M
            quantity = 10;
        }
    }
    dnode('flowServer', 'orderFlow', {num: phone, flow: quantity, purpose: 'bonusExchange'}, function(err, resp){
        //handle callback
        //console.log(err);
        //console.log(resp);
    });
}
