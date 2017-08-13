/**
 * Created by MengLei on 2015/5/22.
 */

var db = require('./../../../config').db;
var result = require('./../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('./../../../utils/log').admin;

module.exports = function(req, res) {
    //获取推广人员推广的用户列表

    db.shareCode.findOne({shareCode: req.body.shareCode}, function (err, doc) {
        if (err) {
            //handle error
        } else {
            if (doc) {
                var shareCode = doc.shareCode;
                var start = req.body.startPos ? req.body.startPos : 1;
                var count = req.body.pageSize ? req.body.pageSize : 5;
                db.promotion.find({shareCode: shareCode}).skip((parseInt(start) - 1) < 0 ? 0 : (parseInt(start) - 1)).limit(parseInt(count)).toArray(function (err2, doc2) {
                    if (err2) {
                        //handle error
                    } else {
                        var phoneArray = [];
                        for (var i = 0; i < doc2.length; i++) {
                            phoneArray.push(doc2[i].phonenum);
                        }
                        db.users.find({phone: {$in: phoneArray}}, function (err3, doc3) {
                            if (err) {
                                //handle error
                            } else {
                                var list = [];
                                for (var j = 0; j < doc3.length; j++) {
                                    list.push({
                                        phone: doc3[j].phone,
                                        name: (doc3[j].userInfo.family_name + doc3[j].userInfo.given_name),
                                        userType: doc3[j].userType,
                                        first: doc3[j].userInfo.ext_info.first
                                    });
                                }
                                result(res, {statusCode: 900, invitedList: list});
                            }
                        });
                    }
                });
            } else {
                log.error('user do not have share code.');
                result(res, {statusCode: 905, message: 'user do not have share code.'});
            }
        }
    });
};