/**
 * Created by MengLei on 2015/5/17.
 */

var config = require('../../../config');
var objectId = require('mongojs').ObjectId;
var result = require('../../utils/result');
var db = config.db;
var dbLog = require('../../../utils/log').dbLog;
var log = require('../../../utils/log').http;

module.exports = function(req, res) {
    //输入邀请码和手机号，统计邀请数据

    if(!req.body.phonenum){
        //没输入手机号则默认返回错误
        result(res, {statusCode: 922, message: 'phone number null.'});
        return;
    }
    if(!req.body.shareCode){
        //没输入邀请码则默认添加
        req.body.shareCode = 'system';
    }
    db.users.findOne({phone: req.body.phonenum}, function (err3, doc3) {
        if (err3) {
            log.error('input share code, find phone num from user db error: ' + err3.message);
            result(res, {statusCode: 905, message: err3.message});
        } else {
            if (doc3) {
                //已注册过用户，不可以邀请
                log.error('input phone num already registered, phone: ' + req.body.phonenum);
                sendResp(res, {statusCode: 921, platform: req.body.platform, from: req.body.from});
                //result(res, {statusCode: 921, message: 'already registered'});
            } else {
                //可以邀请
                db.promotion.findOne({phonenum: req.body.phonenum}, function (err, doc) {
                    if (err) {
                        //handle error
                        log.error('input share code: ' + err.message);
                        result(res, {statusCode: 905, message: err.message});
                    } else {
                        if (doc) {
                            //已输入过邀请码
                            log.trace('phone num: ' + req.body.phonenum + ' already invited.');
                            sendResp(res, {statusCode: 920, platform: req.body.platform, from: req.body.from});
                            //result(res, {statusCode: 920, message: 'already invited.'});
                        } else {
                            //未输入过邀请码，在邀请数据库中添加一条记录，记录邀请信息，同时自动在用户表中创建用户，各种信息取默认值
                            var curTime = new Date().getTime();
                            var sCodeObj = {
                                shareCode: req.body.shareCode,
                                phonenum: req.body.phonenum,
                                from: req.body.from,
                                role: req.body.role,
                                registered: false,
                                time: curTime
                            };
                            //插入数据库
                            db.promotion.insert(sCodeObj, function (err, doc) {
                                if (err) {
                                    //handle error
                                    log.error('input share code error: ' + err.message);
                                    result(res, {statusCode: 905, message: err.message});
                                } else {
                                    log.trace('input share code success.');
                                    sendResp(res, {platform: req.body.platform, from: req.body.from});
                                }
                            });
                            //创建新用户
                            var newUser = {  //初始化用户信息
                                _id: new objectId(),
                                phone: req.body.phonenum,
                                nick: req.body.phonenum.substr(0, 3) + '****' + req.body.phonenum.substr(7, 4),  //在初始化用户信息的时候，默认将昵称设置为手机号（取前三位后四位，中间用xxxx代替），后续可以修改
                                intro: '这个人很懒，什么也没留下...',
                                authSign: '',
                                status: "offline",
                                userType: '',
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
                                        grades: config.initTeacherGrades,
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
                                    create_time: curTime,
                                    last_login: '',
                                    ext_info: {
                                        first: true, //首次登陆之后，改为false
                                        promoterShareCode: req.body.shareCode //被哪个邀请码邀请到的
                                    }
                                }
                            };
                            if(req.body.shareCode == 'uM2Mw'){  //特殊渠道，开全科
                                newUser.config = {subject: 'all_subject'};
                            }
                            db.users.save(newUser);
                            var dbObj = {shareCode: req.body.shareCode};
                            if (req.body.school) {
                                dbObj['school'] = req.body.school;
                            }
                            if (req.body.grade) {
                                dbObj['grade'] = req.body.grade;
                            }
                            if (req.body.class) {
                                dbObj['class'] = req.body.class;
                            }
                            //记录输入邀请码的信息
                            dbLog(newUser._id.toString(), 'invite', dbObj);
                        }
                    }
                });
            }
        }
    });

};


function sendResp(res, params) {
    var resObj = {};

    resObj.statusCode = params.statusCode || 900;
    db.update.findOne({_id: 'download'}, function (err2, doc2) {
        if (err2) {
            //handle error
        } else {
            //
            if (params.platform == 'ios') { //ios系统
                if (params.from == '1') {
                    //教师端
                    resObj.url = doc2.ios_t;
                } else {
                    //学生端
                    resObj.url = doc2.ios_s;
                }

            } else {
                //安卓系统
                if (params.from == '1') {
                    //教师端
                    resObj.url = doc2.android_t;
                } else {
                    //学生端
                    resObj.url = doc2.android_s;
                }
            }

            result(res, resObj);
        }
    });
}