/**
 * Created by MengLei on 2015/11/27.
 */

var db = require('./../../config').db;
var objectId = require('mongojs').ObjectId;
var log = require('./../../utils/log').order;

//获取公众号菜单配置
module.exports = function(param, callback){
    var _id = new objectId();
    try{
        _id = new objectId(param.pub_id);
    }catch (ex){
        callback({statusCode: 919, message: ex.message});
        return;
    }
    db.users.findOne({_id: _id}, {menu: 1}, function(err, doc){
        if(err){
            callback({statusCode: 905, message: err.message});
        }else{
            var menu = [];
            if(doc && doc.menu){
                menu = doc.menu;
            }
            callback({statusCode: 900, menu: menu});
        }
    });
};
