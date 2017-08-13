/**
 * Created by hjy on 2016/6/15 0015.
 */

function loadQuestions(){
    var postObj = {};
    postObj.userID = util.getSessionStorage('userID');
    postObj.authSign = util.getSessionStorage('authSign');
    postObj.sec_id = util.getSessionStorage('sec_id');
    util.callServerFunctionV2("getStudySectionQuestions&random="+parseInt(Math.random()*10000), postObj, function(data) {
        if(data.statusCode == 900) {
            vm.questions(data.list);
            MathJax.Hub.Queue(["Typeset",MathJax.Hub, "main"]);
            MathJax.Hub.Queue(function(){
                $("body").css("backgroundColor","#fafafa");
                $(".loading").remove();
                $(".MathJax_Display").attr("style","display: -webkit-inline-box !important");
                $("#main").css("visibility", "visible");
                $("#main").addClass("animated fadeIn");
                setTimeout(function(){
                    $("#main").removeClass("animated fadeIn");
                },1500);
            });
        }else{
            alert(data.message);
        }
    });
}

function selectQ(){
    util.setSessionStorage("q_id",this.q_id);
    window.location.href = '/howToSolveProblem/mainQuestions.html';
}

function setBgColor(obj,color) {
    $(obj).css("backgroundColor",color);
}

function goBack(){
    window.location.href = '/howToSolveProblem/selectChapter.html';
}

var viewModel = function() {
    this.questions = ko.observableArray();
    this.selectQ = selectQ;
};
var vm = new viewModel();
$(document).ready(function() {
    FastClick.attach(document.body);
    $(".loading").css("height",$(window).height() + "px");
    $(".loading").css("lineHeight",$(window).height() + "px");
    ko.applyBindings(vm);
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
    loadQuestions();
});