/**
 * Created by MengLei on 2015/8/11.
 */

var db = require('../../config').db;
var config = require('../../config');
var objectId = require('mongojs').ObjectId;
var eventproxy = require('eventproxy');
var offlineAnsList = require('./utils/offlineAnsList');
var log = require('./../../utils/log').order;


//获取某条离线问答的答案的列表param={userID: '', off_id: '', startPos: '', pageSize: '', sort: 'asc/desc'}
//sort=asc，按照时间升序，sort=desc：按照时间降序，默认按照点赞指数排序
module.exports = function(param, callback) {
    //
    var query = {delete: false, off_id: param.off_id};

    var start = param.startPos ? param.startPos : 1;
    var count = param.pageSize ? param.pageSize : 10;
    var sort = {createTime: -1};
    switch (param.sort) {
        case 'asc':
            sort = {createTime: 1};
            break;
        case 'desc':
            sort = {createTime: -1};
            break;
        default :
            sort = {upIndex: -1};
            break;
    }
    db.offlineAnswers.find(query).sort(sort).skip((parseInt(start) - 1) < 0 ? 0 : (parseInt(start) - 1)).limit(parseInt(count)).toArray(function (err, doc) {
        if (err) {
            log.error('get offline answer list error: ' + err.message);
            return callback(err);
        } else {
            if (doc.length > 0) {
                //有内容，对内容进行加工
                offlineAnsList({doc: doc, userID: param.userID}, function(err2, doc2){
                    if(err2){
                        log.error('get offline answer list error: ' + err2.message);
                        return callback(err2);
                    }else{
                        log.error('get offline answer list success.');
                        return callback(null, doc2);
                    }
                });
            } else {
                //直接回复空数组
                return callback(null, []);
            }
        }
    });
};

