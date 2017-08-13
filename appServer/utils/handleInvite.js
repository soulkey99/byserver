/**
 * Created by MengLei on 2015/6/17.
 */
var dnode = require('./dnodeClient');
var db = require('../../config').db;
var proxy = require('../../common/proxy');
var objectId = require('mongojs').ObjectId;
var query = require('query-mobile-phone-area');
var eventproxy = require('eventproxy');
var log = require('../../utils/log').http;
var addBonus = require('../../utils/addBonus');


module.exports = {
    inviter: function(id){
        //处理邀请人得到的奖励
        db.users.findOne({_id: new objectId(id)}, function(err, doc){
            if(err){
                //handle error
            }else{
                if(doc){
                    var phone = doc.phone;
                    var flow = 30;
                    if(is_unicom(phone)){
                        flow = 50;
                    }

                    dnode('flowServer', 'orderFlow', {num: phone, flow: flow, purpose: 'inviter'}, function(err, resp){
                        //handle callback
                        //console.log(err);
                        //console.log(resp);
                    });
                }
            }
        });
    },
    invitee: function(id){
        //处理被邀请人得到的奖励
        db.users.findOne({_id: new objectId(id)}, function(err, doc){
            if(err){
                //handle error
            }else{
                if(doc){
                    var phone = doc.phone;
                    var flow = 10;
                    //if(is_unicom(phone)){
                    //    flow = 50;
                    //}
                    dnode('flowServer', 'orderFlow', {num: phone, flow: flow, purpose: 'invitee'}, function(err, resp){
                        //handle callback
                    });
                }
            }
        });
    },
    firstLogin: function(phone){//对于首次登陆，传递手机号而非用户id
        //处理首次登陆奖励
        var flow = 30;
        if(is_unicom(phone)){
            flow = 50;
        }

        dnode('flowServer', 'orderFlow', {num: phone, flow: flow, purpose: 'firstLogin'}, function(err, resp){
            //handle callback
            //console.log(resp);
        });
    },
    inviteBonus: function(id){
        //20151023：改成每邀请一名用户，得到30积分，推广人员除外
        db.users.findOne({_id: new objectId(id)}, {'userInfo.promoter': 1}, function(err, doc){
            if(err){
                //
            }else{
                if(doc){
                    //存在这个用户
                    if(!doc.userInfo.promoter){//不是推广人员才加分
                        addBonus(id, '8');
                    }

                }
            }
        });
    },
    v2: function(id){
        setTimeout(function(){
            //延迟三秒钟，等待数据全部写入
            onRegister(id);
        }, 3000);
    }
};

//判断手机号是否联通
function is_unicom(phone){
    var unicomArray = ['130', '131', '132', '155' ,'156' ,'185', '186'];
    var prefix = phone.substr(0, 3);
    return unicomArray.indexOf(prefix) > -1;
}

//onRegister('5653faffcedb551c5c49a8fd');

function onRegister(id) {    //用户注册之后的各种奖励之类的操作
    log.trace('on user register: userID: ' + id);
    db.users.findOne({_id: new objectId(id)}, {_id: 1, phone: 1, 'userInfo.ext_info': 1}, function (err, doc) {
        if (err) {
            //
        } else {
            if (doc) {
                //奖励
                var ep = new eventproxy();
                ep.all('shareCode', 'channel', function (shareConf, channel) {
                    if(shareConf == 'flow'){
                        //冲流量
                        chargeFlow(doc.phone);
                    } if (shareConf == 'noflow') {
                        //不充流量
                    } if(shareConf == 'bonus'){
                        //奖励300积分
                        proxy.Bonus.newReg({userID: id, bonus: '300', desc: '渠道特殊奖励300积分！'});
                    }
                    //else {
                    //    if (channel == '360market') {
                    //        //console.log('360market channel, phone: ' + doc.phone);
                    //        chargeFlow(doc.phone);
                    //    } else if (channel == 'TencentAPP') {
                    //        console.log('TencentAPP channel, no flow phone: ' + doc.phone);
                    //        //uc不充流量
                    //        //chargeFlow(doc.phone);
                    //    } else {
                    //        //充流量
                    //        chargeFlow(doc.phone);
                    //    }
                    //}
                });
                if (doc.userInfo.ext_info && doc.userInfo.ext_info.promoterShareCode) {//存在邀请码
                    //获取邀请码对应的配置信息，同时对邀请人进行积分奖励
                    db.shareCode.findOne({shareCode: doc.userInfo.ext_info.promoterShareCode}, {config: 1, userID: 1}, ep.done('shareCode', function (doc2) {
                        var conf = 'noflow';
                        if (doc2) {
                            conf = doc2.config;
                            //积分奖励邀请人
                            addBonus(doc2.userID, '8');
                        }
                        return conf;
                    }));
                } else {
                    //没有邀请码，走邀请码默认没有流量的分支
                    ep.emit('shareCode', 'noflow');
                }
                //查询该用户对应的注册渠道
                db.dbLog.findOne({userID: id, action: 'register'}, ep.done('channel', function (doc2) {
                    var channel = '';
                    if (doc2) {
                        channel = doc2.content.channel;
                    }
                    return channel;
                }));
            }
        }
    });
}

function chargeFlow(phone){
    //先对用户发放注册奖励
    var flow = 30;
    var q_res = query(phone);
    if(q_res && q_res.type == '中国联通'){//联通用户50兆流量
        flow = 50;
    }
    dnode('flowServer', 'orderFlow', {num: phone, flow: flow, purpose: 'firstLogin'}, function(err, resp){
        //handle callback
        //console.log(resp);
    });
}