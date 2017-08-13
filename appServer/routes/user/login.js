/**
 * Created by zhengyi on 15/2/25.
 */

var config = require('../../../config');
var db = require('../../../config').db;
var result = require('../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('../../../utils/log').http;
var dbLog = require('../../../utils/log').dbLog;
var addBonus = require('../../utils/addBonus');
var handleInvite = require('./../../utils/handleInvite');

module.exports = function (req, res) {

    //TODO:这两行为了测试时候使用，实际运行的时候需要注释掉
    //handleData(req, res, '{}');
    //return;
    //测试号码
    if (config.testPhones.indexOf(req.body.phonenum) >= 0 ||
        req.body.phonenum.indexOf('9020') == 0 || req.body.phonenum.indexOf('9010') == 0 || req.body.phonenum.indexOf('9030') == 0) {
        if (req.body.smscode == '123123') {
            log.trace('test number login.');
            handleData(req, res, '{}');
            return;
        }
    }

    if(config.production_mode == 'false') {
        //测试环境才生效
        if (req.body.smscode == '123123') {
            handleData(req, res, '{}');
            return;
        }
    }

    //教师手机号
    if (config.teacherPhones.indexOf(req.body.phonenum) >= 0) {
        if (req.body.smscode == '456456') {
            log.trace('teacher number login.');
            handleData(req, res, '{}');
            return;
        }
    }

    var http = require('https');
    var path = '/1.1/verifySmsCode/' + req.body.smscode + '?mobilePhoneNumber=' + req.body.phonenum;
    var options = {
        host: 'leancloud.cn',
        path: path,
        method: 'POST',
        headers: config.smsConfig
    };

    var httpReq = http.request(options, function (httpRes) {
        httpRes.setEncoding('utf8');
        httpRes.on('data', function (data) {
            log.debug('check sms code at leancloud:' + data);
            handleData(req, res, data);
        });
    });

    httpReq.on('error', function (e) {
        log.error('login, third part sms service error: ' + e.message);
        result(res, {statusCode: 905, error: 'third part sms service error.'});
    });

    httpReq.end();
};

function handleData(req, res, data) {
    var dataObj = {};
    try{
        dataObj = JSON.parse(data);
    }catch(ex){
        log.error('handle leancloud data error: ' + ex.message);
        result(res, {statusCode: 912, message: 'sms service error.'});
        return;
    }
    if (!dataObj.code) {
        //登录或注册
        var users = config.db.collection('users');
        users.findOne({'phone': req.body.phonenum}, function (err, doc) {
            if (err) {
                result(res, {statusCode: 905, message: err.message});
            } else {
                var curTime = new Date().getTime();
                //数据库中有数据，判断是否首次登陆，如果不是，走正常登陆流程，否则，就是注册新用户
                if (doc) {
                    //如果是通过邀请码的方式注册的用户并且这是首次登陆，那么就给用户增加对应的奖励，然后走正常登陆流程
                    if (doc.userInfo.ext_info && doc.userInfo.ext_info.first == true) {
                        db.promotion.findOne({phonenum: req.body.phonenum}, function (err2, doc2) {
                            if (err2) {
                                //handle error
                                log.error('first time login error: ' + err2.message);
                                result(res, {statusCode: 905, message: err2.message});
                            } else {
                                if (doc2 && doc2.registered == false) {
                                    //该用户曾经输入过邀请码，首次登陆将推广数据库中已注册字段置为true。
                                    db.promotion.update({phonenum: req.body.phonenum}, {$set: {registered: true}});
                                    //为该用户增加首次登陆奖励，传递userid，由handleInvite函数取处理奖励信息
                                    handleInvite.firstLogin(doc.phone);

                                    //判断邀请码的主人是普通用户还是推广人员
                                    if (doc2.role == '0') { //普通用户
                                        //查询邀请码主人的id
                                        db.shareCode.findOne({shareCode: doc2.shareCode}, function(err3, doc3){
                                            if(err3){
                                                //handle error
                                            }else{
                                                //发放推广奖励（只发一次奖励，同时将对应bonus字段置为true，表示已经发放过奖励，下次不再发放）
                                                if(doc3 && !doc3.bonus) {
                                                    handleInvite.inviter(doc3.userID);
                                                    db.shareCode.update({shareCode: doc2.shareCode}, {$set: {bonus: true}});
                                                }
                                            }
                                        });
                                    }
                                    //接下来正常登陆流程
                                    doLogin(req, res, doc);
                                    //发放首次登陆奖励
                                    addBonus(doc._id.toString(), '0');
                                } else {
                                    //如果不符合上面的条件，走正常登陆流程
                                    doLogin(req, res, doc);
                                }
                            }
                        });
                    } else {
                        //否则走正常登陆流程
                        doLogin(req, res, doc);
                    }
                } else {
                    ///数据库中没有数据，走普通注册流程
                    if (!req.body.userType) {
                        result(res, {statusCode: 904});
                    } else {
                        //由于只要输入过邀请码，数据库中必定有数据，所以此分支的用户是肯定没有输入过邀请码的，所以只要给发放首次登陆奖励即可
                        //如果之前没有输入过邀请码，那么就正常注册
                        require('crypto').randomBytes(16, function (ex, buf) {

                            var token = buf.toString('hex');
                            var _id = new objectId();
                            log.trace('new user, userID: ' + _id.toString() + ', authSign: ' + token);
                            var phone = req.body.phonenum;
                            //发放首次登陆奖励
                            handleInvite.firstLogin(phone);
                            var phoneNick = phone;
                            if (phone.length == 11) {
                                phoneNick = phone.substr(0, 3) + '****' + phone.substr(7, 4);
                            }

                            var resObject = {  //初始化用户信息
                                _id: _id,
                                phone: phone,
                                nick: phoneNick,  //在初始化用户信息的时候，默认将昵称设置为手机号（取前三位后四位，中间用xxxx代替），后续可以修改
                                authSign: token,
                                status: "online",
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
                                    bonus: 0,
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
                                    ext_info: {
                                        first: false, //首次登陆之后改为false
                                        promoterShareCode: '' //被哪个邀请码邀请到的
                                    },
                                    create_time: curTime,
                                    last_login: curTime
                                }
                            };
                            users.insert(resObject);
                            //
                            resObject.userID = _id.toString();
                            resObject.statusCode = 900;
                            delete(resObject._id);
                            log.trace('login response data: ' + JSON.stringify(resObject));
                            result(res, resObject);
                            //发放首次登陆奖励
                            addBonus(resObject.userID, '0');
                            //记录登录log
                            dbLog(resObject.userID, 'register', {api: 'v1'});
                        });
                    }
                }
            }
        });
    } else {
        //短信验证码无效的情况
        log.error('sms code for phone: ' + req.body.phonenum + ' error: ' + data);
        result(res, {statusCode: 911, message: 'sms code error.'});
        //result(res, dataObj);
    }
}


function doLogin(req, res, doc) {
    var curTime = new Date().getTime();
    var resobject = {
        phone: doc.phone,
        userID: doc._id.toString(),
        userInfo: doc.userInfo,
        nick: doc.nick,
        status: 'online',
        userType: doc.userType,
        sso_info: doc.sso_info || {}
    };
    require('crypto').randomBytes(16, function (ex, buf) {
        var token = buf.toString('hex');
        log.trace('userID: ' + doc._id.toString() + ', new authSign: ' + token);
        var setObj = {};
        //如果传入有userType，那么更新，否则保留原来的不变
        if (req.body.userType) {
            setObj = {
                "authSign": token,
                "status": "online",
                "userType": req.body.userType,
                "userInfo.last_login": curTime
            };
            resobject.userType = req.body.userType;
        } else {
            setObj = {
                "authSign": token,
                "status": "online",
                "userInfo.last_login": curTime
            };
        }

        if (doc.userInfo.ext_info && doc.userInfo.ext_info.first == false) {
        } else {
            setObj['userInfo.ext_info.first'] = false;//如果这个字段没有置为true，那么就置为true
        }

        db.pushTokens.remove({_id: doc._id});   //登陆成功之后，就删除掉之前保存的device_token信息，如果需要，那么再次report，不保留之前的

        db.users.update({_id: doc._id}, {$set: setObj});
        resobject.statusCode = 900;
        resobject.authSign = token;
        //console.log('res:' + JSON.stringify(resobject));
        log.trace('login response data: ' + JSON.stringify(resobject));
        result(res, resobject);
        dbLog(resobject.userID, 'login', {api: 'v1'});
    });
}