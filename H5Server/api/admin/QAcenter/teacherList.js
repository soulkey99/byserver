/**
 * Created by MengLei on 2015/9/16.
 */

var db = require('./../../../../config').db;
var result = require('./../../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('./../../../../utils/log').h5;

//显示答疑中心教师列表
module.exports = function(req, res){
    var start = parseInt(req.body.startPos || 1) - 1;
    var count = parseInt(req.body.pageSize || 10);

    var query = {type: 'teacher', delete: {$ne: true}};
    if(req.body.delete == 'true'){
        query = {type: 'teacher'};
    }
    if(req.body.name){
        query.name = new RegExp(req.body.name);
    }
    if(req.body.phonenum){
        query.phonenum = new RegExp(req.body.phonenum);
    }
    var cursor = db.userConf.find(query).skip(start > 0 ? start : 0).limit(count);
    if(req.body.type == 'simple'){
        cursor = db.userConf.find({type: 'teacher', delete: {$ne: true}});
    }
    cursor.toArray(function(err, doc){
        if(err){
            result(res, {statusCode: 905, message: err.message});
        }else{
            var list = [];
            for(var i=0; i<doc.length; i++){
                if(req.body.type == 'simple'){
                    list.push({phonenum: doc[i].phonenum, name: doc[i].name});
                }else {
                    list.push({
                        phonenum: doc[i].phonenum,
                        type: doc[i].type,
                        smscode: doc[i].smscode,
                        status: doc[i].status,
                        name: doc[i].name,
                        desc: doc[i].desc,
                        delete: doc[i].delete
                    });
                }
            }
            result(res, {statusCode: 900, list: list});
        }
    })
};