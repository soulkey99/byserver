/**
 * Created by MengLei on 2015/4/20.
 */

var log = require('../../utils/log').h5;
var result = require('../utils/result');

module.exports = function (req, res) {
    log.trace('api route for h5 server begin');

    var method = req.query.m;
    log.debug('api method: ' + method + ', body: ' + JSON.stringify(req.body));

    if (!method) {
        log.error('h5 server api error: method parameter is empty');
        result(res, {statusCode: 905, message: 'method null'});
        return;
    }
    switch (method) {
        //商城api
        case 'getGoodList':  //获取商品列表
            require('./getGoodList')(req, res);
            break;
        case 'getGoodDetail':   //获取商品详情
            require('./getGoodDetail')(req, res);
            break;
        case 'getBonus':    //获取积分余额
            require('./getBonus')(req, res);
            break;
        case 'getUserInfo': //获取用户基本信息
            require('./getUserInfo')(req, res);
            break;
        case 'getBonusList':    //获取积分收支列表
            require('./getBonusList')(req, res);
            break;
        case 'getUserPhone':    //获取用户手机号（兑换流量用到）
            require('./getUserPhone')(req, res);
            break;
        case 'exchangeBonus':   //执行积分兑换操作
            require('./exchangeBonus')(req, res);
            break;
        case 'getExchangeList': //获取积分兑换列表（仅支出）
            require('./getExchangeList')(req, res);
            break;
        case 'getExchangeDetail':   //获取兑换详情
            require('./getExchangeDetail')(req, res);
            break;
        case 'getHomeBanner': //获取商城首页
            require('./getHomeBanner')(req, res);
            break;
        case 'editDeliver': //编辑物流信息
            require('./editDeliver')(req, res);
            break;


        //后台api
        case 'adminLogin':  //后台管理登录
            require('./admin/login')(req, res);
            break;
        case 'adminChangePwd':  //修改密码
            require('./admin/changePwd')(req, res);
            break;
        case 'adminSendSMS': //发送短信
            require('./admin/user/sendSMS')(req, res);
            break;

        case 'adminGetAntiCheatConfig':
            require('./admin/admin/getAntiCheatConfig')(req, res);
            break;
        case 'adminSetAntiCheatConfig':
            require('./admin/admin/setAntiCheatConfig')(req, res);
            break;
        case 'adminGetBonusConfig':
            require('./admin/admin/getBonusConfig')(req, res);
            break;
        case 'adminSetBonusConfig':
            require('./admin/admin/setBonusConfig')(req, res);
            break;
        case 'adminGetAdminList':
            require('./admin/admin/getAdminList')(req, res);
            break;
        case 'adminEditAdmin':
            require('./admin/admin/editAdmin')(req, res);
            break;
        case 'adminCheckUserName':
            require('./admin/admin/checkUserName')(req, res);
            break;
        case 'adminGetADList':
            require('./admin/admin/getADList')(req, res);
            break;
        case 'adminEditAD':
            require('./admin/admin/editAD')(req, res);
            break;


        //运营后台（用户管理）
        case 'adminGetUserInfo':    //获取用户信息
            require('./admin/user/getUserInfo')(req, res);
            break;
        case 'adminSetBonus':   //扣减积分
            require('./admin/user/setBonus')(req, res);
            break;
        case 'adminAddBlacklist': //加入黑名单
            require('./admin/user/addBlacklist')(req, res);
            break;
        case 'adminGetBlacklist': //获取黑名单列表
            require('./admin/user/getBlacklist')(req, res);
            break;
        case 'adminGetFeedbackList':    //获取用户反馈列表
            require('./admin/user/getFeedbacks')(req, res);
            break;
        case 'adminReplyFeedback':  //管理员回复用户
            require('./admin/user/replyFeedback')(req, res);
            break;
        case 'adminGetReportList': //获取用户举报列表
            require('./admin/user/getReports')(req, res);
            break;
        case 'adminGetUserLog':    //获取用户log
            require('./admin/user/userLog')(req, res);
            break;
        case 'adminGetMsgList': //获取用户消息列表
            require('./admin/user/getMsgList')(req, res);
            break;
        case 'adminEditMsg':    //编辑、新建用户消息
            require('./admin/user/editMsg')(req, res);
            break;
        case 'adminGetMoneyList':   //获取交易信息
            require('./admin/pay/getList')(req, res);
            break;
        case 'adminGetUserSecureQuestions': //获取用户密保问题
            require('./admin/pay/getSecure')(req, res);
            break;
        case 'adminClearUserSecureQuestions': //清空用户密保问题
            require('./admin/pay/clearSecureQuestions')(req, res);
            break;
        case 'adminClearUserPayPasswd':     //清空用户支付密码
            require('./admin/pay/clearPayPasswd')(req, res);
            break;
        case 'adminGetUserWithdrawInfo':        //获取用户提现信息
            require('./admin/pay/getWithdrawInfo')(req, res);
            break;
        case 'adminClearUserWithdrawInfo':      //清空用户提现信息
            require('./admin/pay/clearWithdrawInfo')(req, res);
            break;
        case 'adminSetPayStatus':       //管理员设置支付状态
            require('./admin/pay/setPayStatus')(req, res);
            break;
        case 'adminGetBetalist':        //获取用户beta测试信息列表
            require('./admin/user/getBetalist')(req, res);
            break;
        case 'adminEditBeta':       //管理员为用户添加、修改、删除beta测试信息
            require('./admin/user/editBeta')(req, res);
            break;


        //运营后台(答疑中心)
        case 'adminQACenterTeacherList':    //列出所有教师
            require('./admin/QACenter/teacherList')(req, res);
            break;
        case 'adminQACenterModifyTeacher':  //修改教师信息
            require('./admin/QACenter/modifyTeacher')(req, res);
            break;
        case 'adminQAList': //根据教师或学生手机号返回订单列表
            require('./admin/QACenter/qaList')(req, res);
            break;
        case 'adminQADailyStat':  //指定教师指定时间段内分日答题数据
            require('./admin/QACenter/dailyStat')(req, res);
            break;
        case 'adminQAStat': //综合答题数据
            require('./admin/QACenter/qaStat')(req, res);
            break;
        case 'adminQATeacherStat':    //所有教师答题数据
            require('./admin/QACenter/teacherStat')(req, res);
            break;
        case 'adminQAOrderDetail':  //订单详情
            require('./admin/QACenter/orderDetail')(req, res);
            break;
        case 'adminQAStatDetail':    //分时段查询数据详情
            require('./admin/QACenter/qaStatDetail')(req, res);
            break;

        //运营后台(教师)管理api
        case 'adminGetTeacherListToVerify':     //获取待认证教师列表
            require('./admin/teacher/getListToVerify')(req, res);
            break;
        case 'adminVerifyTeacher':      //教师认证
            require('./admin/teacher/verify')(req, res);
            break;
        case 'adminModifyTeacher':  //管理员编辑教师认证信息
            require('./admin/teacher/modifyTeacher')(req, res);
            break;

        //运营后台(推广)管理api
        case 'adminGetPromoters':   //获取推广人员列表
            require('./admin/promotion/getPromoters')(req, res);
            break;
        case 'adminSetPromoter':    //设置、取消推广员身份
            require('./admin/promotion/setPromoter')(req, res);
            break;
        case 'adminGetPromoterDetail':  //获取推广详情
            require('./admin/promotion/getPromoterDetail')(req, res);
            break;

        //运营后台(广场、圈子)
        case 'adminGetOfflineTopics':   //获取帖子列表
            require('./admin/offlineOrders/getTopicList')(req, res);
            break;
        case 'adminDeleteTopic':    //删帖
            require('./admin/offlineOrders/deleteTopic')(req, res);
            break;
        case 'adminGetTopicDetail':  //获取帖子详情
            require('./admin/offlineOrders/getTopicDetail')(req, res);
            break;
        case 'adminModifyTopic':    //修改离线问题
            require('./admin/offlineOrders/modifyTopic')(req, res);
            break;
        case 'adminGetAnswers':     //获取离线答案列表
            require('./admin/offlineOrders/getAnswerList')(req, res);
            break;
        case 'adminGetAnswerDetail':    //获取答案详情
            require('./admin/offlineOrders/getAnswerDetail')(req, res);
            break;
        case 'adminModifyAnswer':   //修改离线答案
            require('./admin/offlineOrders/modifyAnswer')(req, res);
            break;
        case 'adminGetReplies':     //获取回复列表
            require('./admin/offlineOrders/getReplyList')(req, res);
            break;
        case 'adminModifyReply':    //编辑离线答案的回复
            require('./admin/offlineOrders/modifyReply')(req, res);
            break;

        //运营后台(商城)管理api
        case 'adminGoodList':   //获取商品列表
            require('./admin/shop/goodList')(req, res);
            break;
        case 'adminGoodDetail':     //获取商品详情
            require('./admin/shop/goodDetail')(req, res);
            break;
        case 'adminEditDetail': //新增、编辑商品详情
            require('./admin/shop/editDetail')(req, res);
            break;
        case 'adminGetShopList':    //获取商家列表
            require('./admin/shop/getShopList')(req, res);
            break;
        case 'adminEditShop':   //新增、编辑商家信息
            require('./admin/shop/editShop')(req, res);
            break;
        case 'adminShopExchangeList':   //获取兑换列表
            require('./admin/shop/shopExchangeList')(req, res);
            break;
        case 'adminDeleteShop': //删除商家
            require('./admin/shop/deleteShop')(req, res);
            break;
        case 'adminGetBanners': //获取商城banner列表
            require('./admin/shop/getBanner')(req, res);
            break;
        case 'adminEditBanners':    //编辑商城banner列表
            require('./admin/shop/editBanner')(req, res);
            break;
        case 'adminGetOwnerName':   //通过ownerid获取ownerName
            require('./admin/shop/getOwnerName')(req, res);
            break;
        case 'adminEditShopValid':  //编辑商城商品上架与否
            require('./admin/shop/editValid')(req, res);
            break;
        case 'adminEditGoodInfo':   //编辑商城商品的几个基本信息
            require('./admin/shop/editGoodInfo')(req, res);
            break;

        //后台题目管理
        case 'adminGetQuestionList':    //获取题目列表
            require('./admin/question/getList')(req, res);
            break;
        case 'adminEditQuestion':       //新增、编辑题目
            require('./admin/question/editQuestion')(req, res);
            break;
        case 'adminAddSubQuestion':     //为问题的选项关联子问题
            require('./admin/question/addSubQuestion')(req, res);
            break;
        case 'adminGetQuestionDetail':   //获取问题详情
            require('./admin/question/getDetail')(req, res);
            break;

        //诱导式学习
        case 'adminEditStudyChapter':   //编辑章
            require('./admin/study/editChapter')(req, res);
            break;
        case 'adminEditStudyChoice':    //编辑选项
            require('./admin/study/editChoice')(req, res);
            break;
        case 'adminEditStudyPoint': //编辑知识点
            require('./admin/study/editPoint')(req, res);
            break;
        case 'adminEditStudyPointExtra':    //编辑知识点附加信息
            require('./admin/study/editPointExtra')(req, res);
            break;
        case 'adminEditStudyQuestion':      //编辑问题
            require('./admin/study/editQuestion')(req, res);
            break;
        case 'adminEditStudyQuestionExtra':     //编辑问题附加信息
            require('./admin/study/editQuestionExtra')(req, res);
            break;
        case 'adminEditStudyQuestionNext':           //编辑问题下一步id
            require('./admin/study/editQuestionNext')(req, res);
            break;
        case 'adminEditStudySection':       //编辑节
            require('./admin/study/editSection')(req, res);
            break;
        case 'adminEditStudySectionQuestion':   //编辑节内问题
            require('./admin/study/editSectionQuestion')(req, res);
            break;
        case 'adminEditStudyVersion':   //添加、编辑、删除教材版本
            require('./admin/study/editVersion')(req, res);
            break;
        case 'adminGetStudyCatalog':    //获取教材目录
            require('./admin/study/getCatalog')(req, res);
            break;
        case 'adminGetStudyChoice':     //获取选项内容
            require('./admin/study/getChoice')(req, res);
            break;
        case 'adminGetFullQuestion':    //获取完整问题
            require('./admin/study/getFullQuestion')(req, res);
            break;
        case 'adminGetStudyPoint':      //获取知识点内容
            require('./admin/study/getPoint')(req, res);
            break;
        case 'adminGetStudyPointExtra':     //获取知识点附加信息
            require('./admin/study/getPointExtra')(req, res);
            break;
        case 'adminGetStudyPointList':      //获取知识点列表
            require('./admin/study/getPointList')(req, res);
            break;
        case 'adminGetPointQuestionList':   //获取知识点对应问题列表
            require('./admin/study/getPointQuestionList')(req, res);
            break;
        case 'adminGetStudyQuestion':       //获取问题内容
            require('./admin/study/getQuestion')(req, res);
            break;
        case 'adminGetStudyQuestionExtra':  //获取问题附加信息
            require('./admin/study/getQuestionExtra')(req, res);
            break;
        case 'adminGetStudyQuestionList':   //获取问题列表
            require('./admin/study/getQuestionList')(req, res);
            break;
        case 'adminGetQuestionAdminList':   //获取录题人员列表
            require('./admin/study/getQuestionAdminList')(req, res);
            break;
        case 'adminDelFullQuestion':        //删除整个问题，不可恢复
            require('./admin/study/deleteFullQuestion')(req, res);
            break;
        case 'adminGetStudySectionQuestion':    //获取节下所属问题列表
            require('./admin/study/getSectionQuestion')(req, res);
            break;
        case 'adminGetStudyGradeSubject':   //获取学段年级科目配置
            require('./admin/study/getSGSList')(req, res);
            break;
        case 'adminGetStudyVersionList':     //获取教材版本列表
            require('./admin/study/getVersionList')(req, res);
            break;
        case 'adminCheckStudyQuestion':     //管理员审核问题
            require('./admin/study/checkQuestion')(req, res);
            break;



        //商户后台api
        case 'shopGoodList':    //获取商品列表
            require('./shop/goodList')(req, res);
            break;
        case 'shopExchangeMailList':    //获取物流兑换列表
            require('./shop/exchangeMailList')(req, res);
            break;
        case 'shopExchangeList':    //获取商户商品兑换列表
            require('./shop/exchangeList')(req, res);
            break;
        case 'shopCheckCode':   //校验兑换码
            require('./shop/checkCode')(req, res);
            break;
        case 'shopConfirmCode': //确认兑换码
            require('./shop/confirmCode')(req, res);
            break;
        case 'shopConfirmMail':     //确认物流发货
            require('./shop/confirmMail')(req, res);
            break;
        case 'shopExchangeMoney':
            require('./shop/exchangeMoney')(req, res);
            break;


        //运营后台（公众号）
        case 'adminGetPubList':    //获取公众号列表
            require('./admin/pub/getList')(req, res);
            break;
        case 'adminGetPubDetail':  //获取公众号详情
            require('./admin/pub/getDetail')(req, res);
            break;
        case 'adminVerifyPub':  //审核公众号资格信息
            require('./admin/pub/verifyPub')(req, res);
            break;
        case 'adminModifyPub':  //编辑公众号信息
            require('./admin/pub/modifyPub')(req, res);
            break;

        //公众号后台
        case 'pubLogin':    //公众号登录
            require('./pub/user/login')(req, res);
            break;
        case 'pubCheckEmail':   //校验邮箱可用性
            require('./pub/user/checkEmail')(req, res);
            break;
        case 'pubRegister': //公众号注册
            require('./pub/user/register')(req, res);
            break;
        case 'pubVerifyEmail':  //验证邮箱
            require('./pub/user/verify')(req, res);
            break;
        case 'pubGetUserInfo':  //公众号获取个人信息
            require('./pub/user/getUserInfo')(req, res);
            break;
        case 'pubChangeUserInfo':   //修改用户个人信息
            require('./pub/user/modifyUserInfo')(req, res);
            break;
        case 'pubGetMyTopicList':   //公众号获取我的文章列表
            require('./pub/topics/getMyTopicList')(req, res);
            break;
        case 'pubGetMyMsgList': //获取我的消息列表
            require('./pub/topics/getMyMsgList')(req, res);
            break;
        case 'pubGetMyTopicDetail': //获取我的文章详情
            require('./pub/topics/getMyTopicDetail')(req, res);
            break;
        case 'pubGetMyMsgDetail':
            require('./pub/topics/getMyMsgDetail')(req, res);
            break;
        case 'pubEditTopic':    //新建、编辑文章
            require('./pub/topics/editTopic')(req, res);
            break;
        case 'pubEditMsg':  //新建、编辑消息
            require('./pub/topics/editMsg')(req, res);
            break;

        //公众号详情展示
        case 'getTopicDetail':  //用户获取文章详情(不需要校验userID、authSign)
            require('./pub/service/getTopicDetail')(req, res);
            break;

        default:
            result(res, {statusCode: 905, message: 'invalid api name'});
            break;
    }
};
