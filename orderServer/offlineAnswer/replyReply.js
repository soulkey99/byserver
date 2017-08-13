/**
 * Created by MengLei on 2015/8/11.
 */

var db = require('../../config').db;
var config = require('../../config');
var objectId = require('mongojs').ObjectId;
var hot = require("hot-ranking");
var offlineOperate = require('./utils/offlineOperate');
var log = require('./../../utils/log').order;


//对离线问题回复的回复，param={userID: '', off_id: '', answer_id: '', reply_id: '', msg: ''}，限制只能是纯文本
module.exports = function(param, callback) {
    //
    var curTime = new Date().getTime();
    var info = {
        _id: new objectId(),        //answer_reply_id
        author_id: param.userID,
        off_id: param.off_id,   //离线问题id
        answer_id: param.answer_id, //问题回复的id
        msg: param.msg,              //消息内容，限制为纯文本
        ups: [],    //支持者
        downs: [],  //反对者
        createTime: curTime, //创建时间
        upIndex: parseFloat(hot(0, 0, new Date(curTime))),      //支持指数
        delete: false       //预留删除标记
    };
    if (param.reply_id) {
        info.reply_id = param.reply_id; //回复某条评论的id
    }
    var _id = '';
    try {
        _id = new objectId(param.answer_id);
    } catch (ex) {
        log.error('reply answer error: id ' + ex.message);
        callback(ex);
        return;
    }
    db.offlineAnswers.findOne({_id: _id}, function (err, doc) {
        if (err) {
            log.error('reply answer error: ' + err.message);
            return callback(err);
        } else {
            if (doc) {
                //回复存在
                //首先对答案的基本信息进行更新
                db.offlineAnswers.update({_id: _id}, {$inc: {reply: 1}, $set: {replyIndex: parseFloat(hot((doc.reply || 0) + 1, 0, new Date(doc.createTime)))}});
                //然后插入回复的内容
                db.offlineAnsReply.insert(info, function (err2, doc2) {
                    if (err2) {
                        log.error('reply reply error: ' + err2.message);
                        return callback(err2);
                    } else {
                        log.trace('reply rely success. userID=' + param.userID + ', off_id=' + param.off_id + ', answer_id=' + param.answer_id);
                        callback(null, info);
                        //记录回复离线答案的操作
                        offlineOperate({userID: info.author_id, operType: 'reply', operID: info._id.toString()});
                    }
                });
            } else {
                //回复id不存在
                log.error('reply answer error: answer id not exists.');
                callback(new Error('回复失败，答案ID不存在！'));
            }
        }
    });
};


