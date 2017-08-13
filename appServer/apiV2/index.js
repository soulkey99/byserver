/**
 * Created by MengLei on 2015/7/27.
 */

var log = require('../../utils/log').http;
var result = require('../utils/result');


module.exports = function (req, res) {
    if (req.headers.platform) {
        if (req.headers.channel) {
            log.debug('apiV2 router begin: ' + req.method + ' ' + req.originalUrl + ' ' + ', platform=' + req.headers.platform.toLowerCase() + ', client=' + req.headers.client + ', channel=' + req.headers.channel);
        } else {
            log.debug('apiV2 router begin: ' + req.method + ' ' + req.originalUrl + ' ' + ', platform=' + req.headers.platform.toLowerCase() + ', client=' + req.headers.client);
        }
    } else {
        log.debug('apiV2 router begin: ' + req.method + ' ' + req.originalUrl);
    }
    log.debug('body: ' + JSON.stringify(req.body));

    var method = req.query.m;
    if (!method) {
        log.error('method parameter is empty');
        result(res, {statusCode: 905, message: 'method parameter is empty.'});
        return;
    }

    switch (method) {
        case 'getSMSCode':  //获取短信验证码
            require('./user/getSMSCode')(req, res);
            break;
        case 'register':    //用户注册
            require('./user/register')(req, res);
            break;
        case 'login':   //用户登录
            require('./user/login')(req, res);
            break;
        case 'setPasswd':   //设置密码
            require('./user/setPasswd')(req, res);
            break;
        case 'resetPwd':    //重置密码
            require('./user/resetPwd')(req, res);
            break;
        case 'changePwd':   //修改密码
            require('./user/changePwd')(req, res);
            break;
        case 'getSubjectList':  //获取科目配置信息V2
            require('./other/getSubjectList')(req, res);
            break;
        case 'getCheckinStatus':    //获取签到状态
            require('./user/getCheckinStatus')(req, res);
            break;
        case 'checkin':     //用户签到
            require('./user/checkin')(req, res);
            break;
        case 'getBetaConfig':   //获取内测配置信息
            require('./user/getBetaConfig')(req, res);
            break;
        case 'getFastReplyList':    //获取快速回复列表
            require('./user/getFastReply')(req, res);
            break;
        case 'editFastReply':   //编辑快速回复
            require('./user/editFastReply')(req, res);
            break;
        case 'removeFastReply': //删除快速回复
            require('./user/removeFastReply')(req, res);
            break;
        case 'getSeniorUpgradeStatus':  //获取待升级科目
            require('./user/getSeniorStatus')(req, res);
            break;
        case 'getMyInfo':       //获取“我的”页面的各种信息参数
            require('./user/getMyInfo')(req, res);
            break;

        //安全部分
        case 'setPayPasswd':    //设置支付密码
            require('./secure/setPayPasswd')(req, res);
            break;
        case 'setSecureQuestion':       //设置密保问题
            require('./secure/setSecureQuestions')(req, res);
            break;
        case 'existsSecure':        //检查是否设置过支付密码和密保问题
            require('./secure/checkExists')(req, res);
            break;

        //学习部分
        case 'cancelStudyExercise': //取消一个答题练习
            require('./study/cancel')(req, res);
            break;
        case 'studyCheck':      //回答问题
            require('./study/check')(req, res);
            break;
        case 'genExercise':     //创建一个练习
            require('./study/genExercise')(req, res);
            break;
        case 'getStudyCatalog':     //获取教材目录
            require('./study/getCatalog')(req, res);
            break;
        case 'getStudyExerciseDetail':  //获取练习详情
            require('./study/getExerciseDetail')(req, res);
            break;
        case 'getExerciseList':     //获取练习列表
            require('./study/getExerciseList')(req, res);
            break;
        case 'getExerciseReview':     //获取练习回顾（题干和错题的remark）
            require('./study/getExerciseReview')(req, res);
            break;
        case 'getStudyQuestion':    //获取问题详情
            require('./study/getQuestion')(req, res);
            break;
        case 'getStudyQuestionExtra':   //获取问题附加信息
            require('./study/getQuestionExtra')(req, res);
            break;
        case 'getExerciseResult':   //获取练习结果
            require('./study/getResult')(req, res);
            break;
        case 'getStudySectionQuestions':    //获取节下问题列表
            require('./study/getSectionQuestion')(req, res);
            break;
        case 'getStudyGradeSubject':    //获取学段年级科目配置
            require('./study/getSGSList')(req, res);
            break;
        case 'getStudyVersionList': //获取教材版本列表
            require('./study/getVersionList')(req, res);
            break;
        case 'getPendingExercise':  //检查是否有未完成的练习
            require('./study/getPendingExercise')(req, res);
            break;

        //游戏部分
        case 'getBattleQuestions':  //获取对战游戏问题列表
            require('./game/getQuestions')(req, res);
            break;
        case 'check':   //回答问题
            require('./game/check')(req, res);
            break;
        case 'getBattleResult': //获取游戏结果
            require('./game/getResult')(req, res);
            break;
        case 'getGameRecord':   //获取游戏战绩
            require('./game/record')(req, res);
            break;
        case 'getStrength': //获取体力
            require('./game/getStrength')(req, res);
            break;
        case 'getGameRank': //获取排行榜
            require('./game/getRank')(req, res);
            break;
        case 'getGameLevels':   //获取关卡
            require('./game/getLevels')(req, res);
            break;
        case 'getMissionList':  //获取任务列表
            require('./game/getMissionList')(req, res);
            break;
        case 'getMissionAward': //获取任务奖励
            require('./game/getMissionAward')(req, res);
            break;

        default:
            result(res, {statusCode: 905, message: 'api method 名不存在！'});
            break;
    }
};
