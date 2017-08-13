/**
 * Created by MengLei on 2015/6/4.
 */
"use strict";
var dnode = require("dnode");
var log = require('./../utils/log').order;
var serverConfig = require('./../config').dnodeConfig;

//需要暴露的方法列表
var server = dnode({
    //即时答部分
    genOrder: require('./genOrder'),
    grabOrder: require('./grabOrder'),
    cancelOrder: require('./cancelOrder'),
    addOrderPrice: require('./genOrder/addOrderPrice'),
    remarkOrder: require('./remarkOrder'),
    endOrder: require('./endOrder'),

    //即时答第二版api
    genOrder2: require('./instantOrder/genOrder'),  //下单
    grabOrder2: require('./instantOrder/grabOrder'),    //抢单
    cancelOrder2: require('./instantOrder/cancelOrder'),    //取消订单
    remarkOrder2: require('./instantOrder/remarkOrder'),    //评价订单
    endOrder2: require('./instantOrder/endOrder'),          //结束订单
    addOrderTime: require('./instantOrder/addOrderTime'),   //订单延时
    getPerformance: require('./instantOrder/getPerformance'),   //获取订单绩效
    startCharge: require('./instantOrder/startCharge'),     //付费订单开始计费
    transferOrderType: require('./instantOrder/transerOrderType'),  //付费免费订单互转

    //离线问答部分
    transferFromOrder: require('./offlineAnswer/transferFromOrder'),    //即时订单转自由答
    reply: require('./offlineAnswer/reply'),        //回复离线问题
    replyReply: require('./offlineAnswer/replyReply'),      //对离线问题回复的回复
    rate: require('./offlineAnswer/rate'),      //支持、反对离线问题的回复
    getOfflineTopicList: require('./offlineAnswer/getOfflineTopicList'),    //获取离线问题list
    getOfflineTopicDetail: require('./offlineAnswer/getOfflineTopicDetail'),    //获取离线问题详情
    getOfflineAnswerList: require('./offlineAnswer/getOfflineAnswerList'),      //获取离线问题的回答list
    getOfflineAnswerDetail: require('./offlineAnswer/getOfflineAnswerDetail'),  //获取离线问题回答详情
    getOfflineReplyList: require('./offlineAnswer/getOfflineReplyList'),        //获取离线问题的回答的回复list
    judgeAnswer: require('./offlineAnswer/judgeAnswer'),        //选出最佳答案
    genOfflineTopic: require('./offlineAnswer/genOfflineTopic'),        //直接生成离线问答题
    getMyCollect: require('./offlineAnswer/getMyCollect'),     //获取我收藏的收藏离线问答
    collectTopic: require('./offlineAnswer/collectTopic'),     //收藏离线问答
    collectAnswer: require('./offlineAnswer/collectAnswer'),     //收藏离线问答的答案
    getMyWatch: require('./offlineAnswer/getMyWatch'),     //获取我关注的离线问答
    watchTopic: require('./offlineAnswer/watchTopic'),     //关注离线问答
    watchAnswer: require('./offlineAnswer/watchAnswer'),     //关注离线问答的答案
    getMyOrder: require('./offlineAnswer/getMyOrder'),       //获取我提出、回答过的离线问题
    getMyAnswer: require('./offlineAnswer/getMyAnswer'),     //获取我的回答过的答案
    getOfflineTags: require('./offlineAnswer/getOfflineTags'),   //获取热门tags

    //社交相关
    getMyCircle: require('./offlineAnswer/social/getMyCircle'), //获取我的圈子列表
    getUserSocialInfo: require('./offlineAnswer/social/getUserSocialInfo'), //用户信息，圈子方面
    getUserSocialList: require('./offlineAnswer/social/getUserSocialList'), //获取用户的关注、被关注列表
    followUser: require('./offlineAnswer/social/followUser'),    //关注、取消关注用户
    getMsgBox: require('./offlineAnswer/social/getMsgBox'),  //获取收件箱消息

    //公众号相关
    pubChatHistory: require('./pubService/chatHistory'),    //公众号聊天历史
    pubInput: require('./pubService/input'),    //公众号输入
    getPubMenu: require('./pubService/getPubMenu'),     //获取公众号菜单配置
    getPubHistory: require('./pubService/getPubHistory')  //获取公众号的历史消息

});

//启动维护任务
require('./task');
//引入预定义资源
require('../utils/predefine');

require('./zmqServer');


server.listen(serverConfig.orderServer.port);
log.fatal('orderServer dnode service listening at: ' + serverConfig.orderServer.port);
console.log('orderServer dnode service listening at: ' + serverConfig.orderServer.port);
