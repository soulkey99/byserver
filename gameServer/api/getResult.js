/**
 * Created by MengLei on 2016/1/7.
 */
"use strict";
var proxy = require('../../common/proxy');
var eventproxy = require('eventproxy');
var notify = require('../utils/notify');

//获取游戏最终结果，param = {userID: '', battle_id: ''}
module.exports = function (param, callback) {
    proxy.Battle.getBattleByID(param.battle_id, function (err, doc) {
        if (err) {
            return callback(err);
        }
        if (!doc) {
            return callback(new Error('无效的battle_id！'));
        }
        var list = [];
        //分享所需的链接和文字
        let shareLink = 'http://callcall.soulkey99.com:8061/byInstall.html?appType=0&role=1&shareCode=gameShare';
        let shareText = '';
        for (var i = 0; i < doc.users.length; i++) {
            var obj = {userID: doc.users[i], point: 0, bonus: levelBonus(doc.level), intellectual: 0};
            for (var j = 0; j < doc.questions.length; j++) {
                for (var k = 0; k < doc.questions[j].users.length; k++) {
                    if (doc.users[i] == doc.questions[j].users[k].userID) {
                        obj.point += doc.questions[j].users[k].point;
                    }
                }
            }
            list.push(obj);
        }
        //计算奖励积分与脑力的值，copy自\common\proxy\game\battle.js setStatus方法
        var uObj = {};
        uObj[doc.users[0]] = 0;
        uObj[doc.users[1]] = 0;
        for (let i = 0; i < doc.questions.length; i++) {
            for (let j = 0; j < doc.questions[i].users.length; j++) {
                uObj[doc.questions[i].users[j].userID] += doc.questions[i].users[j].point;
            }
        }
        let winner = (uObj[doc.users[0]] > uObj[doc.users[1]] ? doc.users[0] : (uObj[doc.users[0]] < uObj[doc.users[1]] ? doc.users[1] : ""));
        //一局结束，计算游戏双方的各项参数情况
        if (winner) { //如果有人胜利
            //1.脑力
            let intellectual = 10;  //基础分10分
            let winIndex = [];
            for (let i = 0; i < doc.questions.length; i++) { //先计算最大 连胜
                for (let j = 0; j < doc.questions[i].users.length; j++) {
                    if (doc.questions[i].users[j].userID == winner) {
                        if (doc.questions[i].users[j].answer == doc.questions[i].users[j].choice) {
                            winIndex.push(1);
                        } else {
                            winIndex.push(0);
                        }
                    }
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
            intellectual += intellectual * (maxWin + 3) / 100;
            intellectual = Math.floor(intellectual);
            for (let i = 0; i < list.length; i++) {
                if (list[i].userID == winner) {
                    list[i].bonus = 2 * levelBonus(doc.level);
                    list[i].intellectual = intellectual;
                } else {
                    list[i].bonus = 0;
                }
            }
        }
        {
            let user = param.userID;
            let userPoint = 0;
            let opponent = '';
            let oppoPoint = 0;
            for (let i = 0; i < doc.users.length; i++) {
                if (doc.users[i] != user) {
                    opponent = doc.users[i];
                }
            }
            for (let i = 0; i < doc.questions.length; i++) {
                for (let j = 0; j < doc.questions[i].users.length; j++) {
                    if (user == doc.questions[i].users[j].userID) {
                        userPoint += doc.questions[i].users[j].point;
                    }
                    if (opponent == doc.questions[i].users[j].userID) {
                        oppoPoint += doc.questions[i].users[j].point;
                    }
                }
            }
            let fullPoint = 200 * doc.questions.length;
            if (userPoint > oppoPoint) {    //胜利
                shareText = '独孤求败，不服来赛，在线PK，挑战等你来！';
                shareLink = 'https://callcall.soulkey99.com:9061/ad/gameShare1.html';
            } else if (userPoint == oppoPoint) {    //平局
                shareText = '打个平手，怎能心甘？重头再来，一决成败！';
                shareLink = 'https://callcall.soulkey99.com:9061/ad/gameShare2.html';
            } else {    //失败
                shareText = '含恨败北，怎能心甘？重头再来，一觉成败！';
                shareLink = 'https://callcall.soulkey99.com:9061/ad/gameShare3.html';
            }
            // if (userPoint == fullPoint) {
            //     shareText = '智商爆表，快来见上帝！';
            // } else if (userPoint > fullPoint * 0.9) {
            //     if (userPoint > oppoPoint) {
            //         shareText = '目测智商140以上，请立即申请门萨会员！';
            //     } else {
            //         shareText = '天下武功唯快不破，下次再来过招！';
            //     }
            // } else if (userPoint > fullPoint * 0.8) {
            //     if (userPoint > oppoPoint) {
            //         shareText = '骚年，看你骨骼精奇，必是万中无一的奇才！';
            //     } else {
            //         shareText = '天下武功唯快不破，下次再来过招！';
            //     }
            // } else if (userPoint > fullPoint * 0.5) {
            //     if (userPoint > oppoPoint) {
            //         shareText = '胜得这么轻松，智商好才是真的好！';
            //     } else {
            //         shareText = '大意了，竟被对手钻了空子！';
            //     }
            // } else if (userPoint > fullPoint * 0.2) {
            //     if (userPoint > oppoPoint) {
            //         shareText = '这么难的题都赢了，信CallCall不挂科！';
            //     } else {
            //         shareText = '状态不好，待我补一颗天香断续膏！';
            //     }
            // } else if (userPoint > fullPoint * 0.8) {
            //     if (userPoint > oppoPoint) {
            //         shareText = '奇迹啊，要不要打120看看对手是不是晕了？';
            //     } else {
            //         shareText = '被盗号了，刚才玩的不是我！';
            //     }
            // }
        }
        callback(null, {status: doc.status, list: list, shareLink: shareLink, shareText: shareText});
    });
};


//计算关卡等级对应的需抵押学分
function levelBonus(level) {
    if (!level) {
        level = 1;
    }
    return floor((Math.pow((level - 1), 4) + 10) / 10 * ((level - 1) * 2 + 10) + 20, 20);
}

//FLOOR算法
function floor(num, sig) {
    if (!sig) {
        sig = 1;
    }
    return sig * Math.floor(num / sig);
}