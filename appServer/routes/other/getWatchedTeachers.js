/**
 * Created by zhengyi on 15/2/26.
 */
var config = require('../../../config');
var objectId = require('mongojs').ObjectId;
var result = require('../../utils/result');
var log = require('../../../utils/log').http;

module.exports = function (req, res) {

    var users = config.db.collection('users');
    users.findOne({_id: new objectId(req.body.userID)}, function (err, doc) {
        if (err) {
            log.error('get watched teachers error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        } else {
            if (doc) {
                if (doc.authSign == req.body.authSign) {
                    //{ $or: [ { <expression1> }, { <expression2> }, ... , { <expressionN> } ] }
                    var wTeachers = [];
                    //如果从数据库中取到的关注列表有内容，则赋值，否则直接使用空数组
                    if (doc.userInfo.student_info.watchedTeachers) {
                        wTeachers = doc.userInfo.student_info.watchedTeachers;
                    }
                    //result(res, {statusCode: 900, teacherList: wTeachers});

                    //获取关注教师列表，返回的列表结构，与普通的获取教师，返回的结构相同
                    var query = [];
                    wTeachers.forEach(function (element, index, array) {
                        query.push({_id: new objectId(element.t_id)});
                    });
                    log.debug('watched teacher list: ' + JSON.stringify(wTeachers));

                    //判断一下，如果关注列表为空，那么不去数据库里面查询，直接返回空list
                    if (query.length > 0) {
                        users.find({$or: query}, {
                            "authSign": 0,
                            "userInfo.student_info": 0,
                            "userInfo.ext_info": 0
                        }, function (err, doc) {
                            if (err) {
                                result(res, {statusCode: 905, message: err.message});
                            }
                            else {
                                for (var i = 0; i < doc.length; i++) {
                                    doc[i].t_id = doc[i]._id.toString();
                                    var name = doc[i].userInfo.name;
                                    //判断，如果是手机号，那么取前三位后四位，中间用****代替
                                    if (/^1[3|4|5|7|8][0-9]\d{8}$/.test(name)) {
                                        doc[i].userInfo.name = name.substr(0, 3) + '****' + name.substr(7, 4);
                                    }
                                    var phone = doc[i].phone;
                                    //判断，如果是手机号，那么取前三位后四位，中间用****代替
                                    if (/^1[3|4|5|7|8][0-9]\d{8}$/.test(phone)) {
                                        doc[i].phone = phone.substr(0, 3) + '****' + phone.substr(7, 4);
                                    }
                                    delete(doc[i]._id);
                                }
                                result(res, {statusCode: 900, teacherList: doc});
                                //var resobj = {
                                //    statusCode:"900",
                                //    teacherList:doc
                                //}
                            }
                        });
                    } else {
                        result(res, {statusCode: 900, teacherList: []});
                    }
                } else {
                    result(res, {statusCode: 903, message: 'token invalid.'});
                }
            }
            else {
                result(res, {statusCode: 905, message: 'user not exists.'});
            }
        }
    });
};