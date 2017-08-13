/**
 * Created by MengLei on 2015/8/12.
 */

var db = require('../../config').db;
var config = require('../../config');
var objectId = require('mongojs').ObjectId;
var log = require('./../../utils/log').order;

//选定最佳答案param={userID: '', off_id: '', answer_id: ''}
module.exports = function(param, callback){
    var _id = '';
    try{
        _id = new objectId(param.off_id);
    }catch(ex){
        log.error('judge answer error: id ' + ex.message);
        callback(ex);
        return;
    }
    db.offlineTopics.findOne({_id: _id}, {author_id: 1, status: 1}, function(err, doc){
        if(err){
            log.error('judge answer error: ' + err.message);
            return callback(err);
        }else{
            if(doc) {
                //离线问题存在，可以继续进行
                if(doc.author_id == param.userID) {
                    //作者是用户自己，可以继续操作
                    if (doc.status == 'open') {
                        //状态可以继续进行
                        var curTime = new Date().getTime();
                        db.offlineTopics.update({_id: _id}, {
                            $set: {
                                status: 'judge',
                                judgeTime: curTime,
                                judgeAnswerID: param.answer_id
                            }
                        });
                        return callback();
                    } else {
                        //状态不允许
                        log.error('judge answer, offline topic status illegal, off_id: ' + param.off_id);
                        return callback(new Error('订单状态不允许！'));
                    }
                }else{
                    //作者不是用户自己，无权操作
                    log.error('judge answer, not authorized.');
                    callback(new Error('无权操作不是自己的订单！'));
                }
            }else{
                //离线问题不存在
                log.error('offline topic id not exists.');
                callback(new Error('离线问题ID不存在！'));
            }
        }
    })
};