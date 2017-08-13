/**
 * Created by MengLei on 2016/1/7.
 */

var proxy = require('../../common/proxy');
var notify = require('../utils/notify');
var log = require('../../utils/log');
var AI = require('../model/ai');
var userPool = require('../model/userPool');
var eventproxy = require('eventproxy');
var battlePool = require('../model/battlePool');

//创建游戏，param = {users: [], level: ''}
module.exports = function(param, callback) {
    if (!callback) {
        callback = function () {
        };
    }
    if(!param.level){
        param.level = 1;
    }
    //开始游戏，先给双方把抵押的学分扣除，待游戏结束再加回去
    proxy.GameUserRecord.addBonus({userID: param.users[0], bonus: 0 - levelBonus(param.level), desc: '游戏开局抵押学分'});
    proxy.GameUserRecord.addBonus({userID: param.users[1], bonus: 0 - levelBonus(param.level), desc: '游戏开局抵押学分'});
    //开始游戏的逻辑
    var ep = new eventproxy();
    ep.fail(callback);
    ep.all('users', 'ai', function (users, ai) {
        proxy.Battle.createBattle({users: users, level: param.level}, function (err, doc) {
            if (err) {
                log.error('create game error: ' + err.message);
                return callback(err);
            }
            callback(null, doc.battle_id);

            //通知双方，并且要包含对方的用户信息（id，头像，昵称）
            if(ai) {
                //如果游戏中有ai，那么肯定用户userID在第一位，ai的userID在第二位，所以有ai的情况，就不给第二位的用户
                //发送消息了，而是延迟一秒钟发送模拟ai加入的消息
                setTimeout(function () {
                    //延迟一秒钟模拟发送ai join的消息
                    notify(param.users[0], 'joinGame', {battle_id: doc.battle_id, userID: ai.userID});
                }, 1000);
            } else {
                proxy.User.getUserById(users[0], function (err4, doc4) {
                    var userInfo = {userID: '', nick: '', avatar: ''};
                    if (doc4) {
                        userInfo = {userID: doc4._id.toString(), nick: doc4.nick, avatar: doc4.userInfo.avatar, level: 11};
                    }
                    notify(users[1], 'pair', {
                        status: 'preparing',
                        role: 'slave',
                        users: users,
                        userInfo: userInfo,
                        battle_id: doc.battle_id
                    });

                });
            }
            proxy.User.getUserById(users[1], function (err4, doc4) {
                var userInfo = {userID: '', nick: '', avatar: ''};
                if (doc4) {
                    userInfo = {userID: doc4._id.toString(), nick: doc4.nick, avatar: doc4.userInfo.avatar, level: 11};
                }
                notify(users[0], 'pair', {
                    status: 'preparing',
                    role: 'master',
                    users: users,
                    userInfo: userInfo,
                    battle_id: doc.battle_id
                });
            });
            battlePool.create(doc.battle_id, ai);
        });
    });
    if (param.users.length = 1) { //只有一个用户userID的时候，要配对一个ai
        var ai = new AI();
        ai.init(ep.done('users', function (doc) {
            param.users.push(doc.userID);
            ep.emit('ai', doc);
            return param.users;
        }));
    } else {
        ep.emit('users', param.users);
        ep.emit('ai', null);
    }
};

//输入关卡数，返回需要抵押的学分
function levelBonus(level){
    return floor((Math.pow((level - 1), 4) + 10) / 10 * ((level - 1) * 2 + 10) + 20, 20);
}
//FLOOR算法
function floor(num, sig){
    if(!sig){
        sig = 1;
    }
    return sig * Math.floor(num /sig);
}
