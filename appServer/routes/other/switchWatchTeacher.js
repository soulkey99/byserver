/**
 * Created by zhengyi on 15/2/26.
 */
var config = require('../../../config');
var objectId = require('mongojs').ObjectId;
var result = require('../../utils/result');
var log = require('../../../utils/log').http;

module.exports = function (req, res) {

    var users = config.db.collection('users');
    var _id = new objectId(req.body.userID);
    users.findOne({_id: _id}, function (err, doc) {
        if (err) {
            log.error('switch watch teacher error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        }
        else {
            if (doc) {
                if (doc.authSign == req.body.authSign) {
                    var wTheachers = [];
                    //如果从数据库中取到的关注列表有内容，则赋值，否则直接使用空数组
                    if (doc.userInfo.student_info.watchedTeachers) {
                        wTheachers = doc.userInfo.student_info.watchedTeachers;
                    }
                    var idx = -1; //默认index=-1
                    for (var i = 0; i < wTheachers.length; i++) {
                        //查找传入的t_id是否存在于关注列表中
                        if (wTheachers[i].t_id == req.body.t_id) {
                            idx = i;
                            break;
                        }
                    }
                    if (idx != -1) {
                        //如果关注列表中有这个教师的id，那么删除教师id
                        wTheachers.splice(idx, 1);
                        users.update({_id: _id}, {$set: {"userInfo.student_info.watchedTeachers": wTheachers}}, function (err) {
                            if (err) {
                                //handle error
                                log.error('switch watch teacher error: ' + err.message);
                                result(res, {statusCode: 905, message: err.message});
                            } else {
                                //success
                                log.debug('switch watch teacher success, operate: unwatch');
                                result(res, {statusCode: 900, operate: 'unwatch'});
                            }
                        });
                    } else {
                        //如果关注列表中没有这个教师的id，那么将教师id添加到关注列表
                        var _tid = new objectId(req.body.t_id);
                        //首先通过教师id去数据库中查找教师信息
                        users.findOne({_id: _tid}, function (err, doc) {
                            if (err) {
                                //handle error
                                log.error('switch watch teacher error: ' + err.message);
                                result(res, {statusCode: 905, message: err.message});
                            } else {
                                if (doc) {
                                    //如果有教师信息，那么取出教师name
                                    var name = doc.userInfo.name;
                                    wTheachers.push({t_id: req.body.t_id, t_name: name});
                                    users.update({_id: _id}, {$set: {"userInfo.student_info.watchedTeachers": wTheachers}}, function (err) {
                                        if (err) {
                                            //handle error
                                            log.error('switch watch teacher error: ' + err.message);
                                            result(res, {statusCode: 905, message: err.message});
                                        } else {
                                            //success
                                            log.debug('switch watch teacher success, operate: watch');
                                            result(res, {statusCode: 900, operate: 'watch'});
                                        }
                                    })
                                } else {
                                    //没有教师信息就返回错误
                                    log.error('switch watch teacher error teacher not exists.');
                                    result(res, {statusCode: 905, message: 'teacher not exists.'});
                                }
                            }
                        });
                    }
                } else {
                    //token校验失败
                    result(res, {statusCode: 903});
                }
            } else {
                //用户不存在
                result(res, {statusCode: 902});
            }
        }
    });
};