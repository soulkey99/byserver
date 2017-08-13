/**
 * Created by MengLei on 2015/9/14.
 */

var config = require('../../../../config');
var result = require('../../../utils/result');
var log = require('../../../../utils/log').h5;
var dnode = require('../../../utils/dnodeClient');
var zrpc = require('../../../../utils/zmqClient');

//获取离线问题列表
module.exports = function(req, res){
    var param = {
        userID: req.body.userID,
        tab: 'time',    //默认只按照时间倒序排列
        startPos: req.body.startPos || '1',
        pageSize: req.body.pageSize || '10'
    };
    if(req.body.startTime){
        param.startTime = req.body.startTime;
    }
    if(req.body.endTime){
        param.endTime = req.body.endTime;
    }
    if(req.body.grade){
        param.grade = req.body.grade;
    }
    if(req.body.subject){
        param.subject = req.body.subject;
    }
    if(req.body.tag){
        param.tag = req.body.tag.split(',');
    }
    if(req.body.status){
        param.status = req.body.status.split(',');
    }
    if(req.body.section){
        param.section = req.body.section;
    }

    zrpc('orderServer', 'getOfflineTopicList', param, function(err, resp){
        if(err){
            //
            log.error('get offline topic list error: ' + err.message);
            result(res, {statusCode: 905, message: err});
        }else{
            log.trace('get offline topic list request success.');
            result(res, {statusCode: 900, list: resp});
        }
    });
};

