/**
 * Created by MengLei on 2015/11/25.
 */

var db = require('./../../../config').db;
var config = require('./../../../config');
var objectId = require('mongojs').ObjectId;
var result = require('../../utils/result');
var log = require('../../../utils/log').http;

//根据邀请码，获取邀请码对应的配置信息
module.exports = function(req, res){
    db.shareCode.findOne({shareCode: req.body.shareCode}, {userID: 1, config: 1}, function(err, doc){
        if(err){
            result(res, {statusCode: 905, message: err.message});
        }else{
            var resp = {statusCode: 900, config: 'default', role: '0'};
            if(doc){
                if(doc.config){
                    resp.config = doc.config;
                }
                var _id = new objectId();
                try{
                    _id = new objectId(doc.userID);
                }catch(ex) {
                    result(res, resp);
                    return;
                }
                db.users.findOne({_id: _id}, {'userInfo.promoter': 1}, function(err2, doc2){
                    if(err2){
                        result(res, resp);
                    }else{
                        if(doc && doc.userInfo && doc.userInfo.promoter){
                            resp.role = '1';
                        }
                        result(res, resp);
                    }
                });
            }else{
                result(res, resp);
            }
        }
    });
};