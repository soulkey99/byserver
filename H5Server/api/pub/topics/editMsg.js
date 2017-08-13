/**
 * Created by MengLei on 2015/10/29.
 */

var db = require('./../../../../config').db;
var objectId = require('mongojs').ObjectId;
var result = require('./../../../utils/result');
var pubOperate = require('../utils/pubOperate');
var BagPipe = require('bagpipe');
var bagPipe = new BagPipe(10);
var eventproxy = require('eventproxy');
var msgItem = require('./utils/msgItem');
var log = require('../../../../utils/log').h5;

//公众号发布消息内容
module.exports = function(req, res){
    //
    var curTime = new Date();
    var _id = new objectId();
    if(req.body.pm_id) {
        //如果传入了pm_id，那么就是编辑之前已发过的消息
        try {
            _id = new objectId(req.body.pm_id);
        } catch (ex) {
            log.error('edit pub msg, pm_id: ' + req.body.pm_id + ', exception: ' + ex.message);
            result(res, {statusCode: 919, message: ex.message});
            return;
        }
        var setObj = {updateTime: curTime.getTime()};
        var unsetObj = {};
        if (req.body.type != undefined) {
            setObj.type = req.body.type;
        }
        if(req.body.delete != undefined){
            setObj.delete = (req.body.delete == 'true');
        }
        switch (setObj.type) {
            case 'single':
            {
                if(req.body.pt_id != undefined) {
                    setObj['pt_id'] = req.body.pt_id;
                }
                unsetObj = {cover: '', title: '', link: '', list: ''};
            }
                break;
            case 'multi':
            {
                var newList = [];
                try{
                    newList = JSON.parse(req.body.list);
                }catch(ex){
                    result(res, {statusCode: 942, message: ex.message});
                    return;
                }
                setObj['list'] = newList;
                unsetObj = {cover: '', title: '', link: ''};
            }
                break;
            case 'link':
            {
                if(req.body.title != undefined){
                    setObj['title'] = req.body.title;
                }
                if(req.body.cover != undefined){
                    setObj['cover'] = req.body.cover;
                }
                if(req.body.text){
                    setObj['text'] = req.body.text;
                }
                if(req.body.link != undefined){
                    setObj['link'] = req.body.link;
                }
                unsetObj = {pt_id: '', list: ''};
            }
                break;
            case 'text':
            {
                if(req.body.text != undefined){
                    setObj['text'] = req.body.text;
                }
                unsetObj = {pt_id: '', cover: '', title: '', link: '', list: ''};
            }
                break;
            case 'richText':
            {
                if(req.body.text != undefined){
                    setObj['text'] = req.body.text;
                }
                if(req.body.title != undefined){
                    setObj['title'] = req.body.title;
                }
                unsetObj = {pt_id: '', cover: '', link: '', list: ''};
            }
                break;
            default :
                break;
        }
        var operObj = {$set: setObj};
        if(setObj.type){
            operObj['$unset'] = unsetObj;
        }
        //console.log('edit msg: ' + JSON.stringify(operObj));
        db.pubMsg.update({_id: _id}, operObj, function (err) {
            if (err) {
                result(res, {statusCode: 905, message: err.message});
            } else {
                result(res, {statusCode: 900});
            }
        });
    } else {
        //如果没有传pm_id，那么就是发布新的消息
        var msg = {
            _id: _id,
            author_id: req.body.userID,     //作者id
            createTime: curTime.getTime(),  //创建时间
            updateTime: curTime.getTime(),  //最后更新时间
            delete: false,  //删除标记
            type: req.body.type || 'single', //消息类型
            castType: req.body.castType || 'broadcast' //发送类型
        };
        switch (msg.type) {
            case 'single':
            {
                msg.pt_id = req.body.pt_id;
            }
                break;
            case 'multi':
            {
                var list = [];
                try{
                    list = JSON.parse(req.body.list);
                }catch(ex){
                    result(res, {statusCode: 942, message: ex.message});
                    return;
                }
                msg.list = list;
            }
                break;
            case 'text':
            {
                msg.text = req.body.text;
            }
                break;
            case 'link':
            {
                msg.text = req.body.text;
                msg.link = req.body.link;
                msg.title = req.body.title;
                msg.cover = req.body.cover;
            }
                break;
            case 'richText':
            {
                msg.text = req.body.text;
                msg.title = req.body.title;
            }
                break;
            default :
                break;
        }

        db.pubMsg.insert(msg, function(err) {
            if (err) {
                result(res, {statusCode: 905, message: err.message});
            } else {
                pubOperate({userID: msg.author_id, operType: 'pubMsg', operID: _id.toString()});
                result(res, {statusCode: 900, pt_id: _id.toString()});
                //将公众号刚刚发布的消息添加到与每个用户的聊天记录中
                addPubChat(msg.author_id, msg);
            }
        });
    }
};

//公众号每发布一篇文章，就要将此文章插入到所有的关注此公众号的人的聊天记录中
function addPubChat(pub_id, pm){
    var _id = new objectId();
    try{
        _id = new objectId(pub_id);
    }catch (ex){
        //
    }
    var ep = new eventproxy();
    ep.all('followers', 'msg', function(followers, msg){
        var list = !!(followers && followers.list) ? followers.list : [];
        for(var i=0; i<list.length; i++){
            var item = {
                userID: list[i],
                pub_id: pub_id,
                type: 'pubMsg',
                direction: 'p2u',
                detail: msg,
                time: Date.now()
            };
            bagPipe.push(asyncInsertMsg, item, function(err){
                //
            });
        }
    });
    ep.fail(function(){
        //
    });
    db.userFollowers.findOne({_id: _id}, ep.done('followers'));
    msgItem(pm, ep.done('msg'));
}

function asyncInsertMsg(item, callback){
    db.pubChat.insert(item, callback);
}
