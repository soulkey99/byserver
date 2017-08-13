/**
 * Created by MengLei on 2015/11/23.
 */
var db = require('./../../../../config').db;
var result = require('./../../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('./../../../../utils/log').h5;

//编辑公众号账号的各种信息
module.exports = function(req, res){
    var _id = new objectId();
    if(req.body.u_id){
        try {
            _id = new objectId(req.body.u_id);
        }catch (ex){
            result(res, {statusCode: 919, message: ex.message});
            return;
        }
    }
    var setObj = {};
    if(req.body.email != undefined){
        setObj['email'] = req.body.email;
    }
    if(req.body.nick != undefined){
        setObj['nick'] = req.body.nick;
    }
    if(req.body.status != undefined){
        setObj['status'] = req.body.status;
    }
    if(req.body.name != undefined){
        setObj['userInfo.name'] = req.body.name;
    }
    if(req.body.gender != undefined){
        setObj['userInfo.gender'] = req.body.gender;
    }
    if(req.body.id_no != undefined){
        setObj['userInfo.id_no'] = req.body.id_no;
    }
    if(req.body.age != undefined){
        setObj['userInfo.age'] = req.body.age;
    }
    if(req.body.birthday != undefined){
        setObj['userInfo.birthday'] = req.body.birthday;
    }
    if(req.body.country != undefined){
        setObj['userInfo.address.country'] = req.body.country;
    }
    if(req.body.province != undefined){
        setObj['userInfo.address.province'] = req.body.province;
    }
    if(req.body.city != undefined){
        setObj['userInfo.address.city'] = req.body.city;
    }
    if(req.body.region != undefined){
        setObj['userInfo.address.region'] = req.body.region;
    }
    if(req.body.address != undefined){
        setObj['userInfo.address.address'] = req.body.address;
    }
    if(req.body.avatar != undefined){
        setObj['userInfo.avatar'] = req.body.avatar;
    }
    if(req.body.verify_desc != undefined){
        setObj['userInfo.verify_info.verify_desc'] = req.body.verify_desc;
    }
    if(req.body.id_pic != undefined){
        setObj['userInfo.verify_info.id_pic'] = req.body.id_pic;
    }
    if(req.body.certificate_pic != undefined){
        setObj['userInfo.verify_info.certificate_pic'] = req.body.certificate_pic;
    }
    if(req.body.verify_type != undefined){
        setObj['userInfo.verify_info.verify_type'] = req.body.verify_type;
    }
    if(req.body.admin_reason != undefined){
        setObj['userInfo.verify_info.admin_reason'] = req.body.admin_reason;
    }
    if(req.body.intro != undefined){
        setObj['intro'] = req.body.intro;
    }
    if(req.body.pubID != undefined){
        setObj['pubID'] = req.body.pubID;
    }
    if(req.body.passwd != undefined){
        setObj['passwd'] = req.body.passwd;
    }
    db.users.update({_id: _id}, {$set: setObj}, function(err){
        if(err){
            result(res, {statusCode: 905, message: err.message});
        }else{
            result(res, {statusCode: 900});
        }
    });
};