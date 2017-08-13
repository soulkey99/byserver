/**
 * Created by MengLei on 2016/3/3.
 */
"use strict";

const proxy = require('../../../../common/proxy');
const log = require('../../../../utils/log').game;
const eventproxy = require('eventproxy');
const mission_list = require('../mission_list.json');

//监控每日登录任务（56d7ddcd6e5c4a201f61dd50），param={userID: ''}
var getItem = function(param, callback) {
    let ep = new eventproxy();
    ep.all('item', 'count', function (item, count) {
        item.process = '已连续完成' + count.count + '天';
        if (count.today && item.status == 'pending') {
            item.process += '，今日已完成，可以领取奖励！';
            item.status = 'available';
        }else if(item.status == 'success'){
            item.process += '，今日已领取！';
        }
        callback(null, item);
    });
    ep.fail(callback);
    //获取任务item
    proxy.GameMission.getUserTodayMissionItem({
        userID: param.userID,
        identifier: '56d7ddcd6e5c4a201f61dd50'
    }, ep.done('item', function (doc) {
        let item = {};
        for (let i = 0; i < mission_list.length; i++) {
            if (mission_list[i].identifier == '56d7ddcd6e5c4a201f61dd50') {
                item = {
                    identifier: '56d7ddcd6e5c4a201f61dd50',
                    type: mission_list[i].type,
                    name: mission_list[i].name,
                    avatar: mission_list[i].avatar,
                    valid: mission_list[i].valid,
                    desc: mission_list[i].desc,
                    status: 'pending',
                    process: ''
                }
            }
        }
        if (doc) {
            item.mission_id = doc.mission_id;
            item.status = 'success';
        }
        return item;
    }));
    getCount(param, ep.done('count'));
};

module.exports = getItem;
getItem.getCount = getCount;
getItem.getAward = getAward;

function getAward(param, callback){
    let ep = new eventproxy();
    ep.all('item', 'count', function (item, count) {
        if (item) {
            //奖励已经被领取过了，不能再次领取
            return callback(new Error('奖励已领取过，不能再次领取！'));
        }
        if (!count.today) {
            return callback(new Error('今日尚未完成任务，无法领取奖励！'));
        }
        var resp = {bonus: 0, point: 0, intellectual: 0};
        if (count.count <= 5) {
            resp.bonus = 10;
        } else if (count <= 10) {
            resp.bonus = 30;
        } else {
            resp.bonus = 50;
        }
        proxy.GameUserRecord.addBonus({userID: param.userID, identifier: '56d7ddcd6e5c4a201f61dd50', bonus: resp.bonus, desc: '每日登录任务奖励'});
        proxy.GameMission.setMission({userID: param.userID, identifier: '56d7ddcd6e5c4a201f61dd50', bonus: resp.bonus});
        callback(null, resp);
    });
    ep.fail(callback);
    proxy.GameMission.getUserTodayMissionItem({userID: param.userID, identifier: '56d7ddcd6e5c4a201f61dd50'}, ep.done('item'));
    getCount(param, ep.done('count'));
}

function getCount(param, callback){
    let t = new Date();
    let t1 = t.setHours(0, 0, 0, 0);
    let t2 = t.setHours(23, 59, 59, 999);
    //连续登陆并进行游戏的天数，以及今日是否登陆过
    let ep2 = new eventproxy();
    ep2.after('item', 11, function (list) {
        let count = 0;
        let today = false;
        if (list[0] > 0) {
            today = true;
            count++;
        }
        log.trace('continuously login days: ' + list);
        for (let i = 1; i < list.length; i++) {
            if (list[i] > 0 && list[i - 1] > 0) {
                count++;
            } else {
                break;
            }
        }
        callback(null, {today: today, count: count});
    });
    ep2.fail(callback);
    for (let i = 0; i < 11; i++) {
        let start = t1 - 86400000 * i;
        let end = t2 - 86400000 * i;
        //log.trace('check continuous login, t1: ' + new Date(start).toLocaleString() + ', t2: ' + new Date(end).toLocaleString());
        proxy.Battle.getBattleByQuery({
            createTime: {$gte: start, $lt: end},
            users: param.userID
        }, {limit: 1}, ep2.group('item', function (doc) {
            return doc.length > 1 ? 1 : doc.length;
        }));
    }
}