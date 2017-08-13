/**
 * Created by hjy on 2015/9/19 0019.
 */

    function tabShop(){
        var title = "商品管理";
        var menus = ["管理员管理后台","商品管理"];
        var hrefs = ["javascript:tabShop()","javascript:tabShop()"];
        var url = "../admin/shop.html";
        initMenu(menus,hrefs,title,url);
    }

    function tabShopBanner(){
        var title = "商城Banner管理";
        var menus = ["管理员管理后台","商城Banner管理"];
        var hrefs = ["javascript:tabShop()","javascript:tabShopBanner()"];
        var url = "../admin/shopBanner.html";
        initMenu(menus,hrefs,title,url);
    }

    function tabShopMail(){
        var title = "物流管理";
        var menus = ["管理员管理后台","物流管理"];
        var hrefs = ["javascript:tabShop()","javascript:tabShopMail()"];
        var url = "../admin/shopMail.html";
        initMenu(menus,hrefs,title,url);
    }

    function tabShopCode(){
        var title = "兑换码管理";
        var menus = ["管理员管理后台","兑换码管理"];
        var hrefs = ["javascript:tabShop()","javascript:tabShopCode()"];
        var url = "../admin/shopCode.html";
        initMenu(menus,hrefs,title,url);
    }

    function tabShopList(){
        var title = "商家管理";
        var menus = ["管理员管理后台","商家管理"];
        var hrefs = ["javascript:tabShop()","javascript:tabShopList()"];
        var url = "../admin/shopList.html";
        initMenu(menus,hrefs,title,url);
    }

    function tabEditDetail(){
        var title = "添加商品";
        var menus = ["管理员管理后台","添加商品"];
        var hrefs = ["javascript:tabShop()","javascript:tabEditDetail()"];
        var url = "../admin/editDetail.html";
        initMenu(menus,hrefs,title,url);
    }

    function tabShopIndex(){
        var title = "商品列表";
        var menus = ["商户管理后台","商品列表"];
        var hrefs = ["javascript:tabShopIndex()","javascript:tabShopIndex()"];
        var url = "../shop/index.html";
        initMenu(menus,hrefs,title,url);
    }

    function tabExchangeCode(){
        var title = "兑换码管理";
        var menus = ["商户管理后台","兑换码管理"];
        var hrefs = ["javascript:tabShopIndex()","javascript:tabExchangeCode()"];
        var url = "../shop/exchangeCode.html";
        initMenu(menus,hrefs,title,url);
    }

    function tabExchangeMail(){
        var title = "发货管理";
        var menus = ["商户管理后台","发货管理"];
        var hrefs = ["javascript:tabShopIndex()","javascript:tabExchangeMail()"];
        var url = "../shop/exchangeMail.html";
        initMenu(menus,hrefs,title,url);
    }

    function tabTeacherManage(){
        var title = "教师管理";
        var menus = ["教师管理后台","教师管理"];
        var hrefs = ["javascript:tabTeacherManage()","javascript:tabTeacherManage()"];
        var url = "../teacherManager/teacherManage.html";
        initMenu(menus,hrefs,title,url);
    }

    function tabCollectTeacherManage(){
        var title = "付费教师管理";
        var menus = ["教师管理后台","付费教师管理"];
        var hrefs = ["javascript:tabTeacherManage()","javascript:tabCollectTeacherManage()"];
        var url = "../teacherManager/collectTeacherManage.html";
        initMenu(menus,hrefs,title,url);
    }

    function tabPlanManage(){
        var title = "推广管理";
        var menus = ["管理中心","推广管理"];
        var hrefs = ["javascript:tabTeacherManage()","javascript:tabTeacherManage()"];
        var url = "../teacherManager/planManage.html";
        initMenu(menus,hrefs,title,url);
    }

    function tabUserManage(){
        var title = "用户信息管理";
        var menus = ["管理中心","用户管理","用户信息管理"];
        var hrefs = ["javascript:tabTeacherManage()","javascript:tabUserManage()","javascript:tabUserManage()"];
        var url = "../teacherManager/userManage.html";
        initMenu(menus,hrefs,title,url);
    }

    function tabUserAlipayPwdManage(){
        var title = "用户支付密码管理";
        var menus = ["管理中心","用户管理","用户支付密码管理"];
        var hrefs = ["javascript:tabTeacherManage()","javascript:tabUserManage()","javascript:tabUserAlipayPwdManage()"];
        var url = "../teacherManager/userAlipayPwdManage.html";
        initMenu(menus,hrefs,title,url);
    }

    function tabTestUserManage(){
        var title = "测试用户管理";
        var menus = ["管理中心","用户管理","测试用户管理"];
        var hrefs = ["javascript:tabTeacherManage()","javascript:tabUserManage()","javascript:tabTestUserManage()"];
        var url = "../teacherManager/betaUserManage.html";
        initMenu(menus,hrefs,title,url);
    }

    function tabUserAlipayManage(){
        var title = "用户资金管理";
        var menus = ["管理中心","用户资金管理"];
        var hrefs = ["javascript:tabUserAlipayManage()","javascript:tabUserAlipayManage()"];
        var url = "../teacherManager/userAlipayManage.html";
        initMenu(menus,hrefs,title,url);
    }

    function tabUserFeedbackManage(){
        var title = "用户反馈管理";
        var menus = ["管理中心","用户反馈管理"];
        var hrefs = ["javascript:tabTeacherManage()","javascript:tabUserFeedbackManage()"];
        var url = "../teacherManager/userFeedbackManage.html";
        initMenu(menus,hrefs,title,url);
    }

    function tabUserReportManage(){
        var title = "用户举报管理";
        var menus = ["管理中心","用户举报管理"];
        var hrefs = ["javascript:tabTeacherManage()","javascript:tabUserReportManage()"];
        var url = "../teacherManager/userReportManage.html";
        initMenu(menus,hrefs,title,url);
    }

    function tabMessageManage(){
        var title = "消息管理";
        var menus = ["管理中心","用户管理","消息管理"];
        var hrefs = ["javascript:tabTeacherManage()","javascript:tabUserManage()","javascript:tabMessageManage()"];
        var url = "../teacherManager/messageManage.html";
        initMenu(menus,hrefs,title,url);
    }

    function tabUserLogManage(){
        var title = "用户日志管理";
        var menus = ["管理中心","用户管理","用户日志管理"];
        var hrefs = ["javascript:tabTeacherManage()","javascript:tabUserManage()","javascript:tabUserLogManage()"];
        var url = "../teacherManager/userLogManage.html";
        initMenu(menus,hrefs,title,url);
    }

    function tabAdminManage(){
        var title = "管理员设置";
        var menus = ["管理中心","系统管理","管理员设置"];
        var hrefs = ["javascript:tabAdminManage()","javascript:tabAdminManage()","javascript:tabAdminManage()"];
        var url = "../teacherManager/adminManage.html";
        initMenu(menus,hrefs,title,url);
    }

    function tabAntiCheatManage(){
        var title = "反作弊设置";
        var menus = ["管理中心","系统管理","反作弊设置"];
        var hrefs = ["javascript:tabAdminManage()","javascript:tabAdminManage()","javascript:tabAntiCheatManage()"];
        var url = "../teacherManager/antiCheatManage.html";
        initMenu(menus,hrefs,title,url);
    }

    function tabBonusManage(){
        var title = "积分奖励设置";
        var menus = ["管理中心","系统管理","积分奖励设置"];
        var hrefs = ["javascript:tabAdminManage()","javascript:tabAdminManage()","javascript:tabBonusManage()"];
        var url = "../teacherManager/bonusManage.html";
        initMenu(menus,hrefs,title,url);
    }

    function tabAdManage(){
        var title = "广告管理";
        var menus = ["管理中心","广告管理"];
        var hrefs = ["javascript:tabAdminManage()","javascript:tabAdManage()"];
        var url = "../teacherManager/adManage.html";
        initMenu(menus,hrefs,title,url);
    }

    function tabPubManage(){
        var title = "公众号管理";
        var menus = ["管理中心","公众号管理"];
        var hrefs = ["javascript:tabAdminManage()","javascript:tabPubManage()"];
        var url = "../teacherManager/pubManage.html";
        initMenu(menus,hrefs,title,url);
    }

    function tabQuestionManage(){
        var title = "题库管理";
        var menus = ["管理中心","题库管理"];
        var hrefs = ["javascript:tabAdminManage()","javascript:tabQuestionManage()"];
        var url = "../teacherManager/questionManage.html";
        initMenu(menus,hrefs,title,url);
    }

    function tabStudyQuestionManage(){
        var title = "引导问题管理";
        var menus = ["管理中心","引导问题管理"];
        var hrefs = ["javascript:tabAdminManage()","javascript:tabStudyQuestionManage()"];
        var url = "../teacherManager/studyQuestionManage.html";
        initMenu(menus,hrefs,title,url);
    }

    function tabStudyQuestionReview(){
        var title = "引导问题审核";
        var menus = ["管理中心","引导问题审核"];
        var hrefs = ["javascript:tabAdminManage()","javascript:tabStudyQuestionReview()"];
        var url = "../teacherManager/studyQuestionReview.html";
        initMenu(menus,hrefs,title,url);
    }

    function tabStudyPointManage(){
        var title = "知识点管理";
        var menus = ["管理中心","知识点管理"];
        var hrefs = ["javascript:tabAdminManage()","javascript:tabStudyPointManage()"];
        var url = "../teacherManager/studyPointManage.html";
        initMenu(menus,hrefs,title,url);
    }

    function tabTextbooksManage(){
        var title = "教材管理";
        var menus = ["管理中心","教材管理"];
        var hrefs = ["javascript:tabAdminManage()","javascript:tabTextbooksManage()"];
        var url = "../teacherManager/textbooksManage.html";
        initMenu(menus,hrefs,title,url);
    }

    function tabQATeacherManage(){
        var title = "答疑中心管理";
        var menus = ["答疑中心管理","答疑教师列表"];
        var hrefs = ["javascript:tabQATeacherManage()","javascript:tabQATeacherManage()"];
        var url = "../questionAndAnswerCenter/qaTeacherList.html";
        initMenu(menus,hrefs,title,url);
    }

    function tabTeacherTop(){
        var title = "答疑中心管理";
        var menus = ["答疑中心管理","答疑数据分析","答疑排行"];
        var hrefs = ["javascript:tabQATeacherManage()","javascript:tabTeacherTop()","javascript:tabTeacherTop()"];
        var url = "../questionAndAnswerCenter/teacherTop.html";
        initMenu(menus,hrefs,title,url);
    }

    function tabQuestionsStatistics(){
        var title = "答疑中心管理";
        var menus = ["答疑中心管理","答疑数据统计","答疑题目"];
        var hrefs = ["javascript:tabQATeacherManage()","javascript:tabTeacherTop()","javascript:tabQuestionsStatistics()"];
        var url = "../questionAndAnswerCenter/questionsStatistics.html";
        initMenu(menus,hrefs,title,url);
    }

    function tabSystemAnswer(){
        var title = "答疑中心管理";
        var menus = ["答疑中心管理","答疑数据统计","系统答疑数据"];
        var hrefs = ["javascript:tabQATeacherManage()","javascript:tabTeacherTop()","javascript:tabSystemAnswer()"];
        var url = "../questionAndAnswerCenter/systemAnswer.html";
        initMenu(menus,hrefs,title,url);
    }

    function tabTeacherAnswer(){
        var title = "答疑中心管理";
        var menus = ["答疑中心管理","答疑数据统计","教师答疑数据"];
        var hrefs = ["javascript:tabQATeacherManage()","javascript:tabTeacherTop()","javascript:tabTeacherAnswer()"];
        var url = "../questionAndAnswerCenter/teacherAnswer.html";
        initMenu(menus,hrefs,title,url);
    }

    function tabOffLineQuestion(){
        var title = "运营后台管理";
        var menus = ["运营后台管理","广场、圈子管理","谈天说地问题列表"];
        var hrefs = ["javascript:tabOffLineQuestion()","javascript:tabOffLineQuestion()","javascript:tabOffLineQuestion()"];
        var url = "../operateManager/offLineQuestion.html";
        initMenu(menus,hrefs,title,url);
    }

    function tabQuestionAndAsk(){
        var title = "运营后台管理";
        var menus = ["运营后台管理","广场、圈子管理","你问我答问题列表"];
        var hrefs = ["javascript:tabOffLineQuestion()","javascript:tabOffLineQuestion()","javascript:tabQuestionAndAsk()"];
        var url = "../operateManager/questionAndAsk.html";
        initMenu(menus,hrefs,title,url);
    }

    function initMenu(menus,hrefs,title,url){
        $('#element').fadeOut(0);
        var breadcrumb = "<li><span class='entypo-home'></span></li>";
        for(var i=0;i<menus.length;i++){
            breadcrumb += "<li><i class='fa fa-lg fa-angle-right'></i></li><li><a href='"+hrefs[i]+"' title='"+menus[i]+"'>"+menus[i]+"</a></li>";
        }

        document.onkeydown = function(e){
            e = e||window.event;
            if(e.keyCode==116){
                initMenu(menus,hrefs,title,url);
                return false;
            }
        }

        $("#h2Title").text(title);
        $("#breadcrumb").empty();
        $("#breadcrumb").append(breadcrumb);
        $('#element').empty();
        $('#element').load(url)
        $('#element').fadeIn(250);
        $("html body").scrollTop(0);
    }

    function initPage(){
        if(util.getSessionStorage("userType")=="superAdmin"){
            $("#goodSection,#goodPage,#logisticPage,#codePage,#shopPage,#bannerPage").removeClass("hidden"); //商品管理
            $("#shopSection,#goodList,#codeManage,#mailManage").removeClass("hidden"); //商户管理
            $("#adminSection,#adminPage,#teacherPage,#collectTeacherPage,#promotionPage,#userPage,#adPage,#statPage,#feedbackPage,#systemPage,#adPage,#pubPage,#userFeedbackPage,#userReportPage,#questionPage,#studyQuestionPage,#studyPointPage,#textbooksPage,#userAlipayPage,#studyQuestionPage,#studyQuestionReviewPage,#studyPointPage,#textbooksPage").removeClass("hidden"); //管理中心
            $("#qaSection,#QATeacherPage,#QAStatPage").removeClass("hidden"); //答疑中心管理
            $("#squareSection,#offLineQuestion").removeClass("hidden"); //广场管理
            tabShop();
        }else if(util.getSessionStorage("userType")=="admin"){
            var sections = util.getSessionStorage('sections').split(",");
            var pages = util.getSessionStorage('pages').split(",");
            for(var i=0;i<sections.length;i++) {
                $("#" + sections[i]).removeClass("hidden");
            }
            for(var j=0;j<pages.length;j++){
                $("#"+pages[j]).removeClass("hidden");
            }
        }else if(util.getSessionStorage("userType")=="shop"){
            $("#shopSection,#goodList,#codeManage,#mailManage").removeClass("hidden"); //商户管理
            tabShopIndex();
        }
    }
    initPage();