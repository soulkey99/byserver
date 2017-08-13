/**
 * Created by MengLei on 2015/9/24.
 */

var db = require('./../../../../config').db;
var result = require('./../../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('./../../../../utils/log').h5;

//特定手机号添加黑名单
module.exports = function(req, res){
    var expire = null;
    if(req.body.expire) {
        expire = new Date(parseFloat(req.body.expire));
    }
    if(req.body.action == 'un'){    //如果action=un，是取消黑名单，否则默认是加入黑名单的操作
        db.userConf.remove({phonenum: req.body.phonenum}, function(err, doc){
            if(err){
                //
                result(res, {statusCode: 905, message: err.message});
            }else{
                result(res, {statusCode: 900});
            }
        })
    }else {
        db.users.findOne({phone: req.body.phonenum}, {_id: 1, phone: 1}, function (err, doc) {
            if (err) {
                log.error('add blacklist error: ' + err.message);
                result(res, {statusCode: 905, message: err.message});
            } else {
                if (doc) {
                    db.users.update({_id: doc._id}, {$set: {authSign: 'zzzzzz', status: 'blacklist'}});
                    db.userConf.update({phonenum: doc.phone}, {
                        $set: {
                            "phonenum": doc.phone,
                            "type": "blacklist",
                            "smscode": "zzzzzz",
                            "status": "blacklist",
                            "grabConf": {
                                "posibility": 0.1,
                                "status": "normal"
                            },
                            "name": "",
                            "desc": req.body.desc || "",
                            "delete": false,
                            "expire": expire
                        }
                    }, {upsert: true}, function (err2, doc2) {
                        if (err2) {
                            result(res, {statusCode: 905, message: err2.message});
                        } else {
                            //
                            result(res, {statusCode: 900});
                        }
                    });
                } else {
                    //手机号不存在
                    result(res, {statusCode: 902, message: 'phone num not exists.'});
                }
            }
        });
    }
};