/**
 * Created by MengLei on 2015/9/19.
 */

var db = require('./../../../../config').db;
var result = require('./../../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('./../../../../utils/log').h5;

//通过手机号，获取用户信息
module.exports = function(req, res) {
    //
    var start = parseInt(req.body.startPos || 1) - 1;
    var count = parseInt(req.body.pageSize || 10);

    var query = {};
    if(req.body.phonenum){
        query = {phone: new RegExp(req.body.phonenum)};
    }
    if(req.body.nick){
        query = {nick: new RegExp(req.body.nick)};
    }
    if(req.body.u_id){
        try {
            query = {_id: new objectId(req.body.u_id)};
        }catch (ex){
            //
        }
    }

    db.users.find(query).skip(start < 0 ? 0:start).limit(count).toArray(function (err, doc) {
        if (err) {
            log.error('get user by phone error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        } else {
            if (doc.length > 0) {
                var ids = [];
                for(var i=0; i<doc.length; i++){
                    ids.push(doc[i]._id.toString());
                }
                db.shareCode.find({userID: ids}, function(err2, doc2){
                    if(err2){
                        log.error('get user info, get share code error: ' + err2.message);
                        result(res, {statusCode: 905, message: err2.message});
                    }else{
                        var list = [];
                        for(var j=0; j<doc.length; j++){
                            var item = {
                                u_id: doc[j]._id.toString(),
                                nick: doc[j].nick,
                                phone: doc[j].phone,
                                userType: doc[j].userType,
                                bonus: doc[j].userInfo.bonus || 0,
                                create_time: doc[j].userInfo.create_time,
                                last_login: doc[j].userInfo.last_login,
                                promoter: doc[j].userInfo.promoter,
                                shareCode: '',
                                invited: 0,
                                registered: 0
                            };
                            for(var k=0; k<doc2.length; k++){
                                if(item.u_id == doc2[k].userID){
                                    item.shareCode = doc2[k].shareCode;
                                    if(doc2[k].stat){
                                        item.invited = doc2[k].stat.invited;
                                        item.registered = doc2[k].stat.registered;
                                    }
                                }
                            }
                            list.push(item);
                        }
                        result(res, {statusCode: 900, list: list});
                    }
                });
            } else {
                log.error('get user by phone error, user not exists.');
                result(res, {statusCode: 900, list: []});
            }
        }
    });
};