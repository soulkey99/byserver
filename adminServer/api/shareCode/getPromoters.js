/**
 * Created by MengLei on 2015/5/23.
 */

var db = require('./../../../config').db;
var result = require('./../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('./../../../utils/log').admin;

module.exports = function(req, res) {
    //获取
    var start = req.body.startPos ? req.body.startPos : 1;
    var count = req.body.pageSize ? req.body.pageSize : 5;
    db.users.find({'userInfo.promoter': true}).skip((parseInt(start) - 1) < 0 ? 0 : (parseInt(start) - 1)).limit(parseInt(count)).toArray(function (err, doc) {
        if (err) {
            //handle error
        } else {
            var idArray = [];
            for (var i = 0; i < doc.length; i++) {
                idArray.push(doc[i]._id.toString());
                doc[i].userID = doc[i]._id.toString();
                delete(doc[i].authSign);
            }
            db.shareCode.find({userID: {$in: idArray}}, function (err2, doc2) {
                if (err2) {
                    //handle error
                } else {
                    for (var j = 0; j < doc.length; j++) {
                        for (var k = 0; k < doc2.length; k++) {
                            if(doc[j]._id.toString() == doc2[k].userID){
                                doc[j].shareCode = doc2[k].shareCode;
                                if(doc2[k].stat){
                                    //返回统计值，组装数据
                                    doc[j].stat = doc2[k].stat.invited + '/' + doc2[k].stat.registered;
                                    doc[j].all = doc2[k].stat.invited;
                                }else{
                                    //如果没有值，则返回空
                                    doc[j].stat = '-/-';
                                    doc[j].all = 0;
                                }
                            }
                        }
                    }
                    doc.sort(function(a, b){
                        return b.all - a.all;
                    });
                    result(res, {statusCode: 900, promoterList: doc});
                }
            });
        }
    });
};