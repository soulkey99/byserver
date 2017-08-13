/**
 * Created by MengLei on 2015/7/22.
 */

var result = require('./../utils/result');
var objectId = require('mongojs').ObjectId;
var db = require('../../config').db;
var log = require('./../../utils/log').h5;

//获取积分记录
module.exports = function(req, res) {
    //获取积分记录列表
    var query = {userID: req.body.userID};
    if (req.body.startTime && req.body.endTime) {
        query.detail.t = {$gte: parseInt(req.body.startTime), $lte: parseInt(req.body.endTime)};
    } else if (req.body.endTime) {
        query.detail.t = {$lte: parseInt(req.body.endTime)};
    } else if (req.body.startTime) {
        query.detail.t = {$gte: parseInt(req.body.startTime)};
    }
    var startPos = parseInt(req.body.startPos || '1');
    var pageSize = parseInt(req.body.pageSize || '50');

    if (req.body.type) {
        query.type = req.body.type;
    }

    db.bonus.find(query).sort({'detail.t': -1}).skip((startPos - 1) < 0 ? 0 : (startPos - 1)).limit(pageSize).toArray(function (err, doc) {
        if (err) {
            //handle error
        } else {
            var bonusList = [];
            var goodIdArray = [];
            //type: 0：新用户注册奖励，1：完善个人资料，2：抢答，3：提问，4：兑换商品消费，分享客户端奖励。
            for (var i = 0; i < doc.length; i++) {
                var item = {
                    bonusID: doc[i]._id.toString(),
                    bonus: doc[i].bonus,
                    goodName: doc[i].detail.goodName || doc[i].detail.desc,
                    time: doc[i].detail.t,
                    hasDetail: false
                };
                if (doc[i].detail.detail) {
                    item.hasDetail = true;
                    item.detailId = doc[i].detail.detail;
                }
                if (doc[i].type == '4') {
                    item.bonus = 0 - item.bonus;
                    goodIdArray.push(new objectId(doc[i].detail.goodId));
                }
                bonusList.push(item);
            }
            log.trace('get bonus list success, ');
            result(res, {statusCode: 900, bonusList: bonusList});
        }
    });
};

