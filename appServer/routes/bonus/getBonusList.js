/**
 * Created by MengLei on 2015/7/20.
 */

var config = require('../../../config');
var db = require('../../../config').db;
var result = require('../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('../../../utils/log').http;

//获取积分列表
//type： 0：新用户注册奖励，1：完善个人资料，2：抢答，3：提问，4：回答获5星好评，5：问题被关注，6：答案被赞，7：签到得积分，8：邀请用户得积分，9：管理扣分，10：关注用户。
module.exports = function(req, res) {
    //获取积分记录列表
    var query = {userID: req.body.userID};
    if (req.body.startTime && req.body.endTime) {
        query['detail.t'] = {$gte: parseInt(req.body.startTime), $lte: parseInt(req.body.endTime)};
    } else if (req.body.endTime) {
        query['detail.t'] = {$lte: parseInt(req.body.endTime)};
    } else if (req.body.startTime) {
        query['detail.t'] = {$gte: parseInt(req.body.startTime)};
    }
    var start = parseInt(req.body.startPos || '1') - 1;
    var count = parseInt(req.body.pageSize || '10');

    if (req.body.type) {
        query['type'] = req.body.type;
    }

    db.bonus.find(query).sort({'detail.t': -1}).skip(start < 0 ? 0 : start).limit(count).toArray(function (err, doc) {
        if (err) {
            result(res, {statusCode: 905, message: err.message});
        } else {
            var bonusList = [];
            for (var i = 0; i < doc.length; i++) {
                bonusList.push({bonusID: doc[i]._id.toString(), bonus: doc[i].bonus, time: doc[i].detail.t, type: doc[i].type});
            }
            log.trace('get bonus list success, ');
            result(res, {statusCode: 900, bonusList: bonusList});
        }
    })
};
