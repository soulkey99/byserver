/**
 * Created by MengLei on 2015/5/27.
 */
var config = require('../../../config');
var objectId = require('mongojs').ObjectId;
var result = require('../../utils/result');
var db = config.db;
var eventproxy = require('eventproxy');
var log = require('../../../utils/log').http;

//上报设备token，后续推送时要用到
module.exports = function(req, res) {
    var _id = '';
    try {
        _id = new objectId(req.body.userID);
    } catch (ex) {
        log.error('userId not correct.');
        result(res, {statusCode: 919, message: ex.message});
        return;
    }

    db.pushTokens.findOne({token: req.body.token}, function (err2, doc2) {
        if (err2) {
            //handle error
            log.error('report token error: ' + err2.message);
            result(res, {statusCode: 905, message: 'report token error: ' + err2.message});
        } else {
            //只有在触发done事件之后，才会写入新token对应关系并返回正确与否
            var ep = new eventproxy();
            ep.all('done', function () {
                db.pushTokens.save({
                    _id: _id,
                    token: req.body.token,
                    platform: req.body.platform || 'unknown',
                    userType: req.body.userType || '',
                    channel: req.body.channel || '',    //安装包渠道号
                    version: req.body.version || ''     //软件版本号
                }, function (err, doc) {
                    if (err) {
                        log.error('report token error: ' + err.message);
                        result(res, {statusCode: 905, message: 'report token error: ' + err.message});
                    } else {
                        log.trace('report token success.');
                        result(res, {statusCode: 900});
                    }
                });
            });
            ep.fail(function(err){
                log.error('report token error: ' + err.message);
                result(res, {statusCode: 905, message: 'report token error: ' + err.message});
            });

            //处理一下原token与uid对应关系，然后再写入新的对应关系
            if (doc2) {
                if(doc2._id.toString() == req.body.userID){
                    //如果原有token与uid对应关系与新关系相同，那么直接更新即可
                    ep.emit('done');
                }else {
                    //如果原token与uid对应关系不同，那么需要清除掉原来的关系再写入新的
                    db.pushTokens.remove({_id: doc2._id}, function (err, doc) {
                        if (err) {
                            ep.emit('error', err);
                        } else {
                            ep.emit('done');
                        }
                    });
                }
            } else {
                //如果原来没有对应token的记录，那么直接写入新的token与uid关系即可
                ep.emit('done');
            }
        }
    });
};

