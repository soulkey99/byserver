/**
 * Created by MengLei on 2015/2/7.
 */
"use strict";

//是否为生产环境，切记上线部署之前要修改
exports.production_mode = process.env.NODE_ENV == 'production' ? 'true' : 'false';

//流量暂停充值
exports.pause_flow = 'false';

//测试号码
exports.testPhones = [];

//答疑中心教师号码
exports.teacherPhones = [];

//每天答题达标数目
exports.standardCount = 10;

//数据库连接
const mongoUrl = process.env.NODE_ENV == 'production' ? '' : 'mongodb://127.0.0.1:27017/byserver';  //测试库

//各数据表用途：
//users：用户信息表，存储注册用户，包括学生和教师，以及公众号
//orders：订单信息表，保存学生所有提问信息
//shareCode：分享码
//advertise：广告
//push：临时保存每个订单推送给了哪些用户
//update：保存版本更新信息
//chargeOrders：第三方支付，充值虚拟货币订单
//admins：保存管理员用户信息
//goods：保存商城商品信息
//stocks：保存商品库存信息
//h5orders：商城订单信息（教师兑换商品的订单）
//money：第三方支付，充值虚拟货币订单
//webhooks：ping++支付所返回的webhooks记录，每一条都要记录下来
//promotion：邀请码推广记录
//pushTokens：umeng推送device_token
//feedbacks：用户意见反馈
//flowOrders：流量充值订单记录
//byConfig：一些可变的配置信息
//offlineTopics：保存自由答问题
//offlineTags：保存自由答的tags
//offlineAnswers：保存自由答回复消息
//offlineAnsReply：保存自由答的答案的回复消息
//topicCollect：用户收藏自由答问题
//answerCollect：用户收藏的自由答答案
//topicWatch：用户关注自由答问题
//offlineClick：记录自由答题目的分日点击数
//offlineReply：记录自由答题目的分日回复数
//offlineCollect：记录自由答题目的分日收藏数
//offlineWatch：记录自由答题目的分日关注数
//msgbox: 收件箱
//msgStatus: 收件箱消息状态记录
//orderOperate：即时订单的各种操作记录
//offlineOperate：保存用户在自由答部分所做的各种操作，为圈子做准备
//userConf：用户个性化配置信息，服务端配
//userFollowing：我关注的用户列表
//userFollowers：关注我的用户列表
//report：举报情况列表
//pubTopics：公众号发布的文章内容
//pubMsg：公众号发布的多条文章组合成一条消息
//pubChat：用户与公众号对话
//pubAutoReply：公众号自动回复配置
//fileLog：上传文件历史纪录，便于追溯哪些文件是哪些用户上传的

exports.mongoUrl = mongoUrl;
exports.db = require('mongojs')(mongoUrl, ['test', 'users', 'orders', 'shareCode', 'advertise', 'push', 'update', 'admins',
    'chargeOrders', 'goods', 'stocks', 'h5orders', 'money', 'bonus', 'bonusExchange', 'point', 'promotion', 'pushTokens',
    'feedbacks', 'flowOrders', 'msgbox', 'byConfig', 'dbLog', 'offlineOperate', 'offlineTopics', 'offlineTags', 'offlineAnswers',
    'offlineAnsReply', 'offlineReply', 'topicCollect', 'answerCollect', 'topicWatch', 'offlineClick', 'offlineReply', 'msgStatus',
    'offlineCollect', 'offlineWatch', 'msgbox', 'userConf', 'userFollowing', 'userFollowers', 'orderOperate', 'report', 'pubTopics',
    'pubMsg', 'webhooks', 'pubChat', 'pubAutoReply', 'fileLog', 'studyQuestions']);

//ssl证书配置
exports.ssl_opt = require('./utils/ssl');

//https端口与http端口相差数
exports.ssl_inc = 1000;

//admin服务器端口
exports.adminPort = 8060;


//http服务器端口(app server)
exports.httpPort = 8061;

//文件服务器端口
exports.fsIP = '127.0.0.1';
exports.fsPort = 8062;

//mqtt服务器配置
exports.mqttSettings = {
    port: 8065,
    backend: {
        type: 'mongo',
        url: mongoUrl,
        pubsubCollection: 'mqtt',
        mongo: {auto_reconnect: true}
    }
};

//乐免流量配置(userId， userName， password， passwordMD5)
//由于有的接口只需要MD5形式的密码，所以此处预先计算出来，之后再用的时候，就不需要每次都计算，提高系统性能
exports.lemianConfig = {
    userId: '',
    userName: '',
    password: '',
    passwordMD5: ''
};

//内部dnode接口配置
exports.dnodeConfig = {
    appServer: {host: '127.0.0.1', port: 5001},
    mqttServer: {host: '127.0.0.1', port: 5003},
    orderServer: {host: '127.0.0.1', port: 5004},
    flowServer: {host: '127.0.0.1', port: 5005},
    gameServer: {host: '127.0.0.1', port: 5006}
};

//内部zmq接口配置
exports.zmqConfig = {
    appServer: {host: '127.0.0.1', port: 6001},
    mqttServer: {host: '127.0.0.1', port: 6003},
    orderServer: {host: '127.0.0.1', port: 6004},
    flowServer: {host: '127.0.0.1', port: 6005},
    gameServer: {host: '127.0.0.1', port: 6006}
};


//h5服务器端口
exports.h5Port = 8067;

//Log记录级别
exports.logConfig = {
//        "[ALL]": "TRACE",
    "http": "TRACE",
    "order": "TRACE",
    "file": "TRACE",
    "mqtt": "TRACE",
    "h5": "TRACE",
    "socket": "TRACE",
    "console": "TRACE",
    "game": "TRACE",
    "umeng": "TRACE",
    "sms": "TRACE"
};

//短信验证码第三方接口配置参数
exports.smsConfig = {
    'X-AVOSCloud-Application-Id': '',
    'X-AVOSCloud-Application-Key': '',
    'Content-Type': 'application/json'
};

//获取短信验证码第三方接口配置参数
exports.reqSmsOpt = {
    host: 'leancloud.cn',
    path: '/1.1/requestSmsCode',
    method: 'POST',
    headers: require('./config').smsConfig
};

const redis = require("redis");
const client = redis.createClient(6379, '127.0.0.1');
client.on('ready', function () {
    //
});
exports.redis = client;

//校验短信验证码第三方接口配置参数
exports.verifySmsOpt = function (code, num) {
    return {
        host: 'leancloud.cn',
        path: '/1.1/verifySmsCode/' + code + '?mobilePhoneNumber=' + num,
        method: 'POST',
        headers: require('./config').smsConfig
    };
};

//阿里云oss配置
exports.aliyunOSSConfig = {
    key: '',
    secret: '',
    bucket: '',
    prefix: ''
};

//邮箱smtp配置
exports.smtp_auth = {user: '', pass: ''};

//随机数
exports.rack = require('hat').rack();

//pingxx支付key
exports.pingxxID_t = '';
exports.pingxxID_s = '';
exports.pingxxKey_test = '';
exports.pingxxKey_live = '';
exports.pingxx = {
    id_t: '',
    id_s: '',
    key: process.env.NODE_ENV == 'production' ? '' : ''
};

//BCloud支付key
exports.bcloud = {
    app_id: '',
    app_secret: '',
    master_secret: '',
    test_secret: ''
};

//umeng 推送key、secret
exports.umeng_and_key = '';
exports.umeng_and_secret = '';
exports.umeng_ios_key = '';
exports.umeng_ios_secret = '';

exports.umengConf = {
    and_key_t: '',  //安卓教师key
    and_secret_t: '',  //安卓教师secret
    and_key_s: '',  //安卓学生key
    and_secret_s: '',   //安卓学生secret
    ios_key_t: '',  //ios教师key
    ios_secret_t: '',  //ios教师secret
    ios_key_s: '',   //ios学生key
    ios_secret_s: ''   //ios学生secret
};


//log path
exports.logPath = '../public';
//root path
exports.rootPath = __dirname;

//配置填入邀请码后奖励虚拟币数量
exports.bonusMoney = 2000;

//配置订单推送时间(毫秒)
exports.pendingTime = 180000;

//配置订单推送时间间隔(毫秒)
exports.pendingInterval = 60000;

//答题倒计时提醒的时间与结束时间的间隔，目前是3分钟
exports.countdownTimer = 180000;

//第一次登录创建用户的时候，设置的初始化教师答题年纪科目信息
// exports.initTeacherGrades = [{"grade":"初中","subjects":[{"subject":"数学"},{"subject":"英语"},{"subject":"语文"}]},{"grade":"小学","subjects":[{"subject":"数学"},{"subject":"语文"},{"subject":"英语"}]},{"grade":"高中","subjects":[{"subject":"数学"},{"subject":"英语"},{"subject":"语文"}]}];
exports.initTeacherGrades = [];

//配置默认答题时间(此处配置为分钟，实际后台使用的时候转换成毫秒)
exports.duration = {
    "default": 10,
    "xiaoxue": {
        "shuxue": 10,
        "yuwen": 10,
        "yingyu": 10,
        "default": 10
    },
    "chuzhong": {
        "shuxue": 10,
        "yuwen": 10,
        "yingyu": 10,
        "wuli": 10,
        "huaxue": 10,
        "default": 10
    },
    "gaozhong": {
        "shuxue": 10,
        "yuwen": 10,
        "yingyu": 10,
        "wuli": 10,
        "huaxue": 10,
        "shengwu": 10,
        "lishi": 10,
        "dili": 10,
        "zhengzhi": 10,
        "default": 10
    }
};


