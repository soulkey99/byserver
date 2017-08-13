/**
 * Created by MengLei on 2016/1/18.
 */

var BattleModel = require('./battle');
var log = require('./../../utils/log').game;

var battles = {};

module.exports = {
    create: create,
    remove: remove,
    isExists: isExists,
    getBattle: getBattle,
    join: join,
    check: check
};

function create(battle_id, ai) {
    log.trace('battle pool, create battle, id: ' + battle_id + (ai ? (", with ai: " + ai.userID) : ''));
    remove(battle_id);
    battles[battle_id] = new BattleModel(battle_id, ai);
}

function remove(battle_id) {
    var battle = battles[battle_id];
    if (battle && battle.cron) {
        battle.cron.stop();
    }
    delete(battles[battle_id]);
}

function isExists(battle_id){
    return !!battles[battle_id];
}

function getBattle(battle_id){
    log.trace('battle pool, get battle, battles length: ' + Object.keys(battles).length);
    return battles[battle_id];
}

function join(param) {
    log.trace('battle pool, join battle: ' + param.battle_id + ', u_id: ' + param.userID);
    var battle = battles[param.battle_id];
    if (battle) {
        battle.join(param.userID);
    }
}

function check(battle_id, q_id, u_id, choice, time, point){
    log.trace('battle pool check. battles length: ' + Object.keys(battles).length);
    var battle = battles[battle_id];
    if (battle) {
        battle.check(q_id, u_id, choice, time, point);
    }
}



