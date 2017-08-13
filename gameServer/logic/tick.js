/**
 * Created by MengLei on 2016/1/5.
 */
var proxy = require('./../../common/proxy');
var userPool = require('../model/userPool');
var log = require('./../../utils/log').game;

//响应客户端的上线、下线、心跳等操作
module.exports = function(param) {
    proxy.GameUser.setUserStatus(param.userID, param.status, function (err) {
        if (err) {
            return;
        }
        switch (param.status) {
            case 'online':
                userPool.online(param.userID);
                break;
            case 'tick':
                userPool.tick(param.userID);
                break;
            case 'waiting'://配对，这里设置成waiting，然后进入用户的nextTick之后才会设置为searching，然后进行寻找
                var user = userPool.getUser(param.userID);
                if(user){
                    user.nextTick();
                }
                break;
            case 'quit':
                userPool.remove(param.userID);
                break;
        }
    });
};

