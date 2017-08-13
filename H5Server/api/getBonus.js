/**
 * Created by MengLei on 2015/7/21.
 */

var result = require('./../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('./../../utils/log').h5;

module.exports = function(req, res){
    var bonus = req.user.userInfo.bonus || 0;
    log.trace('get bonus success, userID: ' + req.body.userID + ', bonus: ' + bonus);
    result(res, {statusCode: 900, bonus: bonus});
};