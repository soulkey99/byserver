/**
 * Created by MengLei on 2015/9/19.
 */
var db = require('./../../../../config').db;
var result = require('./../../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('./../../../../utils/log').h5;

//获取推广人员列表，如果传手机号，那么就获取对应手机号的推广效果，无论是否推广人员
module.exports = function(req, res) {
    var start = req.body.startPos ? req.body.startPos : 1;
    var count = req.body.pageSize ? req.body.pageSize : 5;
    var query = {'userInfo.promoter': true};
    if (req.body.phonenum) {
        query = {phone: new RegExp(req.body.phonenum)};
    }
    db.users.find(query, {_id: 1, phone: 1, nick: 1, 'userInfo.promoter': 1}, function (err, doc) {
        if (err) {
            //handle error
            result(res, {statusCode: 905, message: err.message});
        } else {
            var idArray = [];
            for (var i = 0; i < doc.length; i++) {
                idArray.push(doc[i]._id.toString());
            }
            db.shareCode.find({userID: {$in: idArray}}).sort({'stat.invited': -1}).skip((parseInt(start) - 1) < 0 ? 0 : (parseInt(start) - 1)).limit(parseInt(count)).toArray(function (err2, doc2) {
                if (err2) {
                    //handle error
                    result(res, {statusCode: 905, message: err2.message});
                } else {
                    var itemList = [];
                    for (var j = 0; j < doc.length; j++) {
                        for (var k = 0; k < doc2.length; k++) {
                            if (doc[j]._id.toString() == doc2[k].userID) {
                                var item = {
                                    u_id: doc2[k].userID,
                                    nick: doc[j].nick,
                                    phone: doc[j].phone,
                                    promoter: doc[j].userInfo.promoter,
                                    shareCode: doc2[k].shareCode
                                };
                                if (doc2[k].stat) {
                                    //返回统计值，组装数据
                                    item.registered = doc2[k].stat.registered;
                                    item.invited = doc2[k].stat.invited;
                                } else {
                                    //如果没有值，则返回空
                                    item.registered = 0;
                                    item.invited = 0;
                                }
                                itemList.push(item);
                            }
                        }
                    }
                    result(res, {statusCode: 900, promoterList: itemList});
                }
            });
        }
    });
};
