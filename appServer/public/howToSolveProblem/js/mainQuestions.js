/**
 * Created by hjy on 2016/4/8 0008.
 */

function getMainQuestion(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.q_id = q_id;
    util.callServerFunctionV2("getStudyQuestion&random="+parseInt(Math.random()*10000), postObj, function(data) {
        if(data.statusCode == 900) {
            $("#content").html(data.info.content);
            util.setSessionStorage("nextId", data.info.next);
            util.setSessionStorage("mainContent", data.info.content);
        }else{
            alert(data.message);
        }
    });
}

function oldExercise(){
    window.location.href = "/howToSolveProblem/subQuestions.html?isClose=1&eId="+util.getSessionStorage("e_id");
}

function newExercise(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.q_id = q_id;
    postObj.type = "study";
    postObj.sec_id =  util.getSessionStorage("sec_id");
    util.callServerFunctionV2("genExercise&random="+parseInt(Math.random()*10000), postObj, function(data) {
        if(data.statusCode == 900) {
            util.setSessionStorage("e_id",data.info.e_id);
            window.location.href = "/howToSolveProblem/subQuestions.html?isClose=1&eId="+data.info.e_id;
        }else{
            alert(data.message);
        }
    });
}

function escape(html, encode) {
    return html
        .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function loadingFinish(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.q_id = q_id;
    postObj.sec_id =  util.getSessionStorage("sec_id");
    util.callServerFunctionV2("getPendingExercise&random="+parseInt(Math.random()*10000), postObj, function(data) {
        if(data.statusCode == 900) {
            MathJax.Hub.Queue(["Typeset",MathJax.Hub, "content"]);
            MathJax.Hub.Queue(function(){
                $("body").css("backgroundColor","#fafafa");
                $(".loading").remove();
                $(".MathJax_Display").attr("style","display: -webkit-inline-box !important");
                $("section").css("visibility","visible");
                if(data.info.hasPending){
                    util.setSessionStorage("e_id",data.info.e_id);
                    $("#logo,#btnArticle").hide();
                    $("#goOn,#btnArticle2").show();
                }else{
                    $("body").css("visibility","visible");
                    $("#goOn,#btnArticle2").hide();
                    $("#logo,#btnArticle").show();
                }
                $("section").addClass("animated fadeIn");
            });
            setTimeout(function(){
                $("section").removeClass("animated fadeIn");
            },3000);
        }else{
            alert(data.message);
        }
    });
}

function setBgColorIn(obj) {
    var timerId;
    document.ontouchmove = function(e) {
        window.clearInterval(timerId);
        timerId = window.setTimeout(setBgColorOut(obj), 0);
    }
    if($(obj).attr("class") == "btn2"){
        $(obj).css("backgroundColor","#3d8dcb");
    }else{
        $(obj).css("backgroundColor","#69bc48");
    }
}

function setBgColorOut(obj) {
    if($(obj).attr("class") == "btn2"){
        $(obj).css("backgroundColor","#449de2");
    }else{
        $(obj).css("backgroundColor","#75d150");
    }
}

function goBack(){
    window.location.href = '/howToSolveProblem/questionList.html';
}

var viewModel = function() {

};
var vm = new viewModel()
var u = navigator.userAgent;
q_id = util.getSessionStorage("q_id");

$(document).ready(function(){
    FastClick.attach(document.body);
    ko.applyBindings(vm);
    $("#logo").css("height",$(window).height()*0.2 + "px");
    $("#logo").css("lineHeight",$(window).height()*0.2 + "px");
    $("#goOn").css("height",$(window).height()*0.15 + "px");
    $("#goOn").css("lineHeight",$(window).height()*0.15 + "px");
    $("#question").css("height",$(window).height()*0.65 + "px");
    $("#btnArticle").css("height",$(window).height()*0.09 + "px");
    $("#btnArticle").css("lineHeight",$(window).height()*0.09 + "px");
    $("#btnArticle2").css("height",$(window).height()*0.07 + "px");
    $("#btnArticle2").css("lineHeight",$(window).height()*0.07 + "px");
    $(".loading").css("height",$(window).height() + "px");
    $(".loading").css("lineHeight",$(window).height() + "px");
    getMainQuestion();
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
});