/**
 * Created by MengLei on 2015/9/15.
 */

var db = require('./../../../../config').db;
var result = require('./../../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('./../../../../utils/log').h5;

//教师认证接口，param: t_id='', verify=true/false, adminReason=''
module.exports = function(req, res){
    var _id = new objectId();
    try{
        _id = new objectId(req.body.t_id);
    }catch(ex){
        result(res, {statusCode: 919, message: ex.message});
        return;
    }
    db.users.findOne({_id: _id}, {_id: 1}, function(err, doc){
        if(err){
            result(res, {statusCode: 905, message: err.message});
        }else{
            if(doc){
                //教师存在，继续
                var setObj = {};
                //管理员意见
                setObj['userInfo.teacher_info.admin_reason'] = req.body.admin_reason || '';
                if(req.body.verify == 'true'){
                    //管理员确认验证通过
                    setObj['userInfo.teacher_info.verify_type'] = 'verified';
                }else{
                    //管理员拒绝验证通过
                    setObj['userInfo.teacher_info.verify_type'] = 'fail';
                }
                //修改数据库
                db.users.update({_id: _id}, {$set: setObj}, function(err2, doc2){
                    if(err2){
                        result(res, {statusCode: 905, message: err2.message});
                    }else{
                        //修改成功
                        result(res, {statusCode: 900});
                    }
                });
            }else{
                //教师不存在
                result(res, {statusCode: 902, message: 't_id not exists.'});
            }
        }
    })
};
