/**
 * Created by MengLei on 2015/9/16.
 */

var db = require('./../../../../config').db;
var result = require('./../../../utils/result');
var hot = require("hot-ranking");
var objectId = require('mongojs').ObjectId;
var log = require('./../../../../utils/log').h5;

//编辑离线答案的回复，只能编辑回答内容或者回复时间
module.exports = function(req, res){
    var _id = new objectId();
    try{
        _id = new objectId(req.body.answer_reply_id);
    }catch(ex){
        result(res, {statusCode: 919, message: ex.message});
        return;
    }
    db.offlineAnsReply.findOne({_id: _id}, {_id: 1, ups: 1, downs: 1, createTime: 1}, function(err, doc){
        if(err){
            result(res, {statusCode: 905, message: err.message});
        }else{
            if(doc){
                //存在回复
                var setObj = {};
                if(req.body.msg){
                    setObj.msg = req.body.msg;
                }
                if(req.body.createTime){
                    setObj.createTime = parseFloat(req.body.createTime);
                }
                setObj.upIndex = parseFloat(hot(doc.ups.length, doc.downs.length, new Date(setObj.createTime || doc.createTime)));
                db.offlineAnsReply.update({_id: _id}, {$set: setObj}, function(err2, doc2){
                    if(err2){
                        result(res, {statusCode: 905, message: err2.message});
                    }else{
                        result(res, {statusCode: 900});
                    }
                });
            }else{
                //不存在回复
                result(res, {statusCode: 915, message: 'answer_id not exists.'});
            }
        }
    });
};
