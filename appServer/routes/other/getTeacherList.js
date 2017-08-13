/**
 * Created by zhengyi on 15/2/26.
 */
var config = require('../../../config');
var objectId = require('mongojs').ObjectId;
var result = require('../../utils/result');
var log = require('../../../utils/log').http;

module.exports = function (req, res) {
    var users = config.db.collection('users');

    var start = req.body.startPos ? req.body.startPos : 1;  //start从1开始
    var count = req.body.pageSize ? req.body.pageSize : 5;  //默认页面大小为5
    var query = {"userType": "teacher", "status": "online"};

    //搜索分三种情况，只有年级，只有科目，既有年级也有科目
    if (req.body.grade) {
        if (req.body.subject) {
            query = {
                "userType": "teacher",
                "status": "online",
                "userInfo.teacher_info.grades": {
                    $elemMatch: {
                        grade: req.body.grade,
                        subjects: {
                            $elemMatch: {
                                subject: req.body.subject
                            }
                        }
                    }
                }
            };
        }
        else {
            query = {
                "userType": "teacher",
                "status": "online",
                "userInfo.teacher_info.grades": {
                    $elemMatch: {
                        grade: req.body.grade
                    }
                }
            };
        }

    }
    else {
        if (req.body.subject) {
            query = {
                "userType": "teacher",
                "status": "online",
                "userInfo.teacher_info.grades": {
                    $elemMatch: {
                        subjects: {
                            $elemMatch: {
                                subject: req.body.subject
                            }
                        }
                    }
                }
            };
        }
    }

    log.debug('get teacher list, grade: ' + req.body.grade || '' + ', subject: ' + req.body.subject || '');
    users.find(query, {
        "authSign": 0,
        "userInfo.student_info": 0,
        "userInfo.ext_info": 0
    }).skip((parseInt(start) - 1) < 0 ? 0 : (parseInt(start) - 1)).limit(parseInt(count)).toArray(function (err, doc) {
        if (err) {
            //handle error
            log.error('get teacher list error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        } else {
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
            log.debug('get teacher list success.');
            result(res, {statusCode: 900, teacherList: doc});
        }
    });
};