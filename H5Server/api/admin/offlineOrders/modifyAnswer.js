/**
 * Created by MengLei on 2015/9/16.
 */

var db = require('./../../../../config').db;
var result = require('./../../../utils/result');
var hot = require("hot-ranking");
var objectId = require('mongojs').ObjectId;
var log = require('./../../../../utils/log').h5;

//编辑离线问题的答案
module.exports = function(req, res){
    var _id = new objectId();
    try{
        _id = new objectId(req.body.answer_id);
    }catch(ex){
        result(res, {statusCode: 919, message: ex.message});
        return;
    }
    db.offlineAnswers.findOne({_id: _id}, function(err, doc){
        if(err){
            result(res, {statusCode: 905, message: err.message});
        }else{
            if(doc){
                var setObj = {};
                if(req.body.createTime){
                    setObj.createTime = parseFloat(req.body.createTime);
                }
                if(req.body.updateTime){
                    setObj.updateTime = parseFloat(req.body.updateTime);
                }
                if(req.body.delete){
                    setObj.delete = (req.body.delete == 'true');
                }
                if(req.body.msg){
                    setObj.msg = JSON.parse(req.body.msg);
                }
                setObj.replyIndex = parseFloat(hot(doc.reply, 0, new Date(setObj.updateTime || doc.updateTime)));
                setObj.collectIndex = parseFloat(hot(doc.collect, 0, new Date(setObj.updateTime || doc.updateTime)));
                setObj.upIndex = parseFloat(hot(doc.ups.length, doc.downs.length, new Date(setObj.updateTime || doc.updateTime)));
                db.offlineAnswers.update({_id: _id}, {$set:setObj}, function(err2, doc2){
                    if(err2){
                        result(res, {statusCode: 905, message: err2.message});
                    }else{
                        result(res, {statusCode: 900});
                    }
                });
            }else{
                result(res, {statusCode: 915, message: 'answer_id not exists.'});
            }
        }
    });
};
