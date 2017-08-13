/**
 * Created by MengLei on 2015/9/16.
 */

var config = require('../../../../config');
var result = require('../../../utils/result');
var log = require('../../../../utils/log').http;
var dnode = require('../../../utils/dnodeClient');
var zrpc = require('../../../../utils/zmqClient');

//获取离线答案下面的评论列表，param = {userID: '', answer_id: ''}
module.exports = function(req, res){
    var param = {
        userID: req.body.userID,
        answer_id: req.body.answer_id,
        startPos: req.body.startPos || '1',
        pageSize: req.body.pageSize || '10'
    };
    if(req.body.sort){
        param.sort = req.body.sort;
    }
    zrpc('orderServer', 'getOfflineReplyList', param, function(err, resp){
        if(err){
            //
            log.error('get offline reply list error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        }else{
            log.trace('get offline reply list request success.');
            result(res, {statusCode: 900, list: resp});
        }
    });
};
