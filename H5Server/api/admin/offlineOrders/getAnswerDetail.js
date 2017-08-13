/**
 * Created by MengLei on 2015/9/16.
 */

var config = require('../../../../config');
var result = require('../../../utils/result');
var log = require('../../../../utils/log').http;
var dnode = require('../../../utils/dnodeClient');
var zrpc = require('../../../../utils/zmqClient');

//获取答案详情
module.exports = function(req, res){
    var param = {
        answer_id: req.body.answer_id,
        userID: req.body.userID
    };
    zrpc('orderServer', 'getOfflineAnswerDetail', param, function(err, resp){
        if(err){
            //
            log.error('get offline answer detail error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        }else{
            log.trace('get offline answer detail request success.');
            result(res, {statusCode: 900, detail: resp});
        }
    });
};
