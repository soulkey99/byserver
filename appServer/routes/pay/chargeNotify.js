/**
 * Created by MengLei on 2015/5/19.
 */

var config = require('../../../config');
var objectId = require('mongojs').ObjectId;
var result = require('../../utils/result');
var db = config.db;
var log = require('../../../utils/log').http;


module.exports = function(req, res){
    //pingxx支付结果的回调通知
    var resp = function (ret) {
        res.writeHead(200, {
            "Content-Type": "text/plain;charset=utf-8"
        });
        res.end(ret);
    };

    try {
        var notify = req.body;
        delete(notify.userID);
        delete(notify.authSign);
        if (notify.object === undefined) {
            return resp('fail');
        }
        switch (notify.object) {
            case "charge":
                // 开发者在此处加入对支付异步通知的处理代码
                var o_id = new objectId(notify.order_no);
                db.money.update({_id: o_id}, {$set: {'status': 'success', 'detail.charge': notify}});
                db.money.findOne({_id: o_id}, function(err, doc){
                    if(err){
                        //handle error
                    }else{
                        if(doc){
                            var _id = new objectId(doc.userID);
                            db.users.update({_id: _id}, {$inc: {'userInfo.money': parseInt(doc.money)}});
                        }
                    }
                });

                return resp("success");
            case "refund":
                // 开发者在此处加入对退款异步通知的处理代码
                return resp("success");
            default:
                return resp("fail");
        }
    } catch (err) {
        return resp('fail');
    }
};

