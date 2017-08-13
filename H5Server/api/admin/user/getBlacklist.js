/**
 * Created by MengLei on 2015/10/13.
 */

var db = require('./../../../../config').db;
var result = require('./../../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('./../../../../utils/log').h5;

//获取黑名单列表
module.exports = function(req, res){
    var start = parseInt(req.body.startPos || 1) - 1;
    var count = parseInt(req.body.pageSize || 10);
    var query = {type: 'blacklist', status: 'blacklist'};
    db.userConf.find(query).skip(start<0?0:start).limit(count).toArray(function(err, doc){
        if(err){
            result(res, {statusCode: 905, message: err.message});
        }else{
            var list = [];
            for(var i=0; i<doc.length; i++){
                var item = {
                    phone: doc[i].phonenum,
                    desc: doc[i].desc,
                    nick: '',
                    expire: 0,
                    time: 0,
                    create_time: 0,
                    last_login: 0
                };
                item.time = doc[i]._id.getTimestamp().getTime();
                if(doc[i].expire){
                    item.expire = doc[i].expire.getTime();
                }
                list.push(item);
            }
            queryNick(list, function(err2, doc2){
                if(err2){
                    result(res, {statusCode: 905, message: err2.message});
                }else{
                    //查询成功
                    result(res, {statusCode: 900, list: doc2});
                }
            })
        }
    });
};


//列表中的每个item添加昵称等个人信息
function queryNick(list, callback){
    var phones = [];
    for(var i=0; i<list.length; i++){
        phones.push(list[i].phone);
    }
    db.users.find({phone: {$in: phones}}, {phone: 1, nick: 1, 'userInfo.create_time': 1, 'userInfo.last_login': 1}, function(err, doc){
        if(err){
            callback(err);
        }else{
            for(var j=0; j<doc.length; j++){
                for(var k=0; k<list.length; k++){
                    if(doc[j].phone == list[k].phone){
                        list[k].nick = doc[j].nick;
                        list[k].create_time = doc[j].userInfo.create_time;
                        list[k].last_login = doc[j].userInfo.last_login;
                    }
                }
            }
            callback(null, list);
        }
    });
}

