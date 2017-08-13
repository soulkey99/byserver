/**
 * Created by zhengyi on 15/2/19.
 */
"use strict";
const log = require('../../utils/log').http;
const result = require('../utils/result');
const config = require('../../config');

/* GET home page. */
module.exports = function (req, res) {
    if (req.method.toLowerCase() == 'get') {
        result(res, {message: ''});
        return;
    }
    if (req.headers.platform) {
        if (req.headers.channel) {
            log.debug('api router begin: ' + req.method + ' ' + req.originalUrl + ' ' + ', platform=' + req.headers.platform.toLowerCase() + ', client=' + req.headers.client + ', channel=' + req.headers.channel);
        } else {
            log.debug('api router begin: ' + req.method + ' ' + req.originalUrl + ' ' + ', platform=' + req.headers.platform.toLowerCase() + ', client=' + req.headers.client);
        }
    } else {
        log.debug('api router begin: ' + req.method + ' ' + req.originalUrl);
    }
    log.debug('body: ' + JSON.stringify(req.body));

    var method = req.query.m;
    if (!method) {
        log.error('method parameter is empty');
        result(res, {statusCode: 905, message: 'method parameter is empty.'});
        return;
    }
    switch (method) {
        case 'getSMSCode'://获取验证码(不需要userID/authSign)
            var sms = require('./user/getSMSCode');
            sms(req, res);
            break;
        case 'login'://登陆(不需要userID/authSign)
            var login = require('./user/login');
            login(req, res);
            break;
        case 'autoLogin'://自动登陆
            var autoLogin = require('./user/autologin');
            autoLogin(req, res);
            break;
        case 'changeUserInfo'://修改用户信息
            var changeUserInfo = require('./user/changeUserInfo');
            changeUserInfo(req, res);
            break;
        case 'changeSeniorInfo':    //修改付费教师信息
            require('./user/changeSeniorInfo')(req, res);
            break;
        case 'getSeniorTeacherList': //获取付费教师列表
            require('./user/getSeniorTeachers')(req, res);
            break;
        case 'getSeniorRemarks':    //获取付费教师的付费订单的评价
            require('./order/getSeniorRemarks')(req, res);
            break;
        case 'getUserInfo': //获取用户信息
            require('./user/getUserInfo')(req, res);
            break;
        case 'searchUser':  //搜索用户
            require('./user/searchUser')(req, res);
            break;
        case 'logout'://登出
            var logout = require('./user/logout');
            logout(req, res);
            break;
        case 'getOrdList'://获取订单列表
            var getOrdList = require('./homePage/getOrdList');
            getOrdList(req, res);
            break;
        case 'getPendingList'://客户端主动拉取推送中的订单
            require('./homePage/getPendingList')(req, res);
            break;
        case 'getOrderDetail'://根据订单ID获取订单详情
            require('./homePage/getOrderDetail')(req, res);
            break;
        case 'getOrderStatus': //根据订单id获取订单状态
            require('./homePage/getOrderStatus')(req, res);
            break;
        case 'switchTeacherStatus'://修改教师在线状态
            var switchTeacherStatus = require('./homePage/switchTeacherStatus');
            switchTeacherStatus(req, res);
            break;
        case 'getTeacherList'://获取教师列表
            var getTeacherList = require('./other/getTeacherList');
            getTeacherList(req, res);
            break;
        case 'switchWatchTeacher'://修改关注教师列表
            var switchWatchTeacher = require('./other/switchWatchTeacher');
            switchWatchTeacher(req, res);
            break;
        case 'getWatchedTeachers'://获取已关注教师
            var getWatchedTeachers = require('./other/getWatchedTeachers');
            getWatchedTeachers(req, res);
            break;
        case 'changeTeacherInfo':  //教师端，修改教师认证信息
            require('./user/changeVerifyInfo')(req, res);
            break;
        case 'getSubjectList':  //获取可用科目配置信息列表
            require('./other/getSubjectList')(req, res);
            break;
        case 'checkBind':   //检查信息是否可以绑定
            require('./user/checkBind')(req, res);
            break;
        case 'bindSSO':  //绑定SSO第三方账号
            require('./user/bindSSO')(req, res);
            break;
        case 'ssoLogin':  //第三方登录登录
            require('./user/ssoLogin')(req, res);
            break;
        case 'bindMobile': //第三方账号登陆的用户绑定手机号
            require('./user/bindMobile')(req, res);
            break;
        case 'getSSOInfo': //获取绑定的第三方账户信息
            require('./user/getSSOInfo')(req, res);
            break;
        case 'getBonusList'://获取积分列表
            require('./bonus/getBonusList')(req, res);
            break;
        case 'getBonusDetail': //获取积分详情
            require('./bonus/getBonusDetail')(req, res);
            break;
        case 'getBonus': //获取用户积分值
            require('./bonus/getBonus')(req, res);
            break;
        case 'genShareCode'://生成分享码
            var genSharedCode = require('./other/genSharedCode');
            genSharedCode(req, res);
            break;
        case 'getShareCode': //用户获取自己的邀请码
            require('./other/getShareCode')(req, res);
            break;
        case 'getShareCodeQR': //用户获取邀请码链接对应二维码
            require('./other/getShareCodeQR')(req, res);
            break;
        case 'getShareCodeConfig':  //推广页获取邀请码配置信息
            require('./other/getShareCodeConfig')(req, res);
            break;
        case 'share':   //分享
            require('./other/share')(req, res);
            break;
        case 'invite': //邀请用户时输入邀请码
            require('./other/inputShareCode')(req, res);
            break;
        case 'inputShareCode': //用户在个人信息页面时输入邀请码
            require('./user/inputShareCode')(req, res);
            break;
        case 'getMoney': //获取账户余额
            require('./user/getMoney')(req, res);
            break;
        case 'getMoneyOrderList': //获取账户资金交易列表
            require('./pay/getMoneyOrderList')(req, res);
            break;
        case 'getMoneyOrderDetail': //获取账户交易明细
            require('./pay/getMoneyOrderDetail')(req, res);
            break;
        case 'getChargeObject':     //客户端获取charge对象
            require('./pay/getChargeObject')(req, res);
            break;
        case 'setWithdrawInfo':     //设置提现信息
            require('./pay/setWithdrawInfo')(req, res);
            break;
        case 'getWithdrawInfo':     //获取提现信息
            require('./pay/getWithdrawInfo')(req, res);
            break;
        case 'withdraw':            //提现
            require('./pay/withdraw')(req, res);
            break;
        case 'charge': //学生端充值
            require('./pay/charge')(req, res);
            break;
        case 'gameBuy': //用户购买游戏道具
            require('./pay/gameBuy')(req, res);
            break;
        case 'chargeNotify': //充值回调
            require('./pay/chargeNotify')(req, res);
            break;
        case 'rewardTeacher':   //打赏教师
            require('./pay/rewardTeacher')(req, res);
            break;
        case 'getRewardConfig': //获取打赏教师配置
            require('./pay/getRewardConfig')(req, res);
            break;
        case 'setPayStatus':    //客户端支付成功通知服务端
            require('./pay/setPayStatus')(req, res);
            break;
        case 'getADList'://获取广告列表
            require('./other/getADList')(req, res);
            break;
        case 'getActivityList': //获取活动列表
            require('./other/getActivity')(req, res);
            break;
        case 'getSystemRecentQuestion': //获取系统最近题目
            require('./homePage/getSystemRecentQuestion')(req, res);
            break;
        case 'getRecentQuestionNum':    //获取系统最近题目数量
            require('./homePage/GetRecentQNum')(req, res);
            break;
        case 'reportToken': //上报设备的推送token
            require('./user/reportToken')(req, res);
            break;
        case 'genOrder'://下单（学生提问）
            require('./order/genOrder')(req, res);
            break;
        case 'startCharge': //付费订单开始计费
            require('./order/startCharge')(req, res);
            break;
        case 'transferOrderType':   //转换订单收费、免费类型
            require('./order/transferOrderType')(req, res);
            break;
        case 'addOrderPrice'://订单追加小费
            require('./order/addOrderPrice')(req, res);
            break;
        case 'cancelOrder'://取消订单（学生）
            require('./order/cancelOrder')(req, res);
            break;
        case 'grabOrder'://抢单（教师）
            require('./order/grabOrder')(req, res);
            break;
        case 'remarkOrder'://评价订单（学生）
            require('./order/remarkOrder')(req, res);
            break;
        case 'endOrder'://结束订单
            require('./order/endOrder')(req, res);
            break;
        case 'getOrderPerformance': //获取订单绩效
            require('./order/getPerformance')(req, res);
            break;
        case 'addOrderTime': //订单增加答题时间（仅学生）
            require('./order/addOrderTime')(req, res);
            break;
        case 'getUnreadMsg'://获取订单未读消息列表
            require('./order/getUnreadMsg')(req, res);
            break;
        case 'checkUpdate': //检测更新
            require('./other/checkUpdate')(req, res);
            break;
        case 'getFeedbackList':    //获取意见反馈列表
            require('./other/getFeedbacks')(req, res);
            break;
        case 'sendFeedback': //发送意见反馈
            require('./other/sendFeedback')(req, res);
            break;
        case 'getOnlineTeacherNum'://获取在线教师数目
            require('./other/getOnlineTeacherNum')(req, res);
            break;
        case 'getPerformance'://获取自己的绩效信息
            require('./user/getPerformance')(req, res);
            break;
        case 'report':  //举报接口
            require('./other/report')(req, res);
            break;
        case 'getReportList':
            require('./other/getReportList')(req, res);
            break;
        case 'pendingAvatar':
            require('./order/pendingAvatar')(req, res);
            break;

        //离线问答
        case 'transferFromOrder':   //在线即时问答转为离线问答
            // require('./offlineOrder/transferFromOrder')(req, res);
            require('./order/transferOffline')(req, res);
            break;
        case 'replyOffline':    //回复离线问答
            require('./offlineOrder/reply')(req, res);
            break;
        case 'rateOffline':     //离线问答点赞
            require('./offlineOrder/rate')(req, res);
            break;
        case 'collectOffline':     //离线问答收藏
            require('./offlineOrder/collect')(req, res);
            break;
        case 'watchOffline':     //离线问答关注
            require('./offlineOrder/watch')(req, res);
            break;
        case 'getMyCollect':     //获取我的离线问答收藏列表
            require('./offlineOrder/getMyCollect')(req, res);
            break;
        case 'getMyWatch':     //获取我的离线问答关注列表
            require('./offlineOrder/getMyWatch')(req, res);
            break;
        case 'getMyOfflineTopics':  //获取我提出的离线问题列表
            require('./offlineOrder/getMyOrder')(req, res);
            break;
        case 'getMyOfflineAnswers':  //获取我回答过的离线问题列表
            require('./offlineOrder/getMyAnswer')(req, res);
            break;
        case 'getOfflineTopicList': //获取离线问答列表
            require('./offlineOrder/getOfflineTopicList')(req, res);
            break;
        case 'getOfflineTopicDetail':   //获取离线问答详情
            require('./offlineOrder/getOfflineTopicDetail')(req, res);
            break;
        case 'getOfflineContentList':   //获取离线问答详情列表
            require('./offlineOrder/getOfflineContentList')(req, res);
            break;
        case 'getOfflineAnswerDetail':   //获取离线问答详情列表
            require('./offlineOrder/getOfflineAnswerDetail')(req, res);
            break;
        case 'judgeOfflineAnswer':  //选取最佳答案
            require('./offlineOrder/judgeAnswer')(req, res);
            break;
        case 'genOfflineTopic':     //直接生成离线问答
            require('./offlineOrder/genOfflineTopic')(req, res);
            break;
        case 'getOfflineTags':      //获取热门tags
            require('./offlineOrder/getOfflineTags')(req, res);
            break;

        //社交化部分
        case 'followUser':      //关注、取消关注用户
            require('./offlineOrder/social/followUser')(req, res);
            break;
        case 'getUserSocialInfo':   //获取用户信息，社交方面
            require('./offlineOrder/social/getUserSocialInfo')(req, res);
            break;
        case 'getUserSocialList':     //获取关注、被关注的用户
            require('./offlineOrder/social/getUserSocialList')(req, res);
            break;
        case 'getMyCircle':     //获取我的圈子列表
            require('./offlineOrder/social/getMyCircle')(req, res);
            break;
        case 'getMsgList':  //获取收件箱
            require('./msgbox/getMyMsg')(req, res);
            break;
        case 'readMsg':     //将未读消息标记为已读
            require('./msgbox/readMsg')(req, res);
            break;
        case 'getConfig':
            require('./homePage/getConfig')(req, res);
            break;


        //公众号部分
        case 'getPubHistory':   //获取公众号历史消息
            require('./pub/getPubHistory')(req, res);
            break;
        case 'pubInput':    //公众号输入
            require('./pub/pubInput')(req, res);
            break;
        case 'getPubChatHistory':   //公众号聊天历史
            require('./pub/chatHistory')(req, res);
            break;
        case 'getPubMenu':  //获取公众号菜单项配置
            require('./pub/getMenu')(req, res);
            break;


        case 'kill'://账号自杀，仅测试环境启用，正式环境会落入default分支
            if (config.production_mode == 'false') {
                require('./user/kill')(req, res);
                break;
            }
        default:
            result(res, {statusCode: 905, message: 'api method 名不存在！'});
            break;
    }
};

