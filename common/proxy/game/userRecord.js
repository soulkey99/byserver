/**
 * Created by MengLei on 2016/2/2.
 */

var model = require('../../model');
var log = require('../../../utils/log').common;
var GameUserRecord = model.GameUserRecord;

/**
 * 根据userID查询此人游戏记录
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {String} userID userID
 * @param {Function} callback 回调函数
 */
exports.getRecordByUserID = function (userID, callback) {
    log.trace('get record by userID: ' + userID);
    GameUserRecord.findOneRecord({_id: userID}, callback);
};

/**
 * 根据query查询返回一组结果
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {Object} query
 * @param {Object} opt
 * @param {Function} callback 回调函数
 */
exports.getRecordByQuery = function (query, opt, callback) {
    GameUserRecord.find(query, {}, opt, callback);
};

/**
 * 根据指定query获取数量
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {Object} query    查询条件
 * @param {Function} callback 回调函数
 */
exports.getRecordCountByQuery = function (query, callback) {
    GameUserRecord.count(query, callback);
};

/**
 * 根据userID增加一条对战结果的数据
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {String} userID userID
 * @param {String} status 答题状态，start开始，win胜利，lose失败，draw平局
 * @param {Function} callback 回调函数
 */
exports.endGame = function (userID, status, callback) {
    if (!callback) {
        callback = function () {
        };
    }
    var incObj = {};
    switch (status) {
        case 'win':
            incObj = {
                'weekly.win': 1,
                'monthly.win': 1,
                'total.win': 1,
                'weekly.finish': 1,
                'monthly.finish': 1,
                'total.finish': 1
            };
            break;
        case 'draw':
            incObj = {
                'weekly.draw': 1,
                'monthly.draw': 1,
                'total.draw': 1,
                'weekly.finish': 1,
                'monthly.finish': 1,
                'total.finish': 1
            };
            break;
        case 'lose':
            incObj = {
                'weekly.lose': 1,
                'monthly.lose': 1,
                'total.lose': 1,
                'weekly.finish': 1,
                'monthly.finish': 1,
                'total.finish': 1
            };
            break;
    }
    if (Object.keys(incObj).length > 0) {
        GameUserRecord.findByIdAndUpdate(userID, {$inc: incObj}, {new: true}, callback);
    } else {
        GameUserRecord.findById(userID, callback);
    }
};

/**
 * 根据userID增加一条答题正确的数据
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {String} userID userID
 * @param {String} status 答题状态：correct正确
 * @param {Function} callback 回调函数
 */
exports.checkQuestion = function (userID, status, callback) {
    if (!callback) {
        callback = function () {
        };
    }
    if (!status) {
        status = 'correct';
    }
    if (status == 'correct') {
        GameUserRecord.findByIdAndUpdate(userID, {
            $inc: {
                'monthly.correct_question': 1,
                'weekly.correct_question': 1,
                'total.correct_question': 1
            }
        }, {new: true}, callback);
    }
};

/**
 * 根据userID增加此人开始一局游戏的数据
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {String} userID userID
 * @param {Function} callback 回调函数
 */
exports.startGame = function (userID, callback) {
    if (!callback) {
        callback = function () {
        };
    }
    log.trace('start game, userID: ' + userID);
    GameUserRecord.findOneRecord({_id: userID}, function (err, doc) {
        if (err) {
            return callback(err);
        }
        doc.weekly.total++;
        doc.monthly.total++;
        doc.total.total++;
        if (doc.strength == 5) {
            doc.strength_recover_time = Date.now();
        }
        doc.strength--;
        doc.save(callback);
    });
};

/**
 * 根据userID增加此人开始一局游戏的数据
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {String} userID userID
 * @param {Function} callback 回调函数
 */
exports.getStrength = function (userID, callback) {
    log.trace('get strength, userID: ' + userID);
    GameUserRecord.findOneRecord({_id: userID}, function (err, doc) {
        if (err) {
            return callback(err);
        }
        callback(null, {
            strength: doc.strength,
            bonus: doc.bonus,
            level: doc.level,
            point: doc.point,
            intellectual: doc.total.intellectual,
            strength_recover_interval: doc.strength_recover_interval,
            strength_recover_time: doc.strength_recover_time,
            server_time: Date.now()
        });
    });
};

/**
 * 根据userID增加此人的学分(bonus)、绩点(point)、脑力(intellectual)、体力(strength)，并记录历史
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {Object} param = {userID: '', bonus: '', point: '', intellectual: '', strength: '', desc: ''}
 * @param {Function} [callback] 回调函数
 */
exports.addBonus = function (param, callback) {
    var incObj = {};
    var bonus = new (model.GameUserRecordHistory)();
    bonus.userID = param.userID;
    bonus.desc = param.desc;
    if (param.bonus) {
        bonus.bonus = param.bonus;
        incObj['bonus'] = Number.parseInt(param.bonus);
    }
    if (param.point) {
        bonus.point = param.point;
        incObj['point'] = Number.parseInt(param.point);
    }
    if (param.intellectual) {
        bonus.intellectual = param.intellectual;
        incObj['total.intellectual'] = Number.parseInt(param.intellectual);
        incObj['weekly.intellectual'] = Number.parseInt(param.intellectual);
        incObj['monthly.intellectual'] = Number.parseInt(param.intellectual);
    }
    if (param.strength) {
        bonus.strength = param.strength;
        incObj['strength'] = Number.parseInt(param.strength);
    }
    bonus.save();
    if (Object.keys(incObj).length > 0) {
        GameUserRecord.update({_id: param.userID}, {$inc: incObj}).exec(callback);
    }
};


/**
 * 每周任务，将用户的每周数据清零
 */
exports.weeklyCronTask = function () {
    GameUserRecord.update({}, {
        $set: {
            'weekly.total': 0,
            'weekly.finish': 0,
            'weekly.win': 0,
            'weekly.draw': 0,
            'weekly.lose': 0,
            'weekly.intellectual': 0,
            'weekly.correct_question': 0
        }
    }, {multi: true}, function (err) {
        if (err) {
            log.trace('weekly cron task executed, error: ' + err.message);
        } else {
            log.trace('weekly cron task executed');
        }
    });
};

/**
 * 每月任务，将用户的每周数据清零
 */
exports.monthlyCronTask = function () {
    GameUserRecord.update({}, {
        $set: {
            'monthly.total': 0,
            'monthly.finish': 0,
            'monthly.win': 0,
            'monthly.draw': 0,
            'monthly.lose': 0,
            'monthly.intellectual': 0,
            'monthly.correct_question': 0
        }
    }, {multi: true}, function (err) {
        if (err) {
            log.trace('monthly cron task executed, error: ' + err.message);
        } else {
            log.trace('monthly cron task executed');
        }
    });
};

