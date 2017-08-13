/**
 * Created by MengLei on 2015/9/15.
 */

var config = require('../../../../config');
var result = require('../../../utils/result');
var log = require('../../../../utils/log').h5;
var dnode = require('../../../utils/dnodeClient');
var zrpc = require('../../../../utils/zmqClient');

//获取离线问题详情param={off_id: '', userID: ''}
module.exports = function(req, res){
    var param = {
        userID: req.body.userID,
        off_id: req.body.off_id
    };
    zrpc('orderServer', 'getOfflineTopicDetail', param, function(err, resp){
        if(err){
            //
            log.error('get offline topic detail error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        }else{
            log.trace('get offline topic detail request success.');
            result(res, {statusCode: 900, detail: resp});
        }
    });
};
