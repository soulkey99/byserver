/**
 * Created by MengLei on 2015/11/9.
 */

var config = require('../../../config');
var db = require('../../../config').db;
var result = require('../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('../../../utils/log').http;
var addBonus = require('./../../../utils/addBonus');
var dbLog = require('../../../utils/log').dbLog;

//用户签到，同时得到签到积分
module.exports = function(req, res){
    var today = new Date().setHours(0, 0, 0, 0);
    db.dbLog.findOne({'action': 'checkin', 'userID': req.body.userID, t: {$gte: today}}, {_id: 1}, function(err, doc){
        if(err) {
            result(res, {statusCode: 905, message: err.message});
        } else {
            if(!doc){ //今天没签到过的人，才记录签到动作并增加积分
                dbLog(req.body.userID, 'checkin');
                addBonus(req.body.userID, '7');
            }
            result(res, {statusCode: 900});
        }
    });
};
