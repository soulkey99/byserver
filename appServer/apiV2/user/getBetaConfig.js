/**
 * Created by MengLei on 2016/2/4.
 */

var result = require('../../utils/result');
var log = require('../../../utils/log').http;
var proxy = require('../../../common/proxy');

//获取内测配置信息
module.exports = function(req, res){
    var param = {userID: req.body.userID};
    if(req.body.userType){
        param.userType = req.body.userType;
    }
    if(req.headers.platform){
        param.platform = req.headers.platform.toLowerCase();
    }
    proxy.Beta.getBetaByUser(param, function(err, doc){
        if(err){
            return result(res, {statusCode: 905, message: err.message});
        }
        return result(res, {statusCode: 900, config: doc});
    });
};
