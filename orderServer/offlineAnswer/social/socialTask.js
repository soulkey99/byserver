/**
 * Created by MengLei on 2015/9/8.
 */

var db = require('../../../config').db;
var offlineOperate = require('../utils/offlineOperate');
db.offlineTopics.find({}, function(err, doc){
    if(err){
        //
    }else{
        for(var i=0; i<doc.length; i++){
            offlineOperate({userID: doc[i].author_id, operType: 'topic', operID: doc[i]._id.toString(), time: doc[i].createTime});
        }
    }
});

db.offlineAnswers.find({}, function(err, doc){
    if(err){
        //
    }else{
        for(var i=0; i<doc.length; i++){
            offlineOperate({userID: doc[i].author_id, operType: 'answer', operID: doc[i]._id.toString(), time: doc[i].createTime});
            for(var j=0; j<doc[i].ups.length; j++){
                offlineOperate({userID: doc[i].ups[j], operType: 'upAnswer', operID: doc[i]._id.toString(), time: doc[i].createTime + 3600000});
            }
            for(var j=0; j<doc[i].downs.length; j++){
                offlineOperate({userID: doc[i].downs[j], operType: 'downAnswer', operID: doc[i]._id.toString(), time: doc[i].createTime + 7200000});
            }
        }
    }
});

db.offlineAnsReply.find({}, function(err, doc){
    if(err){
        //
    }else{
        for(var i=0; i<doc.length; i++){
            offlineOperate({userID: doc[i].author_id, operType: 'reply', operID: doc[i]._id.toString(), time: doc[i].createTime});
            for(var j=0; j<doc[i].ups.length; j++){
                offlineOperate({userID: doc[i].ups[j], operType: 'upReply', operID: doc[i]._id.toString(), time: doc[i].createTime + 3600000});
            }
            for(var j=0; j<doc[i].downs.length; j++){
                offlineOperate({userID: doc[i].downs[j], operType: 'downReply', operID: doc[i]._id.toString(), time: doc[i].createTime + 7200000});
            }
        }
    }
});





