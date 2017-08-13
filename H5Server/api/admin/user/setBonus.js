/**
 * Created by MengLei on 2015/10/13.
 */
var db = require('./../../../../config').db;
var result = require('./../../../utils/result');
var objectId = require('mongojs').ObjectId;
var addBonus = require('../../../../utils/addBonus');
var log = require('./../../../../utils/log').h5;

//变更用户的积分
module.exports = function(req, res){
    var bonus = parseInt(req.body.bonus || 0);

    var _id = new objectId();
    try{
        _id = new objectId(req.body.u_id);
    }catch(ex){
        result(res, {statusCode: 919, message: ex.message});
        return;
    }
    var reason = req.body.reason || '';
    if(bonus < 0){
        reason = '管理员后台增加积分';
    }
    db.users.findOne({_id: _id}, {'userInfo.bonus': 1}, function(err,doc){
        if(err){
            result(res, {statusCode: 905, message: err.message});
        }else{
            if(doc){
                //用户存在，执行减分操作
                addBonus(_id.toString(), '9', {desc: reason, bonus: bonus});
                result(res, {statusCode: 900});
            }else{
                //用户不存在
                result(res, {statusCode: 902});
            }
        }
    });
};
