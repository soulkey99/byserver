/**
 * Created by MengLei on 2016/3/7.
 */
"use strict";
const eventproxy = require('eventproxy');
const mission_list = require('./mission_list.json');

//获取我的任务列表， param = {userID: ""}
module.exports = function(param, callback) {
    //
    let ep = new eventproxy();
    ep.after('item', mission_list.length, function(itemList) {
        //返回的任务列表，按任务类型分为不同的list，暂定（每日任务daily、新手任务beginner、特殊任务special）
        let list = [{
            type: 'daily',
            name: '日常任务',
            avatar: 'http://oss.soulkey99.com/upload/20160315/4c081be268989db6a56b48d2982394ca.png',
            list: []
        }, {
            type: 'special',
            name: '特殊任务',
            avatar: 'http://oss.soulkey99.com/upload/20160315/576b832476595282a449ce4d54333f3c.png',
            list: []
        }];
        for (let i = 0; i < itemList.length; i++) {
            if (itemList[i]) {
                for(let j=0; j<list.length; j++){
                    if(itemList[i].type == list[j].type){
                        list[j].list.push(itemList[i]);
                    }
                }
            }
        }
        callback(null, list);
    });
    for(let i=0; i<mission_list.length; i++){
        switch (mission_list[i].identifier){
            case '56d7ddcd6e5c4a201f61dd50':    //每日登录
                require('./items/continuousLogin')({userID: param.userID}, ep.group('item'));
                break;
            case '56d7ddcd6e5c4a201f61dd51':    //每日连胜
                require('./items/continuousWin')({userID: param.userID}, ep.group('item'));
                break;
            case '56d7ddcd6e5c4a201f61dd52':    //每日提问
                require('./items/dailyInstantOrder')({userID: param.userID}, ep.group('item'));
                break;
            default:
                ep.emit('item', null);
                break;
        }
    }
};

