/**
 * Created by MengLei on 2015/2/9.
 */


var mqtt = require('../mqtt/mqttClient');
var msg = require('../message');
var build = require('../build');
var order = require('../order');
var config = require('../../config');
var redis = require('../utils/redis');
var log = require('../../utils/log').mqtt;
var umengLog = require('../../utils/log').umeng;
var db = require('../../config').db;
var objectId = require('mongojs').ObjectId;
var dnode = require('./../utils/dnodeClient');
var zrpc = require('../../utils/zmqClient');
var umeng = require('../../utils/umeng');

var routes = {};//routes[uid]=connId;
exports.routes = routes;

exports.sendMsg = sendMsg;
exports.buidlChat = buildChat;
exports.pushMsg = pushMsg;
exports.setOrder = setOrder;
exports.isOnline = isOnline;
exports.sendTo = sendTo;


//content：消息内容， dest：目标uid
function sendMsg(content, dest) {
    sendTo({action: 'msg', content: content}, dest);
}

//由教师端发起请求，根据学生端的反馈，判断是否可以建立会话
function buildChat(content, dest) {
    sendTo({action: 'build', content: content}, dest);
}

//根据app server向客户端推送消息
function pushMsg(content, dest) {
    sendTo({action: 'push', content: content}, dest);
}

//修改订单状态，content：
function setOrder(content, dest) {
    sendTo({action: 'order', content: content}, dest);
}

//指定uid是否在线
function isOnline(dest) {
    return routes.hasOwnProperty(dest);
}

function addRoutes(uid, client_id) {
    //添加路由对象中socket和UID的映射关系
    routes[uid] = client_id;
}

//TODO：关于clientId的问题，安卓客户端目前没办法支持超过23位的clientId，但是userID是24位，所以暂时让安卓客户端传userID的后23位，
//前面一位在服务端补齐，由于userID取的是mongodb的ObjectId，前面8位是时间戳，目前来看，在2021年1月14日之前，第一位都是'5'，该方法都是好用的


function on_connected(dest) {
    //客户端连接, mqtt
    if(dest) {
        routes[dest] = dest;
    }
}

function on_disconnected(dest) {
    //客户端断开连接, mqtt
    if (dest && routes.hasOwnProperty(dest)) {
        delete(routes[dest]);
    }
}

function on_publish(data) {
    //客户端发布消息, mqtt
    try {
        //解析消息json
        var dataObj = JSON.parse(data.toString());
        //根据action分发到不同的处理函数
        switch (dataObj.action) {
            //case 'connect'://注册连接
            //    addRoutes(dataObj.content.from, id);
            //    break;
            case 'build'://建立会话
                build(dataObj.content);
                break;
            case 'msg'://聊天消息
                msg(dataObj.content);
                break;
            case 'order'://更改订单状态
                order(dataObj.content);
                break;
            case 'game':    //游戏方面的请求，直接将内容转发给game server
                zrpc('gameServer', 'route', dataObj.content);
                break;
            default:
                break;
        }
    } catch (ex) {
        log.error('router on publish, parse message error: ' + data);
        //mqtt.publish(connId + ' says: ' + data, id);
    }
}


//发送消息，判断对应目标是否在线，如果在线，发送mqtt消息，否则发送umeng push
function sendTo(content, dest) {

    log.trace('send to dest: ' + dest);
    //从redis中获取userid与device token之间的关系，然后将消息发送至对应device token
    redis.get(dest, function(err, resp){
        //
        if(err){
            //handle error
        }else{
            if(resp){
                //有值，发送消息至指定device token
                log.trace('get value of key: ' + dest + ', value is: ' + resp);
                mqtt.sendTo(content, resp);
            }else{
                //没有值，那么说明用户不在线，则通过友盟推送通道进行发送消息
                log.trace('get value of key: ' + dest + 'failed, send to umeng.');
                umengPush(dest, content);
            }
        }
    });
}

//调用uemng推送，发送消息
function umengPush(dest, content){
    var item = {};
    switch (content.action){
        //
        case 'msg':
        {
            if(content.content.msg) {
                item.type = 'msg';
                umengLog.trace('push type: msg, content type: ' + content.content.type);
                switch (content.content.type) {
                    case 'voice':
                        item.text = '您有一条新的语音消息！';
                        break;
                    case 'image':
                        item.text = '您有一条新的图片消息！';
                        break;
                    default :
                        item.text = content.content.msg;
                        break;
                }
                item.detail = {o_id: content.content.o_id};
                //umeng(dest, item);
            }
        }
            break;
        case 'push':
        {
            // if(content.content.status == 'pending') {
            //     item.type = 'order';
            //     item.text = '您有一条新订单可以抢单！';
            //     item.detail = {
            //         o_id: content.content.o_id
            //     };
            // }
        }
            break;
        case 'order':
        {
            if(content.content.userType == 'teacher' || content.content.userType == 'student') {
                item.type = 'order';
                umengLog.trace('push type: order, order status: ' + content.content.status + ', user type: ' + content.content.userType);
                switch (content.content.status) {
                    case 'finished':
                        item.text = '您有一个订单已经完成！';
                        item.detail = {
                            o_id: content.content.o_id,
                            status: 'finished'
                        };
                        break;
                    case 'received':
                        item.text = '您有一个订单已经被接单！';
                        item.detail = {
                            o_id: content.content.o_id,
                            status: 'received'
                        };
                        break;
                    default:
                        item.detail = {};
                        break;
                }
            }
        }
            break;
        default :
            //除以上几种情况外，不发送友盟消息
            return;
            break;

    }
    //log.trace('umeng push dest: ' + dest + 'item: ' + JSON.stringify(item));
    umeng(dest, item);


}

exports.on_connected = on_connected;
exports.on_disconnected = on_disconnected;
exports.on_publish = on_publish;


