/**
 * Created by MengLei on 2016/3/28.
 */
"use strict";
const proxy = require('../../../common/proxy');
const eventproxy = require('eventproxy');
const db = require('../../../config').db;
const result = require('../../utils/result');

module.exports = function (req, res) {
    let param = {
        userID: req.body.userID,
        type: req.body.type,
        operID: req.body.operID
    };
    if (req.body.param) {
        try {
            param.param = JSON.parse(req.body.param);
        } catch (ex) {
            return result(res, {statusCode: 905, message: 'param json格式解析错误！'});
        }
    }
    proxy.Share.addOneShare(param, (err, doc) => {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        //目前share仅针对游戏部分，所以暂时先这么写
        if (req.body.type = 'gameBattle') {
            let ep = new eventproxy();
            ep.all('linkParam', 'text', (linkParam, text) => {
                result(res, {
                    statusCode: 900,
                    link: 'http://callcall.soulkey99.com:8061/byInstall.html?appType=0&role=1&shareCode=' + linkParam,
                    text: text,
                    avatar: ''
                });
            });
            ep.fail((err)=> {
                return result(res, {statusCode: 905, message: err.message});
            });
            db.shareCode.findOne({userID: req.body.userID}, ep.done('linkParam', (doc) => {
                if (doc) {
                    return doc.shareCode;
                }
                return 'gameShare';
            }));
            proxy.Battle.getBattleByID(req.body.operID, ep.done('text', (doc)=> {
                if (!doc) {
                    return null;
                }
                let user = req.body.userID;
                let userPoint = 0;
                let opponent = '';
                let oppoPoint = 0;
                let text = '';
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
                if (userPoint == fullPoint) {
                    text = '智商爆表，快来见上帝！';
                } else if (userPoint > fullPoint * 0.9) {
                    if (userPoint > oppoPoint) {
                        text = '目测智商140以上，请立即申请门萨会员！';
                    } else {
                        text = '天下武功唯快不破，下次再来过招！';
                    }
                } else if (userPoint > fullPoint * 0.8) {
                    if (userPoint > oppoPoint) {
                        text = '骚年，看你骨骼精奇，必是万中无一的奇才！';
                    } else {
                        text = '天下武功唯快不破，下次再来过招！';
                    }
                } else if (userPoint > fullPoint * 0.5) {
                    if (userPoint > oppoPoint) {
                        text = '胜得这么轻松，智商好才是真的好！';
                    } else {
                        text = '大意了，竟被对手钻了空子！';
                    }
                } else if (userPoint > fullPoint * 0.2) {
                    if (userPoint > oppoPoint) {
                        text = '这么难的题都赢了，信CallCall不挂科！';
                    } else {
                        text = '状态不好，待我补一颗天香断续膏！';
                    }
                } else if (userPoint > fullPoint * 0.8) {
                    if (userPoint > oppoPoint) {
                        text = '奇迹啊，要不要打120看看对手是不是晕了？';
                    } else {
                        text = '被盗号了，刚才玩的不是我！';
                    }
                }
                return text;
            }));
            proxy.Battle.getBattleByQuery({users: req.body.userID}, {
                limit: 12,
                sort: '-createTime'
            }, ep.done('continueWin', (doc)=> {
                if (doc && doc[i].winner != req.body.userID) {
                    return '';
                }
                if (doc.length <= 1) {
                    return '';
                }
                for (let i = 1; i < doc.length; i++) {
                    if (doc[i].winner != req.body.userID) {
                        if (i >= 10) {
                            return '拔剑四顾，问天下竟无对手！';
                        } else if (i >= 3) {
                            return '我已连挑敌方三员大将，不服来战！';
                        }
                    }
                }
                return '拔剑四顾，问天下竟无对手！';
            }));
        }
        // return result(res, {statusCode: 900, shareId: doc.shareId});
    });
};
