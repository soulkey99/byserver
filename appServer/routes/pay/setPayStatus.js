/**
 * Created by MengLei on 2016/1/4.
 */
"use strict";
const result = require('../../utils/result');
const objectId = require('mongojs').ObjectId;
const db = require('../../../config').db;
const retrieveCharge = require('./utils/retrieveCharge');
const retrievePayStatus = require('./utils/retrievePayStatus');

//客户端支付状态
module.exports = function (req, res) {
    let _id = new objectId();
    try {
        _id = new objectId(req.body.money_id);
    } catch (ex) {
        return result(res, {statusCode: 919, message: ex.message});
    }
    //几种状态：success\fail\cancel\invalid
    let list = ['success', 'fail', 'cancel', 'invalid'];
    if (list.indexOf(req.body.status) < 0) {
        return result(res, {statusCode: 955, message: '支付状态参数不正确！'});
    }
    db.money.findOne({_id: _id}, function (err, doc) {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        if (!doc) {
            return result(res, {statusCode: 956, message: '支付订单id不存在！'});
        }
        if (req.body.status == 'success') {
            //如果支付成功，那么去主动获取一次charge状态
            if (doc.status == 'pending') {
                if (doc.charge && doc.charge.id) {
                    console.log('set pay status, retrieve charge.');
                    //retrieveCharge(doc.charge.id)
                    setTimeout(()=>{
                        retrievePayStatus(doc._id.toString());
                    }, 1000);
                }
            }
        }
        var setObj = {};
        switch (req.body.status) {
            case 'cancel':
                setObj = {status: 'cancel', client_status: 'cancel'};
                break;
            case 'fail':
                setObj = {status: 'fail', client_status: 'fail'};
                break;
            case 'invalid':
                setObj = {status: 'fail', client_status: 'invalid'};
                break;
            case 'success':
                setObj = {client_status: 'success'};
                break;
            default:
                setObj = {client_status: req.body.status};
                break;
        }
        db.money.findAndModify({query: {_id: _id, status: 'pending'}, update: {$set: setObj}, new: true}, function (err2) {
            if (err2) {
                return result(res, {statusCode: 905, message: err2.message});
            }
            result(res, {statusCode: 900});
        });
    });
};

