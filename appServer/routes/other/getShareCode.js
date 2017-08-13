/**
 * Created by MengLei on 2015/5/18.
 */

var db = require('./../../../config').db;
var config = require('./../../../config');
var objectId = require('mongojs').ObjectId;
var result = require('../../utils/result');
var randStr = require('../../utils/randStr');
var log = require('../../../utils/log').http;

module.exports = function(req, res) {
    //通过用户id获取对应的邀请码
    var userID = req.body.userID;
    db.shareCode.findOne({userID: userID, valid: true}, function (err, doc) {
        if (err) {
            //handle error
            log.error('get share code error.');
            result(res, {statusCode: 905, message: err.message});
        } else {
            //
            if (doc) {
                //如果有邀请码，那么直接返回
                log.trace('get share code success.');
                sCodeInfo(req, res, doc.shareCode);
            } else {
                //如果没有邀请码，那么就生成一个
                genShareCode(function (err, sCode) {
                    if (err) {
                        //handle error
                    } else {
                        log.trace('genShareCode: ' + sCode);
                        db.shareCode.save({
                            userID: userID,
                            shareCode: sCode,
                            from: req.user.userType == 'teacher' ? '1' : '0', //来源：0：学生端，1：教师端
                            role: req.user.userInfo.promoter == true ? '1' : '0', //角色，0：用户，1：推广员
                            valid: true,  //是否有效
                            timestamp: new Date().getTime(),
                            users: [],
                            config: ''
                        }, function (err) {
                            if (!err) {
                                sCodeInfo(req, res, sCode);//返回邀请码信息
                            } else {
                                log.error('gen share code error: ' + err);
                                result(res, {statusCode: 900, message: err.message});
                            }
                        });
                    }
                });
            }
        }
    });
};


function genShareCode(callback){
    var sCode = randStr();
    db.shareCode.findOne({shareCode: sCode}, function(err, doc){
        if(err){
            //handle error
            callback(err);
        }else{
            if(doc){
                //生成了重复的邀请码，重新生成
                genShareCode(callback);
            }else{
                //生成的邀请码可以用
                callback(null, sCode);
            }
        }
    });
}

function sCodeInfo(req, res, sCode) {
    var userType = req.user.userType;
    var role = req.user.userInfo.promoter;
    db.byConfig.findOne({_id: 'sCodeInfo'}, function (err, doc) {
        if (err) {
            //handle error
            result(res, {statusCode: 905, message: 'sCodeInfo error.'});
        } else {
            var resobj = {
                statusCode: 900,
                title: ((userType == 'teacher') ? 'CallCall教师 - 教师端' : 'CallCall教师 - 学生端'),
                description: '邀请好友下载注册CallCall教师，赢取免费手机流量！CallCall教师，有Call必答！',
                shareCode: sCode,
                shareLink: 'http://callcall.soulkey99.com:8061/byInstall.html?appType=' + ((userType == 'teacher') ? '1' : '0') + '&role=' + ((role == true) ? '1' : '0') + '&shareCode=' + sCode
            };
            if (doc) {
                resobj['title'] = ((userType == 'teacher') ? doc.title_t : doc.title_s);
                resobj['description'] = ((userType == 'teacher') ? doc.content_t : doc.content_s);
                resobj['shareLink'] = doc.url.replace('{appType}', (userType == 'teacher') ? '1' : '0').replace('{role}', (role == true) ? '1' : '0').replace('{sCode}', sCode);
                log.debug('gen share code success.');
            }
            result(res, resobj);
        }
    });
}