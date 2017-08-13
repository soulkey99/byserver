/**
 * Created by hjy on 2016/4/8 0008.
 */

function getNewQuestion(questionId){
    var postObj = {};
    postObj.userID = userID;
    postObj.authSign = authSign;
    postObj.q_id = questionId;
    util.callServerFunctionV2("getStudyQuestion&random="+parseInt(Math.random()*10000), postObj, function(data) {
        if(data.statusCode == 900) {
            newQuestionInfo = data.info;
            newQuestionInfo.userRight = "";
            newQuestionInfo.userOption = "";
            newQuestionInfo.number = vm.questions().length+1;
            $(".main, .option").hide();
            $(".main").html(newQuestionInfo.content);
            $(".option").empty();
            for(var i=0;i<newQuestionInfo.choice.length;i++){
                $(".option").append("<div class='optionBtn' ontouchstart=\"changeBg(this,'in')\" ontouchend=\"changeBg(this,'out')\" onclick=\"selectOption(this,"+ i +")\"><span class='flag'>"+ newQuestionInfo.choice[i].flag +"&nbsp;&nbsp;</span><span>"+ newQuestionInfo.choice[i].content +"</span></div>");
            }
            MathJax.Hub.Queue(["Typeset",MathJax.Hub, "content"]);
            MathJax.Hub.Queue(["Typeset",MathJax.Hub, "options"]);
            MathJax.Hub.Queue(function(){
                $(".MathJax_Display").attr("style","display: -webkit-inline-box !important");
                $(".main, .option").show();
                $(".main, .option").addClass("animated fadeIn");
                setTimeout(function(){
                    $(".main, .option").removeClass("animated fadeIn");
                },500);
            });
        }else{
            alert(data.message);
        }
    });
}

function getOldQuestion(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.e_id = util.getSessionStorage("e_id");
    util.callServerFunctionV2("getStudyExerciseDetail&random="+parseInt(Math.random()*10000), postObj, function(data) {
        if(data.statusCode == 900) {
            if(data.info.step.length == 1){
                getNewQuestion(util.getSessionStorage("nextId"));
            }else{
                for(var i=1;i<data.info.step.length;i++){
                    newQuestionInfo = data.info.step[i].question;
                    newQuestionInfo.userRight = true;
                    newQuestionInfo.number = vm.questions().length+1;
                    for(var j=0;j<data.info.step[i].question.choice.length;j++){
                        if(data.info.step[i].question.choice[j].choice_id == data.info.step[i].choice_id){
                            newQuestionInfo.userOption = data.info.step[i].question.choice[j].flag;
                        }
                    }
                    if(i < data.info.step.length-1){
                        vm.questions.unshift(newQuestionInfo);
                    }
                }
                vm.schedule(data.info.step.length-1);
                vm.activated(vm.schedule());
                selectSchedule();
            }
        }else{
            alert(data.message);
        }
    });
}

function changeBg(obj,sign){
    if(sign == "in"){
        $(obj).css("backgroundColor","#e5e5e5");
    }else if(sign == "out"){
        $(obj).css("backgroundColor","#fafafa");
    }
}

function nextQuestion(index){
    if (newQuestionInfo != null) {
        newQuestionInfo.userRight = true;
        newQuestionInfo.userOption = newQuestionInfo.choice[index].flag;
        newQuestionInfo.number = vm.questions().length + 1;
        vm.questions.unshift(newQuestionInfo);
    }
    //getNewQuestion("570c9df730bf31e8209e4b0a");
    getNewQuestion(newQuestionInfo.choice[index].next);
    vm.schedule(vm.schedule() + 1);
    vm.activated(vm.schedule());
    if(vm.schedule() == 2){
        var postObj = {};
        postObj.userID = userID;
        postObj.authSign = authSign;
        util.callServerFunctionV2("getExerciseList&random="+parseInt(Math.random()*10000), postObj, function(data) {
            if(data.statusCode == 900) {
                if(data.list.length==1){
                    $("#help1").show();
                }
            }else{
                alert(data.message);
            }
        });
    }
    optionSelected = false;
}

function selectOption(obj,index){
    if(vm.activated() == vm.schedule() && !optionSelected){
        optionSelected = true;
        setStudyCheck(newQuestionInfo.choice[index].choice_id,newQuestionInfo.q_id);
        if(newQuestionInfo.choice[index].action == "next") {  //跳至下一题
            if(newQuestionInfo.choice[index].correct == true){
                $(".note").html("<img class='noteImg' src='/howToSolveProblem/images/right.png'>");
                $(".note").show();
                $(".note").addClass("animated bounceInDown");
                $(obj).addClass("right");
                $(obj).find(".flag").css("color","#ffffff");
                setTimeout(function () {
                    $(".note").removeClass("animated bounceInDown");
                    $(".note").hide();
                    nextQuestion(index);
                }, 2000);
            }else if(newQuestionInfo.choice[index].correct == false){
                $(".note").html("<img class='noteImg' src='/howToSolveProblem/images/wrong.png'>");
                $(".note").show();
                $(".note").addClass("animated bounceInDown");
                $(obj).addClass("wrong");
                $(obj).find(".flag").css("color","#ffffff");
                setTimeout(function () {
                    $(".note").removeClass("animated bounceInDown");
                    $(".note").hide();
                    nextQuestion(index);
                }, 2000);
            }else{
                $(obj).addClass("right");
                nextQuestion(index);
            }
        }else if(newQuestionInfo.choice[index].action == "question") {  //提示审题
            $(".note").html("<img class='noteImg' src='/howToSolveProblem/images/wrongAgain.png'>");
            $(".note").show();
            $(".note").addClass("animated bounceInDown");
            $(obj).addClass("wrong");
            $(obj).find(".flag").css("color","#ffffff");
            setTimeout(function () {
                $(".note").removeClass("animated bounceInDown");
                $(".note").hide();
                //$(".main").html(newQuestionInfo.content);
                $(".optionBtn").each(function () {
                    $(this).removeClass("wrong");
                });
                optionSelected = false;
                $(obj).find(".flag").css("color","#449de2");
            }, 2000);
        }else if(newQuestionInfo.choice[index].action == "hint") {  //显示提示
            $(".note").html("<div style='width: 100%'>" +
                "<img class='noteImg' src='/howToSolveProblem/images/note.png'>" +
                "<div id='noteText' class='noteText'>"+ newQuestionInfo.choice[index].hint +"</div>" +
                "<div class='noteBtn' onclick='closeNote()'>我知道了</div>" +
                "</div>");
            $(".note").show();
            $(".note").addClass("animated bounceInDown");
            MathJax.Hub.Queue(["Typeset",MathJax.Hub, "noteText"]);
            MathJax.Hub.Queue(function(){
                $(obj).addClass("wrong");
                $(obj).find(".flag").css("color","#ffffff");
                $(".MathJax_Display").attr("style","display: -webkit-inline-box !important");
                $(".optionBtn").each(function(){
                    $(this).removeClass("wrong");
                    $(obj).find(".flag").css("color","#449de2");
                });
            });
        }else if(newQuestionInfo.choice[index].action == "result") {  //最后一题 跳至结果页
            $(obj).addClass("right");
            $(obj).find(".flag").css("color","#ffffff");
            optionSelected = false;
            window.location.href = "/howToSolveProblem/result.html";
        }
    }
}

function setStudyCheck(choice_id,q_id){
    var postObj = {};
    postObj.userID = userID;
    postObj.authSign = authSign;
    postObj.q_id = q_id;
    postObj.e_id = e_id;
    postObj.choice_id = choice_id;
    util.callServerFunctionV2("studyCheck&random="+parseInt(Math.random()*10000), postObj, function(data) {
        if(data.statusCode == 900) {

        }else{
            alert(data.message);
        }
    });
}

function selectNumber(obj){
    var number = parseInt($(obj).text());
    $(".questionNum").each(function(){
        $(this).css("backgroundColor","#67b7f1");
        $(this).css("color","white");
    });
    $(obj).css("backgroundColor","white");
    $(obj).css("color","#67b7f1");
    vm.activated(number);
    changeQuestion(vm.questions().length - number);
}

function selectSchedule(){
    $(".leftTopImg").attr("src","/howToSolveProblem/images/leftTopIn.png");
    vm.activated(vm.schedule());
    $(".questionNum").each(function(){
        $(this).css("backgroundColor","#67b7f1");
        $(this).css("color","#ffffff");
    });
    $(".left").animate({scrollTop: 0},300);
    $(".option,.main").hide();
    $(".main").html(newQuestionInfo.content);
    $(".option").empty();
    for(var i=0;i<newQuestionInfo.choice.length;i++){
        $(".option").append("<div class='optionBtn' ontouchstart=\"changeBg(this,'in')\" ontouchend=\"changeBg(this,'out')\" onclick=\"selectOption(this,"+ i +")\"><span class='flag'>"+ newQuestionInfo.choice[i].flag +"</span>&nbsp;&nbsp;<span>"+ newQuestionInfo.choice[i].content +"</span></div>");
    }
    MathJax.Hub.Queue(["Typeset",MathJax.Hub, "content"]);
    MathJax.Hub.Queue(["Typeset",MathJax.Hub, "options"]);
    MathJax.Hub.Queue(function(){
        $(".MathJax_Display").attr("style","display: -webkit-inline-box !important");
        $(".option,.main").show();
        $(".main, .option").addClass("animated fadeIn");
        setTimeout(function(){
            $(".main, .option").removeClass("animated fadeIn");
        },500);
    });
}

function changeQuestion(number){
    $(".main, .option").hide();
    $(".main").html(vm.questions()[number].content);
    $(".option").empty();
    for(var i=0;i<vm.questions()[number].choice.length;i++){
        if(vm.questions()[number].choice[i].flag == vm.questions()[number].userOption){
            if(vm.questions()[number].userRight){
                $(".option").append("<div class='optionBtn right'><span class='flag' style='color: #ffffff'>"+ vm.questions()[number].choice[i].flag +"&nbsp;&nbsp;</span><span>"+ vm.questions()[number].choice[i].content +"</span></div>");
            }else{
                $(".option").append("<div class='optionBtn wrong'><span class='flag' style='color: #ffffff'>"+ vm.questions()[number].choice[i].flag +"&nbsp;&nbsp;</span><span>"+ vm.questions()[number].choice[i].content +"</span></div>");
            }
        }else{
            $(".option").append("<div class='optionBtn'><span class='flag'>"+ vm.questions()[number].choice[i].flag +"&nbsp;&nbsp;</span><span>"+ vm.questions()[number].choice[i].content +"</span></div>");
        }
    }
    MathJax.Hub.Queue(["Typeset",MathJax.Hub, "content"]);
    MathJax.Hub.Queue(["Typeset",MathJax.Hub, "options"]);
    MathJax.Hub.Queue(function(){
        $(".MathJax_Display").attr("style","display: -webkit-inline-box !important");
        $(".main, .option").show();
        $(".main, .option").addClass("animated fadeIn");
        setTimeout(function(){
            $(".main, .option").removeClass("animated fadeIn");
        },500);
    });
}

function showMainQuestion(obj){
    if(!mainOpen){
        mainOpen = true;
        if($(obj).attr("src") == "images/mainQO.png"){
            $(".mainQuestion").removeClass("animated bounceOutDown");
            $(".mainQuestion").show();
            $(".mainQuestion").addClass("animated bounceInUp");
            $(obj).attr("src","images/mainQC.png");
            setTimeout(function(){
                $(".MathJax_Display").attr("style","display: -webkit-inline-box !important");
                //window.scrollTo(0,document.body.scrollHeight);
                mainOpen = false;
            },800);
        }else{
            $(obj).attr("src","images/mainQO.png");
            $(".mainQuestion").removeClass("animated bounceInUp");
            $(".mainQuestion").addClass("animated bounceOutDown");
            setTimeout(function(){
                $(".mainQuestion").hide();
                mainOpen = false;
            },800);
        }
    }
}

function showQuestionList(){
    if(!questionTab) {
        questionTab = true;
        $("#questionTab").addClass("animated zoomOut");
        setTimeout(function () {
            $("#questionTab").removeClass("animated zoomOut");
            $("#questionTab").hide();
        }, 1000);
        $("#questionList").show();
        $("#questionList").addClass("animated flipInX");
        setTimeout(function () {
            $("#questionList").removeClass("animated flipInX");
            questionTab = false;
        }, 1000);
    }
}

function hideQuestionList(){
    if(!questionTab) {
        questionTab = true;
        $("#questionList").addClass("animated flipOutX");
        setTimeout(function () {
            $("#questionList").removeClass("animated flipOutX");
            $("#questionList").hide();
        }, 1000);
        $("#questionTab").show();
        $("#questionTab").addClass("animated zoomIn");
        setTimeout(function () {
            $("#questionTab").removeClass("animated zoomIn");
            questionTab = false;
        }, 1000);
        if(vm.activated()!=vm.schedule()){
            selectSchedule();
        }
    }
}

function closeNote(){
    $(".note").removeClass("animated bounceInDown");
    $(".note").hide();
    optionSelected = false;
}

function loadingFinish(){
    $("body").css("backgroundColor","#fafafa");
    $(".loading").remove();
    $("#main").css("visibility","visible");
    $("#main").addClass("animated fadeIn");
    setTimeout(function(){
        $("#main").removeClass("animated fadeIn");
    },300);
}

function goBack(){
    window.location.href = '/howToSolveProblem/questionList.html';
}

function isHelp(){
    $("#help1,#help2").hide();
    var postObj = {};
    postObj.userID = userID;
    postObj.authSign = authSign;
    util.callServerFunctionV2("getExerciseList&random="+parseInt(Math.random()*10000), postObj, function(data) {
        if(data.statusCode == 900) {
            if(data.list.length==1){
                $("#help2").show();
            }
        }else{
            alert(data.message);
        }
    });
}

function closeHelp(obj){
    $(obj).hide();
}

var viewModel = function() {
    this.questions = ko.observableArray();
    this.activated = ko.observable(1);
    this.schedule = ko.observable(1);
};
var vm = new viewModel()
    ,u = navigator.userAgent
    ,userID = util.getSessionStorage("userID")
    ,authSign = util.getSessionStorage("authSign")
    ,mainContent = util.getSessionStorage("mainContent")
    ,e_id = util.getSessionStorage("e_id")
    ,newQuestionInfo = null
    ,optionSelected = false
    ,mainOpen = false
    ,questionTab = false;
$(document).ready(function(){
    FastClick.attach(document.body);
    $(".loading").css("height",$(window).height() + "px");
    $(".loading").css("lineHeight",$(window).height() + "px");
    $(".help").css("height",$(window).height() + "px");
    ko.applyBindings(vm);
    isHelp();
    getOldQuestion();
    MathJax.Hub.Config({
        tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]},
        showProcessingMessages: false,
        messageStyle: "none",
        "HTML-CSS": {
            linebreaks: {
                automatic: true,
                width: "container"
            },
            styles: {
                ".MathJax_Display": {
                    "text-align": "center",
                    margin: "1em 0em",
                    display: "-webkit-inline-box !important"
                }
            }
        }
    });
    MathJax.Hub.Queue(loadingFinish);
    $(".head,.topList").css("height",$(window).height()*0.08 + "px");
    //$(".head,.topList").css("lineHeight",$(window).height()*0.08 + "px");
    $(".mainContent").html(mainContent);
    MathJax.Hub.Queue(["Typeset",MathJax.Hub, "mainContent"]);
    setTimeout(function(){
        $(".MathJax_Display").attr("style","display: -webkit-inline-box !important");
    },500);
    $(".mainQuestion, #questionList, .note").hide();
    var u = navigator.userAgent;
    if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) {//安卓手机
        javascript:callcall.jsCallback("setEid", JSON.stringify({"e_id": e_id}));  // 记录ID
        javascript:callcall.jsCallback("setClose", JSON.stringify({"close": true}));  //开启关闭功能 关闭当前题
    }
    //$(window).scroll(function(){
    //    $(".head").animate({"top":$(document).scrollTop()+"px"});
    //    $(".mainQQ").css("top",$(window).scrollTop() + $(window).height());
    //});
});