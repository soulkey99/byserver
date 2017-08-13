/**
 * Created by MengLei on 2015/3/19.
 */

var mqttSettings = require('../../config').mqttSettings;
var mosca = require('mosca');
var mqtt = require('mqtt');
var router = require('../router');
var log = require('./../../utils/log').mqtt;
var db = require('./../../config').db;
var objectId = require('mongojs').ObjectId;
var console = require('../../utils/log');

var server = {};
var client = {};

exports.start = function () {
    server = new mosca.Server(mqttSettings);
    server.authenticate = function (client, userID, authSign, callback) {
//验证userID与authSign，只有通过了，才会链接mqtt服务，否则无法连接
        callback(null, true); //TODO:暂时注释掉这个特性
        return;
        try {
            var _id = new objectId(userID);
            db.users.findOne({_id: _id}, function (err, doc) {
                if (err) {
                    //handle error
                } else {
                    if (doc) {
                        var authorized = doc.authSign == authSign.toString();
                        log.trace('mqtt authentication: ' + authorized + ', userID: ' + userID + ', token: ' + authSign);
                        callback(null, authorized);
                    } else {
                        log.trace('mqtt authentication error, userID: ' + userID + ' not found.');
                        callback(null, false);
                    }
                }
            });
        } catch (ex) {
            log.error('mqtt authentication error: ' + ex.message);
            callback(null, false);
        }
    };

    // fired when the mqtt server is ready.
    server.on('ready', ready);
    // fired when a client is disconnected.
    server.on('clientConnected', clientConnected);
    // fired when a client is disconnected.
    server.on('clientDisconnected', clientDisconnected);
    // fired when a message is received.
    server.on('published', published);
    // fired when the mqtt server is down..
    server.on('closed', closed);
    server.on('subscribed', clientSubscribed);
    server.on('unsubscribed', clientUnsubscribed);
};

exports.client = client;

//mqtt服务端启动
function ready() {
    log.fatal('Mosca mqtt service is up and running on port: ' + mqttSettings.port.toString());
    console.info('Mosca mqtt service is up and running on port: ' + mqttSettings.port.toString());
}

//发送消息到指定目标
function sendTo(msg, dest, qos) {
    var message = {payload: new Buffer(JSON.stringify(msg)), topic: dest};
    if (qos) {
        message.qos = qos;
    } else {
        message.qos = 1;
    }
    log.trace('Published, payload: ', JSON.stringify(msg) + ', from byserver to client id: ' + dest);
    server.publish(message, null, function(){ log.trace('mqtt server publish ok.')});
}

//客户端连接
function clientConnected(client) {
    log.trace('client connected', client.id);
    router.on_connected(client.id);
}

//客户端断开
function clientDisconnected(client) {
    log.trace('Client Disconnected:', client.id);
    router.on_disconnected(client.id);
}

function clientSubscribed(client){
    //
    log.trace('client subscribed', client.id);
}

function clientUnsubscribed(client){
    //
    log.trace('client unsubscribed', client.id);
}

//客户端发送消息到服务器
//目前进行对话的逻辑都是客户端将内容发送给服务器，然后服务器进行解析，再转发给对应客户端，所以只解析发送到topic为'byserver'的消息内容
function published(packet, client) {
    //如果是客户端发送过来的消息，并且是发送给byserver的，那么执行下面的流程
    if (client && (packet.topic == 'byserver')) {
        log.trace('Published, payload: ', packet.payload.toString() + ', from client id: ' + client.id + ', to ' + packet.topic);
        router.on_publish(packet.payload, client.id);
    }
}

//如果mqtt server关闭，理论上该方法不会执行
function closed() {
    log.fatal('Mosca mqtt service is closed');
}

exports.sendTo = sendTo;