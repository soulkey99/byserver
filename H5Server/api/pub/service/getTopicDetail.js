/**
 * Created by MengLei on 2015/10/30.
 */

var db = require('./../../../../config').db;
var objectId = require('mongojs').ObjectId;
var result = require('./../../../utils/result');
var log = require('../../../../utils/log').h5;

//获取文章详细内容
module.exports = function(req, res){
    var _id = new objectId();
    try{
        _id = new objectId(req.body.pt_id);
    }catch(ex){
        log.error('pub service, get topic detail error: ' + ex.message);
        result(res, {statusCode: 919, message: ex.message});
        return;
    }
    db.pubTopics.findOne({_id: _id}, function(err, doc){
        if(err){
            result(res, {statusCode: 905, message: err.message});
        }else{
            if(doc){
                var detail = {
                    pt_id: doc._id.toString(),
                    title: doc.title,
                    content: doc.content,
                    visit: doc.visit,
                    author_id: doc.author_id,
                    author_nick: '',
                    createTime: doc.createTime,
                    delete: doc.delete,
                    ups: doc.ups.length
                };
                db.users.findOne({_id: new objectId(detail.author_id)}, {nick: 1}, function(err2, doc2){
                    if(err2){
                        result(res, {statusCode: 905, message: err.message});
                    }else{
                        if(doc2){
                            detail.author_nick = doc2.nick;
                        }
                        result(res, {statusCode: 900, detail: detail});
                    }
                })
            }else{
                result(res, {statusCode: 961, message: '文章不存在，获取详情失败！'});
            }
        }
    })
};
