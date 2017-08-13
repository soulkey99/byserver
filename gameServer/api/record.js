/**
 * Created by MengLei on 2016/2/2.
 */

var proxy = require('./../../common/proxy');
var log = require('../../utils/log').common;
//挑战记录，param={userID: ''}
module.exports = function(param, callback) {
    proxy.GameUserRecord.getRecordByUserID(param.userID, function (err, doc) {
        if (err) {
            return callback(err);
        }
        if (!doc) {
            return callback();
        }
        var resp = {
            bonus: doc.bonus, //积分
            level: doc.level,   //等级
            intellectual: doc.total.intellectual, //智力
            strength: doc.strength, //体力
            point: doc.point,   //绩点
            finish: doc.total.finish,
            win: doc.total.win,
            draw: doc.total.draw,
            lose: doc.total.lose,
            correct_question: doc.total.correct_question
        };
        return callback(null, resp);
    })
};

