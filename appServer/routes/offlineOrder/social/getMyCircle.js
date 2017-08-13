/**
 * Created by MengLei on 2015/9/11.
 */

var config = require('../../../../config');
var result = require('../../../utils/result');
var log = require('../../../../utils/log').http;
var dnode = require('../../../utils/dnodeClient');

//获取圈子列表，param={userID: '', type: '', startPos: '', pageSize: '', time: 123}，type是过滤信息类型
module.exports = function(req, res){
    var param = {
        userID: req.body.userID,
        startPos: req.body.startPos || '1',
        pageSize: req.body.pageSize || '10'
    };
    if(req.body.time){
        param.time = req.body.time;
    }
    if(req.body.type){
        param.type = req.body.type;
    }
    dnode('orderServer', 'getMyCircle', param, function(err, resp){
        if(err){
            //
            log.error('get my circle error: ' + err.message);
            result(res, {statusCode: 905, message: err});
        }else{
            log.trace('get my circle request success. userID=' + param.userID);
            result(res, resp);
        }
    });
};