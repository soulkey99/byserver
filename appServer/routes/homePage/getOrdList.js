/**
 * Created by zhengyi on 15/2/25.
 */
var result = require('../../utils/result');
var log = require('../../../utils/log').http;
var proxy = require('../../../common/proxy');

module.exports = function (req, res) {
    var param = {userID: req.body.userID, userType: req.body.userType, startPos: req.body.startPos, pageSize: req.body.pageSize, status: req.body.status, grade: req.body.grade, subject: req.body.subject};
    proxy.Order.getOrderList(param, function(err, doc){
        if(err){
            log.error('get order list error: ' + err.message);
            return result(res, {statusCode: 905, message: err.message});
        }
        log.trace('get order list success.');
        result(res, {statusCode: 900, ordList: doc});
    });
};
