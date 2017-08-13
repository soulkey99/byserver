/**
 * Created by MengLei on 2015/5/23.
 */

var db = require('./../../../config').db;
var result = require('./../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('./../../../utils/log').admin;

//通过手机号，获取用户信息
module.exports = function(req, res){
    //
    db.users.findOne({phone: req.body.phonenum}, function(err, doc){
        if(err){
            log.error('get user by phone error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        }else{
            if(doc){
                delete(doc.authSign);
                db.shareCode.findOne({userID: doc._id.toString()}, function(err2, doc2){
                    if(err2){
                        //handle error
                    }else{
                        if(doc2) {
                            doc.shareCode = doc2.shareCode;
                            if(doc2.stat){
                                //返回统计值，组装数据
                                doc.stat = doc2.stat.invited + '/' + doc2.stat.registered;
                            }else{
                                //如果没有值，则返回空
                                doc.stat = '-/-';
                            }
                        }
                        doc.userID = doc._id.toString();
                        result(res, {statusCode: 900, user: doc});
                    }
                })
            }else{
                log.error('get user by phone error, user not exists.');
                result(res, {statusCode: 902, message: 'user not exists.'});
            }
        }
    })
};