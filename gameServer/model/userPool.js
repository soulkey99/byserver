/**
 * Created by MengLei on 2016/1/8.
 */

var UserModel = require('./user');
var notify = require('../utils/notify');

var users = {};

module.exports = {
    create: create,
    remove: remove,
    isExists: isExists,
    getUser: getUser,
    online: online,
    pair: pair,
    tick: tick,
    quit: quit,
    setStatus: setStatus,
    nextTick: nextTick,
    onClosing: onClosing,
    ping: ping,
    pingBack: pingBack
};

function create(userID) {
    remove(userID);
    users[userID] = new UserModel(userID);
}

function remove(userID) {
    var user = users[userID];
    if (user && user.cron) {
        user.cron.stop();
    }
    delete(users[userID]);
}

function  isExists(userID) {
    return !!users[userID];
}

function getUser(userID) {
    return users[userID];
}

function setStatus(userID, status, callback) {
    var user = getUser(userID);
    if (user) {
        user.setStatus(status, callback);
    }
}

function online(userID) {
    var user = getUser(userID);
    if (user) {
        user.online();
    } else {
        users[userID] = new UserModel(userID);
    }
}

function pair(userID, level, callback) {
    var user = getUser(userID);
    if (user) {
        if(level){
            user.currentLevel = level;
        }
        user.pair(callback);
    }
}

function tick(userID) {
    var user = getUser(userID);
    if (user) {
        user.tick();
    }
}

function quit(userID){
    var user = getUser(userID);
    if (user) {
        user.quit();
    }
}

function nextTick(userID, t){
    var user = getUser(userID);
    if (user) {
        user.nextTick(t);
    }
}

function onClosing(userID) {
    var user = users[userID];
    if (user && user.cron) {
        user.cron.stop();
        user.nextTick();
    }
}

function ping(param) {
    notify(param.u_id, 'ping', {from: param.userID});
}

function pingBack(param) {
    notify(param.u_id, 'pingBack', {from: param.userID});
}

