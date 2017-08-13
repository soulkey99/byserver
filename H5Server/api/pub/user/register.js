/**
 * Created by MengLei on 2015/10/26.
 */

var db = require('./../../../../config').db;
var objectId = require('mongojs').ObjectId;
var result = require('./../../../utils/result');
var sendEmail = require('../utils/sendEmail');
var log = require('../../../../utils/log').h5;

//公众号注册
module.exports = function(req, res) {
    if (!req.body.email) {
        result(res, {statusCode: 962, message: '输入邮箱地址不能为空！'});
        return;
    }
    db.users.findOne({_id: req.body.email, userType: 'public'}, {_id: 1}, function (err, doc) {
        if (err) {
            result(res, {statusCode: 905, message: err.message});
        } else {
            if (doc) {
                //邮箱已经被注册过，不能继续
                result(res, {statusCode: 963, message: '邮箱已经被注册过！'});
            } else {
                //邮箱未被注册，可以继续
                var curTime = new Date();
                var token = require('crypto').randomBytes(16).toString('hex');
                var code = require('crypto').randomBytes(16).toString('hex');
                var item = {
                    _id: new objectId(),
                    authSign: token,
                    email: req.body.email,
                    nick: req.body.nick || '',
                    passwd: req.body.passwd,
                    pubID: '',
                    intro: req.body.intro || '',
                    userType: 'public',
                    userInfo: {
                        name: '',
                        phone: '',
                        gender: '',
                        id_no: '',
                        age: '',
                        birthday: '',
                        address: {
                            country: '中国',
                            province: '',
                            city: '',
                            region: '',
                            address: ''
                        },
                        avatar: '',
                        create_time: curTime.getTime(),
                        last_login: curTime.getTime(),
                        verify_info: {
                            verify_desc: '',
                            id_pic: '',
                            id_back: '',
                            certificate_pic: '',
                            verify_type: 'notVerified',
                            admin_reason: ''
                        }
                    },
                    status: 'inactive',
                    checkCode: code
                };
                db.users.insert(item, function (err2) {
                    if (err2) {
                        result(res, {statusCode: 905, message: err2.message});
                    } else {
                        sendEmail(item.email, item.checkCode);
                        result(res, {statusCode: 900, userID: item._id.toString()});
                    }
                });
            }
        }
    });
};
