/**
 * Created by MengLei on 2015/11/4.
 */

var db = require('./../../../../config').db;
var result = require('./../../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('./../../../../utils/log').h5;

//获取后台管理员列表
module.exports = function(req, res){
    var query = {adminType: {$in: ['admin', 'superAdmin']}};
    var start = parseInt(req.body.startPos || '1') - 1;
    var count = parseInt(req.body.pageSize || '10');
    if(req.body.q_nick){
        query['nick'] = {$regex: req.body.q_nick};
    }
    if(req.body.q_userName){
        query['userName'] = {$regex: req.body.q_userName};
    }
    db.admins.find(query).sort({createTime: -1}).skip(start < 0 ? 0 : start).limit(count).toArray(function(err, doc){
        if(err){
            result(res, {statusCode: 905, message: err.message});
        }else{
            var list = [];
            for(var i = 0; i<doc.length; i++){
                var item = {
                    u_id: doc[i]._id.toString(),
                    adminType: doc[i].adminType,
                    lastLoginTime: doc[i].lastLoginTime,
                    nick: doc[i].nick,
                    userName: doc[i].userName,
                    sections: [],
                    pages: []
                };
                if(item.adminType == 'admin'){
                    item.sections = doc[i].sections;
                    item.pages = doc[i].pages;
                }
                list.push(item);
            }
            result(res, {statusCode: 900, list: list});
        }
    });
};
