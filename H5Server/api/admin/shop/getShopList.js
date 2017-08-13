/**
 * Created by MengLei on 2015/8/7.
 */

var db = require('../../../../config').db;
var config = require('../../../../config');
var objectId = require('mongojs').ObjectId;
var result = require('../../../utils/result');
var log = require('../../../../utils/log').h5;

//获取商户的名称与id对应关系
module.exports = function(req, res){
    var start = parseInt(req.body.startPos ? req.body.startPos : 1);  //默认起始位置是1
    var count = parseInt(req.body.pageSize ? req.body.pageSize : 50);  //默认返回每页5条
    var query = {adminType: 'shop', delete: {$ne: true}};
    if(req.body.delete == 'true'){
        query = {adminType: 'shop'};
    }

    db.admins.find(query).skip((start - 1) < 0 ? 0 : (start - 1)).limit(count).toArray(function(err, doc){
        if(err){
            //
        }else{
            var list = [];
            for(var i=0; i<doc.length; i++){
                list.push({
                    shopID: doc[i]._id.toString(),
                    userName: doc[i].userName,
                    type: doc[i].adminType,
                    shopName: doc[i].nick,
                    userInfo: {
                        name: doc[i].userInfo.name || '',
                        phone: doc[i].userInfo.phone || '',
                        desc: doc[i].userInfo.desc || '',
                        address: doc[i].userInfo.address || ''
                    }
                });
            }
            result(res, {statusCode: 900, list: list});
        }
    });
};


