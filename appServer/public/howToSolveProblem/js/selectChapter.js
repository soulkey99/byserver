/**
 * Created by hjy on 2016/5/9 0009.
 */

function loadChapters(){
    var postObj = {};
    postObj.userID = util.getSessionStorage('userID');
    postObj.authSign = util.getSessionStorage('authSign');
    postObj.ver_id = util.getSessionStorage('ver_id');
    //postObj.ver_id = "5732da6d2818dae40e529cb3";
    util.callServerFunctionV2("getStudyCatalog&random="+parseInt(Math.random()*10000), postObj, function(data) {
        if(data.statusCode == 900) {
            vm.chapters(data.list);
            $(".points").each(function(){
                $(this).hide();
            });
        }else{
            alert(data.message);
        }
    });
}

function showNote(obj) {
    if($(obj).find("img").attr("src") == "images/rightArrow.png"){
        $(obj).find("img").attr("src","images/downArrow.png");
        $(obj).next().slideDown();
    }else{
        $(obj).find("img").attr("src","images/rightArrow.png");
        $(obj).next().slideUp();
    }
}

function setBgColorIn(obj) {
    var timerId;
    document.ontouchmove = function(e) {
        window.clearInterval(timerId);
        timerId = window.setTimeout(setBgColorOut(obj), 0);
    }
    $(obj).css("backgroundColor","#dfdfdf");
}

function setBgColorOut(obj) {
    $(obj).css("backgroundColor","#ededed");
}

function selectPoint(){
    util.setSessionStorage("sec_id",this.sec_id);
    window.location.href = '/howToSolveProblem/questionList.html';
}

function goBack(){
    window.location.href = '/howToSolveProblem/selectTextbook.html';
}

var viewModel = function() {
    this.chapters = ko.observableArray();
    this.selectPoint = selectPoint;
};
var vm = new viewModel();
$(document).ready(function() {
    FastClick.attach(document.body);
    ko.applyBindings(vm);
    $(".head").css("height",$(window).height()*0.18 + "px");
    $(".chapterList").css("height",$(window).height()*0.78 + "px");
    loadChapters();
    $("body").css("visibility","visible");
    $("body").addClass("animated fadeIn");
    $(".head").find("img").attr("src",util.getSessionStorage("cover"));
});