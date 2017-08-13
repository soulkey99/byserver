/**
 * Created by MengLei on 2015/8/24.
 */

var db = require('../../../config').db;
var config = require('../../../config');
var objectId = require('mongojs').ObjectId;
var log = require('./../../../utils/log').order;

//在单独的表中记录topic的分日点击数、收藏数、回复数，param={off_id: '', operate: '', action: ''}
module.exports = function(param){
    var _id = '';
    try {
        _id = new objectId(param.off_id);
    } catch (ex) {
        log.error('get offline topic error: id ' + ex.message);
        callback({statusCode: 919, message: ex.message});
        return;
    }
    var setObj = {};
    var dateStr = genDateStr();
    //log.trace('date string: ' + dateStr);
    setObj['data.' + dateStr] = 1;

    switch (param.operate){
        case 'visit':
        {//记录topic访问数
            log.trace('add one daily visit for off_id: ' + param.off_id);
            db.offlineClick.update({_id: _id}, {$inc: setObj}, {upsert: true});
        }
            break;
        case 'collect':
        {//记录topic收藏数
            if(param.action == 'un'){
                setObj['data.' + dateStr] = -1;
                log.trace('reduce one daily collect for off_id: ' + param.off_id);
            }else{
                log.trace('add one daily collect for off_id: ' + param.off_id);
            }
            db.offlineCollect.update({_id: _id}, {$inc: setObj}, {upsert: true});
        }
            break;
        case 'watch':
        {//记录topic收藏数
            if(param.action == 'un'){
                setObj['data.' + dateStr] = -1;
                log.trace('reduce one daily watch for off_id: ' + param.off_id);
            }else{
                log.trace('add one daily watch for off_id: ' + param.off_id);
            }
            db.offlineWatch.update({_id: _id}, {$inc: setObj}, {upsert: true});
        }
            break;
        case 'reply':
        {//记录topic回复数
            log.trace('add one daily reply for off_id: ' + param.off_id);
            db.offlineReply.update({_id: _id}, {$inc: setObj}, {upsert: true});
        }
            break;
        default :
            break;
    }
};

function genDateStr(){
    //返回当前年月日，格式2015/8/12
    var d = new Date();
    var year = (d.getFullYear()).toString();
    var month = (d.getMonth() + 1).toString();
    var date = (d.getDate()).toString();
    return year + '/' + month + '/' + date;
}
