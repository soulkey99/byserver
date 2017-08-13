/**
 * Created by MengLei on 2015/7/30.
 */

var db = require('./../../../config').db;
var result = require('./../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('./../../../utils/log').admin;

//获取意见反馈
module.exports = function(req, res){
    //
    db.feedbacks.find({}, function(err, doc){
        if(err){
            //handle error
            log.error('get feedback, load feedback error: ' + err.message);
        }else{
            var idArray = [];
            for(var i=0;i<doc.length; i++){
                var _id = '';
                try{
                    _id = new objectId(doc[i].userID);
                    idArray.push(_id);
                }catch(ex){
                    //
                }
            }
            db.users.find({_id: {$in: idArray}}, function(err2, doc2){
                if(err2){
                    //handle error
                    log.error('get feedback, find user error: ' + err2.message);
                }else{
                    //
                    for(var j=0; j<doc.length; j++){
                        for(var k=0; k<doc2.length; k++){
                            if(doc[j].userID == doc2[k]._id.toString()){
                                doc[j].phone = doc2[k].phone;
                                doc[j].nick = doc2[k].userInfo.name || doc2[k].nick;
                            }
                        }
                    }
                    result(res, {statusCode: 900, list: doc});
                }
            })
        }
    })
};
