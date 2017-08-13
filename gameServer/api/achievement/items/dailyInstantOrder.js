/**
 * Created by MengLei on 2016/3/10.
 */
"use strict";
const proxy = require('../../../../common/proxy');
const eventproxy = require('eventproxy');
const mission_list = require('../mission_list.json');

//监控每日提问即时订单任务（56d7ddcd6e5c4a201f61dd52），param={userID: ''}
var getItem = function(param, callback) {
    let ep = new eventproxy();
    ep.all('item', 'count', function (item, count) {
        item.process = '已完成' + count.count + '单';
        if (item.status == 'success') {
            item.process = '已完成任务，请明日继续努力！';
        } else if (count.count >= 1) {
            item.process += '，可以领取奖励！';
            item.status = 'available';
        }
        callback(null, item);
    });
    ep.fail(callback);
    //获取任务item
    proxy.GameMission.getUserTodayMissionItem({
        userID: param.userID,
        identifier: '56d7ddcd6e5c4a201f61dd52'
    }, ep.done('item', function (doc) {
        let item = {};
        for (let i = 0; i < mission_list.length; i++) {
            if (mission_list[i].identifier == '56d7ddcd6e5c4a201f61dd52') {
                item = {
                    identifier: '56d7ddcd6e5c4a201f61dd52',
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
        if (count.count < 1) {
            return callback(new Error('今日尚未完成任务，无法领取奖励！'));
        }
        var resp = {bonus: 0, point: 0, intellectual: 0};
        if (count.count >= 1) {
            resp.bonus = 50;
        }
        proxy.GameUserRecord.addBonus({userID: param.userID, identifier: '56d7ddcd6e5c4a201f61dd52', bonus: resp.bonus, desc: '每日登录任务奖励'});
        proxy.GameMission.setMission({userID: param.userID, identifier: '56d7ddcd6e5c4a201f61dd52', bonus: resp.bonus});
        callback(null, resp);
    });
    ep.fail(callback);
    proxy.GameMission.getUserTodayMissionItem({userID: param.userID, identifier: '56d7ddcd6e5c4a201f61dd52'}, ep.done('item'));
    getCount(param, ep.done('count'));
}

function getCount(param, callback) {
    let t = new Date('2016-03-08');
    let t1 = t.setHours(0, 0, 0, 0);
    let t2 = t.setHours(23, 59, 59, 999);
    proxy.Order.getOrderByQuery({
        create_time: {$gte: t1, $lt: t2},
        s_id: param.userID,
        status: 'finished',
        $where: "this.end_time - this.start_time >= 180000"
    }, {}, function (err, doc) {
        if (err) {
            return callback(err);
        }
        let finished = 0;
        for (let i = 0; i < doc.length; i++) {
            if (doc[i].chat_msg.length >= 5) {
                finished++;
            }
        }
        //console.log(finished);
        callback(null, {identifier: '56d7ddcd6e5c4a201f61dd52', count: finished});
    });
}

