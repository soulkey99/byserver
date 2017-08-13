/**
 * Created by MengLei on 2015/11/18.
 */

var result = require('../../../utils/result');
var proxy = require('../../../../common/proxy');
var log = require('../../../../utils/log').h5;

//管理员获取系统中已存在的广告列表
module.exports = function(req, res) {
    var param = {};
    if (req.body.getType == 'preview') {
        //这里是预览功能
        if (req.body.time) {
            param.time = req.body.time;
        }
        if (req.body.platform) {
            param['platform'] = req.body.platform;
        }
        if (req.body.userType) {
            param['userType'] = req.body.userType;
        }
        proxy.Advertise.getCurrentAd(param, function (err, doc) {
            if (err) {
                return result(res, {statusCode: 905, message: err.message});
            }
            return result(res, {statusCode: 900, list: doc});
        });
    } else {
        //这里是正常的获取列表
        param = {startPos: req.body.startPos, pageSize: req.body.pageSize};
        if (req.body.valid) {
            param['valid'] = req.body.valid;
        }
        if (req.body.time) {
            param['time'] = req.body.time;
        }
        if (req.body.userType) {
            param['userType'] = req.body.userType;
        }
        if (req.body.platform) {
            param['platform'] = req.body.platform;
        }
        if (req.body.type) {
            param['type'] = req.body.type;
        }
        proxy.Advertise.getList(param, function (err, doc) {
            if (err) {
                return result(res, {statusCode: 905, message: err.message});
            }
            return result(res, {statusCode: 900, list: doc});
        });
    }
};
