/**
 * Created by MengLei on 2015/10/28.
 */

var db = require('./../../../../config').db;
var objectId = require('mongojs').ObjectId;
var result = require('./../../../utils/result');
var log = require('../../../../utils/log').h5;

//公众号发布文章内容
module.exports = function(req, res){
    //
    var curTime = new Date();
    var _id = new objectId();
    if(req.body.pt_id){
        //如果传入了pt_id，那么就是编辑之前已存在的文章
        try{
            _id = new objectId(req.body.pt_id);
        }catch(ex){
            log.error('edit topic, pt_id: ' + req.body.pt_id + ', exception: ' + ex.message);
            result(res, {statusCode: 919, message: ex.message});
            return;
        }
        var setObj = {updateTime: curTime.getTime()};
        if(req.body.title != undefined){
            setObj.title = req.body.title;
        }
        if(req.body.cover != undefined){
            setObj.cover = req.body.cover;
        }
        if(req.body.summary != undefined){
            setObj.summary = req.body.summary;
        }
        if(req.body.content != undefined){
            setObj.content = req.body.content;
        }
        if(req.body.version != undefined){
            setObj.version = req.body.version;
        }
        if(req.body.delete != undefined){
            setObj.delete = (req.body.delete == 'true');
        }
        db.pubTopics.update({_id: _id}, {$set: setObj}, function(err){
            if(err){
                result(res, {statusCode: 905, message: err.message});
            }else{
                result(res, {statusCode: 900});
            }
        });
    }else{
        //如果没有传pt_id，那么就是发布新的文章
        var topic = {
            _id: _id,
            author_id: req.body.userID,     //作者id
            title: req.body.title || '',    //文章题目
            cover: req.body.cover || '',  //文章摘要图
            summary: req.body.summary || '',    //文章摘要
            version: req.body.version || '',    //支持的最低版本
            content: req.body.content || '', //内容，html带样式
            visit: 0,   //访问量
            createTime: curTime.getTime(),  //创建时间
            updateTime: curTime.getTime(),  //最后更新时间
            delete: false,  //删除标记
            ups: []     //点赞人数
        };
        db.pubTopics.insert(topic, function(err){
            if(err){
                result(res, {statusCode: 905, message: err.message});
            }else{
                result(res, {statusCode: 900, pt_id: _id.toString()});
            }
        });
    }
};
