/**
 * Created by MengLei on 2015/9/16.
 */

var db = require('./../../../../config').db;
var result = require('./../../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('./../../../../utils/log').h5;

//编辑教师(action=edit，默认)、创建教师(action=create)
module.exports = function(req, res){
    if(!req.body.phonenum){
        result(res, {statusCode: 922, message: 'phone number null.'});
        return;
    }

    if(req.body.action == 'create'){
        //创建
        db.userConf.findOne({phonenum: req.body.phonenum}, {_id: 1}, function(err, doc){
            if(err){
                result(res, {statusCode: 905, message: err.message});
            }else{
                if(doc){
                    //手机号存在，不能创建
                    result(res, {statusCode: 901, message: 'already exists.'});
                }else{
                    //手机号不存在，可以创建
                    var item = {
                        phonenum: req.body.phonenum,
                        type: 'teacher',
                        smscode: req.body.smscode || '',
                        status: 'normal',
                        grabConf: {
                            posibility: 1,
                            status: 'normal'
                        },
                        name: req.body.name,
                        desc: req.body.desc || '',
                        delete: false
                    };
                    db.userConf.insert(item, function(err2){
                        if(err2){
                            result(res, {statusCode: 905, message: err2.message});
                        }else{
                            result(res, {statusCode: 900});
                        }
                    })
                }
            }
        });
    }else{
        //编辑
        db.userConf.findOne({phonenum: req.body.phonenum}, {_id: 1}, function(err, doc){
            if(err){
                result(res, {statusCode: 905, message: err.message});
            }else{
                if(doc){
                    //手机号存在，可以修改
                    var setObj = {};
                    if(req.body.name != undefined){
                        setObj.name = req.body.name;
                    }
                    if(req.body.smscode != undefined){
                        setObj.smscode = req.body.smscode;
                    }
                    if(req.body.desc != undefined){
                        setObj.desc = req.body.desc;
                    }
                    if(req.body.delete != undefined){
                        setObj.delete = (req.body.delete == 'true');
                    }
                    db.userConf.update({phonenum: req.body.phonenum}, {$set: setObj}, function(err2){
                        if(err2){
                            result(res, {statusCode: 905, message: err2.message});
                        }else{
                            result(res, {statusCode: 900});
                        }
                    });
                }else{
                    //手机号不存在，不能修改，让用户去创建
                    result(res, {statusCode: 902, message: 'phone number not exists.'});
                }
            }
        });
    }
};