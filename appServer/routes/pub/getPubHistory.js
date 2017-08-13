/**
 * Created by MengLei on 2015/10/28.
 */

var config = require('../../../config');
var result = require('../../utils/result');
var log = require('../../../utils/log').http;
var dnode = require('../../utils/dnodeClient');

module.exports = function (req, res) {
    //获取公众号历史消息
    var param = {
        userID: req.body.userID,
        u_id: req.body.u_id
    };
    if(req.body.startPos){
        param.startPos = req.body.startPos;
    }
    if(req.body.pageSize){
        param.pageSize = req.body.pageSize;
    }
    dnode('orderServer', 'getPubHistory', param, function(err, resp){
        if(err){
            result(res, {statusCode: 905, message: err});
        }else {
            log.trace('get pub history request success.');
            result(res, resp);
        }
    });
};