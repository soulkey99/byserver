/**
 * Created by MengLei on 2015/8/6.
 */

var db = require('./../../../config').db;
var config = require('./../../../config');
var objectId = require('mongojs').ObjectId;
var result = require('./../../utils/result');
var sendSMS = require('./../../../utils/sendSMS');
var log = require('../../../utils/log').h5;

//商户填写物流信息
module.exports = function(req, res) {
    var _id = '';
    try {
        _id = new objectId(req.body.bonusID);
    } catch (ex) {
        result(res, {statusCode: 905, message: ex.message});
    }
    db.bonusExchange.findAndModify({
        query: {_id: _id},
        update: {
            $set: {
                'detail.status': true,
                'detail.postCompany': req.body.postCompany,
                'detail.postNumber': req.body.postNumber,
                'detail.checkTime': (new Date()).getTime()
            }
        },
        new: true
    }, function (err, doc) {
        if (err) {
            log.error('confirm mail error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        } else {
            //
            if (doc) {
                result(res, {statusCode: 900});
                //确认发货之后，要同时给用户发送确认短信
                confirmMailSMS(doc.detail.phone, doc.detail.postCompany, doc.detail.postNumber, doc.goodName);
            } else {
                result(res, {statusCode: 937, message: '积分兑换记录不存在！'});
            }
        }
    });
};

function confirmMailSMS(phone, postCompany, postNumber, goodName){
    var sendObj = {mobilePhoneNumber: phone, template: 'logistics', goodName: goodName, postCompany: postCompany, postNumber: postNumber};
    sendSMS(sendObj, function () {});
}