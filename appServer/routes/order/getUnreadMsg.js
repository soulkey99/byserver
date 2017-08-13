/**
 * Created by MengLei on 2015/3/14.
 */

var objectId = require('mongojs').ObjectId;
var db = require('../../../config').db;
var result = require('../../utils/result');
var log = require('../../../utils/log').http;

module.exports = function (req, res) {
    var _id = new objectId(req.body.o_id);
    db.orders.findOne({_id: _id}, {chat_msg: 1, _id: 0}, function (err, doc) {
        if (err) {
            //handle error
            log.error('get unread msg error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        } else {
            if (doc) {
                var unreadList = [];
                for (var i = 0; i < doc.chat_msg.length; i++) {
                    if (doc.chat_msg[i].to == req.body.userID && doc.chat_msg[i].state == 'sent') {
                        unreadList.push(doc.chat_msg[i]);
                        doc.chat_msg[i].state = 'received';
                    }
                }
                if (unreadList.length > 0) {
                    db.orders.update({_id: _id}, {$set: {chat_msg: doc.chat_msg}});
                }
                log.debug('get unread message: ' + JSON.stringify(unreadList));
                result(res, {statusCode: 900, msgList: unreadList});
            } else {
                log.error('get unread msg error,  order id not exists.');
                result(res, {statusCode: 905, message: 'order id not exists.'});
            }
        }
    })
};