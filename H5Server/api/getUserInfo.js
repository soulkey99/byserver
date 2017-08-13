/**
 * Created by MengLei on 2015/12/4.
 */

var result = require('./../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('./../../utils/log').h5;

//积分商城使用的，获取用户基本信息
module.exports = function(req, res){
    if(req.user && req.user.userInfo) {
        var item = {
            userID: req.user._id.toString(),
            nick: req.user.nick || '',
            phone: req.user.phone || '',
            avatar: req.user.userInfo.avatar || '',
            bonus: req.user.userInfo.bonus || 0
        };
        result(res, {statusCode: 900, info: item});
    }
};
