/**
 * Created by MengLei on 2015/8/27.
 */

var config = require('../../../config');
var result = require('./../../utils/result');
var log = require('./../../../utils/log').http;
var dnode = require('./../../utils/dnodeClient');

module.exports = function(req, res){
    var param = {
        userID: req.body.userID,
        startPos: req.body.startPos,
        pageSize: req.body.pageSize,
        userType: req.body.userType,
        type: req.body.type
    };
    dnode('orderServer', 'getMsgBox', param, function(err, resp){
        if(err){
            //
            log.error('get my msgbox error: ' + err.message);
            result(res, {statusCode: 905, message: err});
        }else{
            log.trace('get my msgbox request success. userID=' + param.userID);
            result(res, resp);
        }
    });
};
