/**
 * Created by MengLei on 2015/8/7.
 */

var db = require('./../../../../config').db;
var config = require('./../../../../config');
var objectId = require('mongojs').ObjectId;
var result = require('./../../../utils/result');
var log = require('../../../../utils/log').h5;


//增加商户
module.exports = function(req, res){
    var _id = new objectId();
    if(req.body.shopID){
        //对已有商户进行编辑
        _id = new objectId(req.body.shopID);
        var setObj = {};
        if(req.body.shopName){
            setObj.nick = req.body.shopName;
        }
        if(req.body.userName){
            setObj.userName = req.body.userName;
        }
        if(req.body.passwd){
            setObj.userPwd = req.body.passwd;
        }
        if(req.body.name){
            setObj['userInfo.name'] = req.body.name;
        }
        if(req.body.phone){
            setObj['userInfo.phone'] = req.body.phone;
        }
        if(req.body.desc){
            setObj['userInfo.desc'] = req.body.desc;
        }
        if(req.body.address){
            setObj['userInfo.address'] = req.body.address;
        }
        db.admins.update({_id: _id}, {$set: setObj}, function(err, doc){
            if(err){
                result(res, {statusCode: 905, message: err.message});
            }else{
                result(res, {statusCode: 900});
            }
        });
    }else{
        //新建商户
        var info = {
            _id: _id,
            nick: req.body.shopName,
            userName: req.body.userName,
            userPwd: req.body.passwd,
            adminType: req.body.type || 'shop',
            userInfo: {
                name: req.body.name,
                phone: req.body.phone,
                desc: req.body.desc,
                address: req.body.address
            },
            authSign: '',
            createTime: (new Date()).getTime(),
            lastLoginTime: 0
        };
        db.admins.insert(info, function(err, doc){
            if(err){
                result(res, {statusCode: 905, message: err.message});
            }else{
                result(res, {statusCode: 900});
            }
        });
    }
};