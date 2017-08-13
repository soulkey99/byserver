/**
 * Created by MengLei on 2016/3/9.
 */
"use strict";
const proxy = require('../../../../common/proxy');
const eventproxy = require('eventproxy');
const mission_list = require('../mission_list.json');

//监控每日连胜任务（56d7ddcd6e5c4a201f61dd51），param={userID: ''}
var getItem = function(param, callback) {
    let ep = new eventproxy();
    ep.all('item', 'count', function (item, count) {
        item.process = '已完成最大连胜' + count.count + '场';
        if (item.current_process) {
            if (item.current_process == 5 && count.count >= 10) {
                //可领取10局奖励
                item.status = 'available';
                item.process += '，当前可领取10局连胜奖励。';
            }
            if (item.current_process == 10 && count.count >= 20) {
                item.status = 'available';
                item.process += '，当前可领取20局连胜奖励。';
            }
            if (item.current_process == 20 && count.count >= 50) {
                item.status = 'available';
                item.process += '，当前可领取50局连胜奖励。';
            }
            if (item.current_process == 50 && count.count >= 100) {
                item.status = 'available';
                item.process += '，当前可领取100局连胜奖励。';
            }
            if(item.current_process == 100){
                item.status = 'success';
                item.process = '已完成连胜100场任务，明天请继续努力！';
            }
        } else {
            if (count.count >= 5) {
                //可领取5局奖励
                item.status = 'available';
                item.process += '，当前可领取5局连胜奖励。';
            }
        }
        delete(item.current_process);
        callback(null, item);
    });
    ep.fail(callback);
    //获取任务item
    proxy.GameMission.getUserTodayMissionItem({
        userID: param.userID,
        identifier: '56d7ddcd6e5c4a201f61dd51'
    }, ep.done('item', function (doc) {
        let item = {};
        for (let i = 0; i < mission_list.length; i++) {
            if (mission_list[i].identifier == '56d7ddcd6e5c4a201f61dd51') {
                item = {
                    identifier: '56d7ddcd6e5c4a201f61dd51',
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
            item.current_process = doc.current_process;
            //item.status = 'success';
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
        if(count.count < 5){
            return callback(new Error('今日尚未完成任务，无法领取奖励！'));
        }
        var resp = {bonus: 0, point: 0, intellectual: 0, current_process: 0};
        if (item && item.current_process) {
            if (item.current_process == 5 && count.count >= 10) {
                //可领取10局奖励
                resp.bonus = 260;
                resp.current_process = 10;
            }
            if (item.current_process == 10 && count.count >= 20) {
                resp.bonus = 700;
                resp.current_process = 20;
            }
            if (item.current_process == 20 && count.count >= 50) {
                resp.bonus = 2000;
                resp.point = 1;
                resp.current_process = 50;
            }
            if (item.current_process == 50 && count.count >= 100) {
                resp.bonus = 10000;
                resp.point = 3;
                resp.current_process = 100;
            }
            if(item.current_process == 100){
                return callback(new Error('所有奖励已全部领取过，不能再次领取！'));
            }
        } else {
            if (count.count >= 5) {
                //可领取5局奖励
                resp.bonus = 100;
                resp.current_process = 5;
            }
        }
        proxy.GameUserRecord.addBonus({userID: param.userID, identifier: '56d7ddcd6e5c4a201f61dd51', bonus: resp.bonus, point: resp.point, desc: '每日连胜任务奖励'});
        proxy.GameMission.setMission({userID: param.userID, identifier: '56d7ddcd6e5c4a201f61dd51', bonus: resp.bonus, point: resp.point, current_process: resp.current_process});
        callback(null, resp);
    });
    ep.fail(callback);
    proxy.GameMission.getUserTodayMissionItem({userID: param.userID, identifier: '56d7ddcd6e5c4a201f61dd51'}, ep.done('item'));
    getCount(param, ep.done('count'));
}

function getCount(param, callback){
    let t = new Date();
    let t1 = t.setHours(0, 0, 0, 0);
    let t2 = t.setHours(23, 59, 59, 999);
    proxy.Battle.getBattleByQuery({
        createTime: {$gte: t1, $lt: t2},
        users: param.userID
    }, {}, function (err, doc) {
        if(err){
            return callback(err);
        }
        let winIndex = [];
        for (let i = 0; i < doc.length; i++) {
            if (doc[i].winner == param.userID) {
                winIndex.push(i);
            }
        }
        let maxWin = 0;
        if (winIndex.length > 0) {
            let k = 0;
            for (let i = 0; i < winIndex.length; i++) {
                if (winIndex[i] - winIndex[i - 1] == 1) {
                    k++;
                } else {
                    maxWin = Math.max(maxWin, k);
                    k = 0;
                }
            }
            maxWin = Math.max(maxWin, k) + 1;
        }
        //console.log(winIndex);
        callback(null, {
            identifier: '56d7ddcd6e5c4a201f61dd51',
            count: maxWin > 100 ? 100 : maxWin
        });
    });
}

