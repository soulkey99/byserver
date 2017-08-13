/**
 * Created by MengLei on 2015/9/14.
 */

var config = require('../../../config');
var result = require('../../utils/result');
var log = require('../../../utils/log').http;
var dnode = require('../../utils/dnodeClient');

//获取离线问题列表
module.exports = function(req, res){
    var param = {
        userID: req.body.userID,
        startPos: req.body.startPos || '1',
        pageSize: req.body.pageSize || '10'
    };
    if(req.body.timestamp){
        param.timestamp = req.body.timestamp;
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
    if(req.body.tab){
        param.tab = req.body.tab;
    }
    dnode('orderServer', 'getOfflineTopicList', param, function(err, resp){
        if(err){
            //
            log.error('get offline topic list error: ' + err.message);
            result(res, {statusCode: 905, message: err});
        }else{
            log.trace('get offline topic list request success.');
            result(res, resp);
        }
    });
};

