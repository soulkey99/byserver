/**
 * Created by MengLei on 2015/9/19.
 */

var db = require('../../../../config').db;
var objectId = require('mongojs').ObjectId;
var result = require('../../../utils/result');
var eventproxy = require('eventproxy');
var log = require('./../../../../utils/log').h5;

//获取订单详情
module.exports = function(req, res){
    var _id = new objectId();
    try{
        _id = new objectId(req.body.o_id);
    }catch(ex){
        result(res, {statusCode: 919, message: ex.message});
        return;
    }
    db.orders.findOne({_id: _id}, function(err, doc){
        if(err){
            result(res, {statusCode: 905, message: err.message});
        }else{
            if(doc){
                var item = {
                    o_id: doc.o_id,
                    s_id: doc.s_id,
                    s_phone: '',
                    s_nick: '',
                    t_id: doc.t_id || '',
                    t_phone: '',
                    t_nick: '',
                    grade: doc.grade,
                    subject: doc.subject,
                    status: doc.status,
                    create_time: doc.create_time,
                    start_time: doc.start_time,
                    stars: doc.stars,
                    duration: doc.duration,
                    remark: doc.remark,
                    q_msg: doc.q_msg,
                    chat_msg: doc.chat_msg
                };
                var ep = new eventproxy();
                ep.all('t_info', 's_info', function(t_info, s_info){
                    if(t_info){
                        item.t_phone = t_info.phone;
                        item.t_nick = t_info.nick;
                    }
                    if(s_info){
                        item.s_phone = s_info.phone;
                        item.s_nick = s_info.nick;
                    }
                    result(res, {statusCode: 900, detail: item});
                });
                ep.fail(function(err){
                    result(res, {statusCode: 905, message: err.message});
                });
                var t_id = new objectId(), s_id = new objectId();
                try{
                    if(doc.t_id) {
                        t_id = new objectId(doc.t_id);
                    }
                    if(doc.s_id){
                        s_id = new objectId(doc.s_id);
                    }
                }catch (ex){
                    //
                }
                db.users.findOne({_id: t_id}, {phone: 1, nick: 1}, ep.done('t_info'));
                db.users.findOne({_id: s_id}, {phone: 1, nick: 1}, ep.done('s_info'));

            }else{
                result(res, {statusCode: 913, message: 'order id not exists.'});
            }
        }
    })
};
