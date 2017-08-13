/**
 * Created by MengLei on 2015/11/3.
 */

var db = require('./../../../../config').db;
var objectId = require('mongojs').ObjectId;
var result = require('./../../../utils/result');
var log = require('../../../../utils/log').h5;

//编辑用户信息
module.exports = function(req, res) {
    //
    var _id = new objectId();
    try {
        _id = new objectId(req.body.userID);
    } catch (ex) {
        result(res, {statusCode: 919, message: ex.message});
        return;
    }
    var setObj = {};
    if (req.body.intro != undefined) {    //自我介绍
        setObj['intro'] = req.body.intro;
    }
    if (req.body.pubID != undefined) {    //公众号ID
        setObj['pubID'] = req.body.pubID;
    }
    if (req.body.name != undefined) { //用户姓名
        setObj['userInfo.name'] = req.body.name;
    }
    if (req.body.phone != undefined) {    //用户手机
        setObj['userInfo.phone'] = req.body.phone;
    }
    if (req.body.gender != undefined) {   //用户性别
        setObj['userInfo.gender'] = req.body.gender;
    }
    if (req.body.id_no != undefined) {    //身份证号码
        setObj['userInfo.id_no'] = req.body.id_no;
    }
    if (req.body.age != undefined) {  //用户年龄
        setObj['userInfo.age'] = req.body.age;
    }
    if (req.body.birthday != undefined) { //生日
        setObj['userInfo.birthday'] = req.body.birthday;
    }
    if (req.body.country != undefined) {  //国家
        setObj['userInfo.address.country'] = req.body.country;
    }
    if (req.body.province != undefined) { //省份
        setObj['userInfo.address.province'] = req.body.province;
    }
    if (req.body.city != undefined) { //城市
        setObj['userInfo.address.city'] = req.body.city;
    }
    if (req.body.region != undefined) {   //地区
        setObj['userInfo.address.region'] = req.body.region;
    }
    if (req.body.address != undefined) {  //地址
        setObj['userInfo.address.address'] = req.body.address;
    }
    if (req.body.avatar != undefined) {   //头像
        setObj['userInfo.avatar'] = req.body.avatar;
    }
    if (req.body.verify_desc != undefined) {  //验证描述
        setObj['userInfo.verify_info.verify_desc'] = req.body.verify_desc;
        setObj['userInfo.verify_info.verify_type'] = 'waitingVerify';
    }
    if (req.body.id_pic != undefined) {   //身份证图片
        setObj['userInfo.verify_info.id_pic'] = req.body.id_pic;
        setObj['userInfo.verify_info.verify_type'] = 'waitingVerify';
    }
    if (req.body.certificate_pic != undefined) {  //资格证图片
        setObj['userInfo.verify_info.certificate_pic'] = req.body.certificate_pic;
        setObj['userInfo.verify_info.verify_type'] = 'waitingVerify';
    }
    db.users.update({_id: _id}, {$set: setObj}, function (err) {
        if (err) {
            result(res, {statusCode: 905, message: err.message});
        } else {
            result(res, {statusCode: 900});
        }
    });
};
