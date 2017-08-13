/**
 * Created by zhengyi on 15/2/26.
 */
var config = require('../../../config');
var objectId = require('mongojs').ObjectId;
var result = require('../../utils/result');
var randStr = require('../../utils/randStr');
var log = require('../../../utils/log').http;

module.exports = function (req, res) {

    var users = config.db.collection('users');
    var shareCodes = config.db.collection('shareCode');
    var _id = new objectId(req.body.userID);
    users.findOne({_id: _id}, function (err, doc) {
        if (err) {
            log.error('gen share code error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        }
        else {
            if (doc) {
                if (doc.authSign == req.body.authSign) {
                    var sCode = randStr();
                    log.trace('genShareCode: ' + sCode);
                    shareCodes.save({
                        _id: _id,
                        shareCode: sCode,
                        from: req.body.from, //来源：0：学生端，1：教师端
                        role: '0', //角色，0：用户，1：推广员
                        valid: true,  //是否有效
                        timestamp: new Date().getTime(),
                        users: []
                    }, function (err) {
                        //console.log(err);
                        if (!err) {
                            var resobj = {
                                statusCode: "900",
                                shareCode: sCode
                            };
                            log.debug('gen share code success.');
                            result(res, resobj);
                        }
                    });
                }
                else {
                    result(res, {statusCode: 903});
                }
            }
            else {
                result(res, {statusCode: 902});
            }
        }
    })

}