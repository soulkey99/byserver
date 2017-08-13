/**
 * Created by MengLei on 2015/7/11.
 */

var db = require('./../../../config').db;
var result = require('./../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('./../../../utils/log').admin;

//通过手机号，创建新用户（已有用户则直接返回用户信息）
//传递手机号、昵称、userType
module.exports = function(req, res){
    db.users.findOne({phone: req.body.phonenum}, function(err, doc){
        if(err){
            log.error('get user by phone error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        }else{
            if(doc){
                delete(doc.authSign);
                doc.created = false;
                db.shareCode.findOne({userID: doc._id.toString()}, function(err2, doc2){
                    if(err2){
                        //handle error
                    }else{
                        if(doc2) {
                            doc.shareCode = doc2.shareCode;
                        }
                        doc.userID = doc._id.toString();
                        result(res, {statusCode: 900, user: doc});
                    }
                })
            }else{
                log.error('user not exists. create a new one');
                var _id = new objectId();
                log.trace('new user, userID: ' + _id.toString() + ', authSign: ' + token);
                var phone = req.body.phonenum;
                var phoneNick = phone;
                if (phone.length == 11) {
                    phoneNick = phone.substr(0, 3) + '****' + phone.substr(7, 4);
                }
                var curTime = new Date().getTime();
                var resObject = {  //初始化用户信息
                    _id: _id,
                    phone: phone,
                    nick: phoneNick,  //在初始化用户信息的时候，默认将昵称设置为手机号（取前三位后四位，中间用xxxx代替），后续可以修改
                    authSign: '',
                    status: "offline",
                    userType: req.body.userType,
                    userInfo: {
                        name: '',
                        family_name: '',
                        given_name: '',
                        gender: '',
                        id_no: '',
                        age: '',
                        birthday: '',
                        money: 0,
                        promoter: false,
                        address: {
                            country: '中国',
                            province: '',
                            city: '',
                            region: '',
                            address: ''
                        },
                        school: '',
                        student_info: {
                            grade: '',
                            watchedTeachers: []
                        },
                        teacher_info: {
                            grades: [],
                            verify_type: 'notVerified',
                            id_pic: '',
                            certificate_pic: '',
                            verify_desc: '',
                            admin_reason: '',
                            orders_grabbed: 0,
                            order_finished: 0,
                            stars: 0,
                            point: 0
                        },
                        ext_info: {
                            first: true, //首次登陆之后改为false
                            promoterShareCode: '' //被哪个邀请码邀请到的
                        },
                        create_time: curTime,
                        last_login: curTime
                    }
                };

                db.users.insert(resObject);
            }
        }
    })
}