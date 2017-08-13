/**
 * Created by hjy on 2016/5/6 0006.
 */

function loadTextBooks(){
    var postObj = {};
    postObj.userID = userID;
    postObj.authSign = authSign;
    postObj.stage = stage;
    postObj.grade = grade;
    postObj.subject = subject;
    postObj.city = city;
    util.callServerFunctionV2("getStudyVersionList&random="+parseInt(Math.random()*10000), postObj, function(data) {
        if(data.statusCode == 900) {
            vm.textBooks(data.list);
            $("#textbooks").append("<div id='getMore' class='large-4 medium-4 small-4 columns bookDiv'><img class='book' src='images/moreBook.png' onclick='getMore()'></div>");
        }else{
            alert(data.message);
        }
    });
}

function getMore(){
    var postObj = {};
    postObj.userID = userID;
    postObj.authSign = authSign;
    postObj.stage = stage;
    postObj.grade = grade;
    postObj.subject = subject;
    postObj.city = city;
    postObj.action = "getMore";
    util.callServerFunctionV2("getStudyVersionList&random="+parseInt(Math.random()*10000), postObj, function(data) {
        if(data.statusCode == 900) {
            for(var i=0;i<data.list.length;i++){
                vm.textBooks.push(data.list[i]);
            }
            $("#getMore").remove();
        }else{
            alert(data.message);
        }
    });
}

function selectTextBook(){
    util.setSessionStorage("ver_id",this.ver_id);
    util.setSessionStorage("cover",this.cover);
    window.location.href = "/howToSolveProblem/selectChapter.html";
}

function goBack(){
    var u = navigator.userAgent;
    if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) {//安卓手机
        javascript:callcall.jsCallback("closeWebView", JSON.stringify({}));
    } else if (u.indexOf('iPhone') > -1) {//苹果手机
        window.location = "/closeWebView";  //old
    }
}

var viewModel = function() {
    this.textBooks = ko.observableArray();
    this.selectTextBook = selectTextBook;
};
var vm = new viewModel()
    ,stage = ""
    ,grade = ""
    ,subject = ""
    ,city = ""
    ,userID = ""
    ,authSign = ""
if(util.getQueryString("userID") != "" && util.getQueryString("userID") != undefined && util.getQueryString("userID") != "undefined" && util.getQueryString("userID") != null){
    stage = util.getQueryString("stage");
    grade = util.getQueryString("grade");
    subject = util.getQueryString("subject");
    city = util.getQueryString("city");
    userID = util.getQueryString("userID");
    authSign = util.getQueryString("authSign");
    util.setSessionStorage("stage",stage);
    util.setSessionStorage("grade",grade);
    util.setSessionStorage("subject",subject);
    util.setSessionStorage("city",city);
    util.setSessionStorage("userID",userID);
    util.setSessionStorage("authSign",authSign);
}else{
    stage = util.getSessionStorage("stage");
    grade = util.getSessionStorage("grade");
    subject = util.getSessionStorage("subject");
    city = util.getSessionStorage("city");
    userID = util.getSessionStorage("userID");
    authSign = util.getSessionStorage("authSign");
}

// test start
//stage = "初中";
//grade = "九年级上";
//subject = "数学";
//city = "沈阳";
//userID = "54f3b5fec08b6f54100c1cbe";
//authSign = "z";
util.setSessionStorage("stage",stage);
util.setSessionStorage("grade",grade);
util.setSessionStorage("subject",subject);
util.setSessionStorage("city",city);
util.setSessionStorage("userID",userID);
util.setSessionStorage("authSign",authSign);
// test end

$(document).ready(function() {
    FastClick.attach(document.body);
    ko.applyBindings(vm);
    $(".title").css("height",$(window).height()*0.2 + "px");
    $(".title").css("lineHeight",$(window).height()*0.2 + "px");
    $(".textBookList").css("height",$(window).height()*0.8 + "px");
    loadTextBooks();
    $("body").css("visibility","visible");
    $("body").addClass("animated fadeIn");
});