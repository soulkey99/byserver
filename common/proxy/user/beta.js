/**
 * Created by MengLei on 2016/2/3.
 */

var model = require('../../model');
var eventproxy = require('eventproxy');
var Beta = model.Beta;

/**
 * 根据userID下发此人beta配置
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {Object} param = {userID: userID, userType: '', platform: '', version: ''}
 * @param {Function} callback 回调函数
 */
exports.getBetaByUser = function(param, callback){
    var query = {userID: param.userID, userType: 'student', platform: 'ios', start_time: {$lte: Date.now()}, end_time: {$gte: Date.now()}};
    if(param.userType){
        query.userType = param.userType;
    }
    if(param.platform){
        query.platform = param.platform;
    }
    Beta.find(query, function(err, doc){
        if(err){
            return callback(err);
        }
        var config = {};
        for(var i=0; i<doc.length; i++) {
            var obj = doc[i].config.toObject();
            var keys = Object.keys(obj);
            for (var j = 0; j < keys.length; j++) {
                config[keys[j]] = obj[keys[j]];
            }
        }
        if(param.userType == 'student' && param.platform == 'ios'){
            //强制，所有ios学生端的打赏、钱包功能打开
            config.reward = true;
            config.purse = true;
        }else if(param.userType == 'teacher' && param.platform == 'ios'){
            //强制，所有ios教师端的提现、钱包功能打开
            config.purse = true;
            config.withdraw = true;
        }
        callback(null, config);
    });
};

/**
 * 根据userID设置此人beta配置
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {Object} param = {userID: '', start_time: '', end_time: '', platform: '', userType: '', config: {}}
 * @param {Function} callback 回调函数
 */
exports.editBeta = function(param, callback) {
    var ep = new eventproxy();
    ep.all('beta', function (beta) {
        if (param.platform) {
            beta.platform = param.platform.split(',');
        }
        if (param.userType) {
            beta.userType = param.userType.split(',');
        }
        if (param.start_time) {
            beta.start_time = parseInt(param.start_time || '0');
        }
        if (param.end_time) {
            beta.end_time = parseInt(param.end_time || '0');
        }
        if (param.config) {
            try {
                beta.config = JSON.parse(param.config);
            }catch (ex){
                return callback(ex);
            }
        }
        beta.save(callback);
    });
    ep.fail(callback);
    if (!param.beta_id) {
        var beta = new Beta({
            userID: param.userID,
            start_time: parseInt(param.start_time || '0'),
            end_time: parseInt(param.end_time || '0')
        });
        ep.emit('beta', beta);
    } else {
        Beta.findById(param.beta_id, ep.done('beta'));
    }
};

/**
 * 管理员端获取配置信息列表
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {String} beta_id
 * @param {Function} callback 回调函数
 */
exports.removeBeta = function(beta_id, callback){
    Beta.remove({_id: beta_id}, callback);
};

/**
 * 管理员端获取配置信息列表
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {Object} param = {userID: '', startPos: '', pageSize: '', platform: '', userType: '', time: '', version: ''}
 * @param {Function} callback 回调函数
 */
exports.getBetaList = function(param, callback) {
    var query = {};
    if (param.platform) {
        query['platform'] = param.platform;
    }
    if (param.userType) {
        query['userType'] = param.userType;
    }
    if (param.version) {
        query['version'] = param.version;
    }
    if(param.userID){
        query['userID'] = param.userID;
    }
    var start = parseInt(param.startPos || '1') - 1;
    var count = parseInt(param.pageSize || '10');
    Beta.find(query, {}, {
        sort: '-start_time -end_time',
        skip: start < 0 ? 0 : start,
        limit: count
    }, function (err, doc) {
        if (err) {
            return callback(err);
        }
        var list = [];
        var u_ids = [];
        for (var i = 0; i < doc.length; i++) {
            u_ids.push(doc[i].userID);
            list.push(doc[i].toObject({virtuals: true}));
        }
        require('./user').getUsersByIds(u_ids, function(err2, doc2){
            if(err2){
                return callback(err2);
            }
            for(var i=0; i<list.length; i++){
                for(var j=0; j<doc2.length; j++){
                    if(list[i].userID == doc2[j]._id.toString()){
                        list[i].nick = doc2[j].nick;
                        list[i].phone = doc2[j].phone;
                        list[i].avatar = doc2[j].userInfo.avatar;
                        break;
                    }
                }
            }
            return callback(null, list);
        });
    });
};



