/**
 * Created by MengLei on 2015/8/6.
 */

var db = require('./../../../config').db;
var config = require('./../../../config');
var objectId = require('mongojs').ObjectId;
var result = require('./../../utils/result');
var log = require('../../../utils/log').h5;

//商户确认兑换码
module.exports = function(req, res) {
    db.bonusExchange.findAndModify({
        query: {'detail.code': req.body.code, 'detail.status': false},
        update: {$set: {'detail.status': true, 'detail.checkTime': (new Date().getTime())}},
        new: true
    }, function (err, doc) {
        if (err) {
            log.error('check code error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        } else {
            if (doc) {
                //
                result(res, {statusCode: 900, status: doc.detail.status});
            } else {
                result(res, {statusCode: 940, message: 'code not exists.'});
            }
        }
    })
};

