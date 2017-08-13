/**
 * Created by MengLei on 2016/1/21.
 */

var userPool = require('../model/userPool');
//在这里将不同的请求mqtt请求route给不同的处理函数
//content = {route: '', userID: '', authSign: '', body: {}}
module.exports = function (content, callback) {
    if (!callback) {
        callback = function () {
            console.log('game mqtt route default callback.');
        }
    }
    //如果body为空，那么赋一个空对象
    if (!content.body) {
        content.body = {};
    }
    //将userID赋值给body
    content.body.userID = content.userID;
    switch (content.route) {
        case 'online':  //用户上线
            userPool.online(content.userID);
            break;
        case 'quit':    //用户下线
            userPool.quit(content.userID);
            break;
        case 'tick':    //心跳
            userPool.tick(content.userID);
            break;
        case 'pair':    //匹配对手ing
            userPool.pair(content.userID, content.body.level);
            break;
        case 'prepare':
            break;
        case 'enter':
            break;
        case 'start':
            break;
        case 'playing':
            break;
        case 'challenge':
            break;
        case 'quitPlaying': //强制退出游戏
            break;
        case 'ping':    //探测某用户是否还在线
            userPool.ping(content.body);
            break;
        case 'pingBack':    //探测某用户是否还在线的回应
            userPool.pingBack(content.body);
            break;
        default:
            break;
    }
};
