/**
 * Created by MengLei on 2015/9/15.
 */

var config = require('../../../../config');
var result = require('../../../utils/result');
var log = require('../../../../utils/log').http;
var dnode = require('../../../utils/dnodeClient');
var zrpc = require('../../../../utils/zmqClient');

//获取离线答案列表，param = {userID: '', off_id: ''}
module.exports = function(req, res){
    var param = {
        userID: req.body.userID,
        off_id: req.body.off_id,
        startPos: req.body.startPos || '1',
        pageSize: req.body.pageSize || '10'
    };
    if(req.body.sort){
        param.sort = req.body.sort;
    }
    zrpc('orderServer', 'getOfflineAnswerList', param, function (err, resp) {
        if (err) {
            //
            log.error('reply offline answer list error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        } else {
            log.trace('reply offline answer list request success.');
            result(res, {statusCode: 900, list: resp});
        }
    });
};
