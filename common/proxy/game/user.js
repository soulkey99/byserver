/**
 * Created by MengLei on 2016/1/5.
 */

var model = require('../../model');
var GameUser = model.GameUser;

/**
 * 根据userID查询此人当前状态
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {String} userID userID
 * @param {Function} callback 回调函数
 */
exports.getUserStatus = function(userID, callback){
    GameUser.findOne({_id: userID}, callback);
};

/**
 * 根据userID查询改变当前状态
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {String} userID userID
 * @param {String} status 改变后的状态
 * @param {Function} callback 回调函数
 */
exports.setUserStatus = function(userID, status, callback) {
    if(!callback) {
        callback = function () {};
    }
    var setObj = {$set: {status: status, closing: false}};
    var opt = {upsert: false};
    //console.log('set user status, userID=' + userID + ', status=' + status);
    switch (status){
        case 'closing':
            setObj = {$set: {expire: new Date(Date.now() + 5000), closing: true}};
            break;
        case 'tick':
            setObj = {$set: {expire: new Date(Date.now() + 180000)}, $setOnInsert: {status: 'online'}};
            opt.upsert = true;
            break;
        case 'online':
            setObj = {$set: {status: 'online', expire: new Date(Date.now() + 180000), closing: false}};
            opt.upsert = true;
            break;
        case 'waiting':
            setObj = {$set: {status: 'waiting', expire: new Date(Date.now() + 180000), closing: false}};
            break;
        default:
            setObj['$set']['expire'] = new Date(Date.now() + 180000);
            break;
    }
    GameUser.update({_id: userID}, setObj, opt, callback);
};

/**
 * 游戏用户进入waiting状态
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {String} userID  用户id
 * @param {String} level  关卡等级
 * @param {Function} callback 回调函数
  */
exports.setWaiting = function(userID, level, callback) {
    if(!callback) {
        callback = function () {
        }
    }
    GameUser.findById(userID, function(err, gameUser){
        if(err){
            return callback(err);
        }
        if(!gameUser){
            gameUser = new GameUser({_id: userID, status: 'waiting', level: level, expire: new Date(Date.now() + 180000), closing: false});
        }else{
            gameUser.status = 'waiting';
            gameUser.level = level;
            gameUser.expire = new Date(Date.now() + 180000);
        }
        gameUser.save(callback);
    });
};

/**
 * 游戏用户进入searching状态
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {String} userID  用户id
 * @param {String} level  关卡等级
 * @param {Function} callback 回调函数
 */
exports.setSearching = function(userID, level, callback) {
    if(!callback) {
        callback = function () {
        }
    }
    GameUser.findById(userID, function(err, gameUser){
        if(err){
            return callback(err);
        }
        if(!gameUser){
            gameUser = new GameUser({_id: userID, status: 'searching', level: level, expire: new Date(Date.now() + 180000), closing: false});
        }else{
            gameUser.status = 'searching';
            gameUser.level = level;
            gameUser.expire = new Date(Date.now() + 180000);
        }
        gameUser.save(callback);
    });
};

/**
 * 随机获取一个等待配对的用户
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {String} userID  用户id
 * @param {String} level  用户等级
 * @param {Function} callback 回调函数
 */
exports.getWaitingUser = function(userID, level, callback) {
    GameUser.aggregate([{$match: {_id: {$ne: userID}, status: 'waiting', level: level}}, {$sample: {size: 1}}], function (err, doc) {
        if (err) {
            return callback(err);
        }
        callback(null, doc[0]);
    });
};

/**
 * 根据状态查询当前人数
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {String} status 要查询的状态
 * @param {Function} callback 回调函数
 */
exports.getNumByStatus = function(status, callback){
    GameUser.count({status: status}, callback);
};



