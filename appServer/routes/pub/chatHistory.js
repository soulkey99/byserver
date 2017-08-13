/**
 * Created by MengLei on 2015/11/27.
 */

var result = require('../../utils/result');
var log = require('../../../utils/log').http;
var dnode = require('../../utils/dnodeClient');

module.exports = function (req, res) {
    //公众号页面输入消息
    var param = {
        userID: req.body.userID,
        pub_id: req.body.pub_id,
        startPos: '1',
        pageSize: '10'
    };
    if(req.body.startPos){
        param.startPos = req.body.startPos;
    }
    if(req.body.pageSize){
        param.pageSize = req.body.pageSize;
    }
    if(req.body.time){
        param.time = req.body.time;
    }
    dnode('orderServer', 'pubChatHistory', param, function(err, resp){
        if(err){
            result(res, {statusCode: 905, message: err});
        }else {
            log.trace('get pub history request success.');
            result(res, resp);
        }
    });
};
