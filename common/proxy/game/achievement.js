/**
 * Created by MengLei on 2016/3/1.
 */

var model = require('../../model');
var Achievement = model.GameAchievement;

/**
 * 根据ach_id查询记录
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {String} ach_id 成就id
 * @param {Function} callback 回调函数
 */
exports.getAchievement = function(ach_id, callback){
    Achievement.findOne({_id: ach_id}, callback);
};










