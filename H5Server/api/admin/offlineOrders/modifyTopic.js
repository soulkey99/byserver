/**
 * Created by MengLei on 2015/9/15.
 */

var db = require('./../../../../config').db;
var result = require('./../../../utils/result');
var hot = require("hot-ranking");
var objectId = require('mongojs').ObjectId;
var log = require('./../../../../utils/log').h5;

//修改离线问题的各项信息
module.exports = function(req, res){
    var _id = new objectId();
    try{
        _id = new objectId(req.body.off_id);
    }catch(ex){
        result(res, {statusCode: 919, message: ex.message});
        return;
    }
    db.offlineTopics.findOne({_id: _id}, {_id: 1}, function(err, doc){
        if(err){
            result(res, {statusCode: 905, message: err.message});
        }else{
            if(doc){
                var setObj = {};
                if(req.body.topic != undefined){
                    setObj['topic'] = req.body.topic;
                }
                if(req.body.tag != undefined){
                    setObj['tag'] = req.body.tag.split(',');
                }
                if(req.body.q_msg != undefined){
                    setObj['q_msg'] = JSON.parse(req.body.q_msg);
                }
                if(req.body.createTime != undefined){
                    setObj['createTime'] = parseFloat(req.body.createTime);
                }
                if(req.body.updateTime != undefined){
                    setObj['updateTime'] = parseFloat(req.body.updateTime);
                }
                if(req.body.recommend != undefined){
                    setObj['recommend'] = (req.body.recommend == 'true');
                }
                if(req.body.delete != undefined){
                    setObj['delete'] = (req.body.delete == 'true');
                }
                if(req.body.visit != undefined){
                    setObj['visit'] = parseInt(req.body.visit);
                    setObj['visitIndex'] = parseFloat(hot(setObj.visit, 0, new Date(setObj.updateTime || doc.updateTime)));
                }
                if(req.body.reply != undefined){
                    setObj['reply'] = parseInt(req.body.reply);
                    setObj['replyIndex'] = parseFloat(hot(setObj.reply, 0, new Date(setObj.updateTime || doc.updateTime)));
                }
                db.offlineTopics.update({_id: _id}, {$set: setObj});
                result(res, {statusCode: 900});
            }else{
                result(res, {statusCode: 914, message: 'off_id not exists.'});
            }
        }
    });
};
