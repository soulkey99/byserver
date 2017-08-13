/**
 * Created by MengLei on 2015/8/31.
 */

var db = require('../../config').db;
var config = require('../../config');
var objectId = require('mongojs').ObjectId;
var offlineAnsList = require('./utils/offlineAnsList');
var log = require('./../../utils/log').order;

//获取我的离线回答列表，param={userID: '', u_id: '', startPos: '', pageSize: '', tab: 'time/up/reply/collect'}
module.exports = function(param, callback){
    //
    var author_id = param.u_id || param.userID;
    try{
        //校验author id的合法性
        var testid = new objectId(author_id);
    }catch(ex){
        log.error('get my answer, author id error: ' + ex.message);
        callback(ex);
        return;
    }
    var start = param.startPos ? param.startPos : 1;
    var count = param.pageSize ? param.pageSize : 10;
    var sort = {createTime: -1};    //默认时间倒序排列
    switch (param.tab){
        case 'collect':
            sort = {collect: -1};
            break;
        case 'up':
            sort = {upIndex: -1};
            break;
        case 'reply':
            sort = {reply: -1};
            break;
        default :
            break;
    }

    db.offlineAnswers.find({author_id: author_id}).sort(sort).skip((parseInt(start) - 1) < 0 ? 0 : (parseInt(start) - 1)).limit(parseInt(count)).toArray(function(err, doc){
        //
        if(err){
            log.error('get my offline answer error: ' + err.message);
            return callback(err);
        }else{
            //console.log('my offline answers: ' + doc.length + 'userID=' + param.userID);
            offlineAnsList({doc: doc, userID: param.userID}, function(err2, doc2){
                callback(null, doc2);
            });
        }
    });
};

