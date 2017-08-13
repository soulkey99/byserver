/**
 * Created by hjy on 2016/3/31 0031.
 */

function getSubjects(){
    var postObj = {};
    postObj.userID = userID;
    postObj.authSign = authSign;
    util.callServerFunctionV2('getSeniorUpgradeStatus&random='+parseInt(Math.random()*10000), postObj, function(data) {
        if (data.statusCode == 900) {
            for(var i=0;i<data.seniorGSList.length;i++){
                vm.subjectList.push({
                    "htmlText":"<div class='large-6 medium-6 small-6 columns subjectDiv'>"+
                            "<img src='images/updateSuccess.png'>"+
                            "<div class='subjectTextDiv' style='position: relative'>"+
                            "<div>"+ data.seniorGSList[i].grade + data.seniorGSList[i].subject +"</div>"+
                            "<div class='pay'><img src='images/payImg.png'></div>"+
                            "</div>"+
                            "</div>"
                });
            }

            for(var m=0;m<data.pendingSeniorGSList.length;m++){
                vm.subjectList.push({
                    "htmlText":"<div class='large-6 medium-6 small-6 columns subjectDiv' style='position: relative;'>"+
                            "<div>"+
                            "<img class='rolling' src='images/loading.png'>"+
                            "</div>"+
                            "<div class='reviewText'>审核中</div>"+
                            "<div class='subjectTextDiv'>"+ data.pendingSeniorGSList[m].grade + data.pendingSeniorGSList[m].subject +"</div>"+
                            "</div>"
                });
            }

            for(var n=0;n<data.gsList.length;n++){
                if(data.gsList[n].process == "100"){
                    vm.subjectList.push({
                        "htmlText":"<div class='large-6 medium-6 small-6 columns subjectDiv' onclick='selectSubject(this)'>"+
                                    "<img src='images/updateOut.png'>"+
                                    "<div class='subjectTextDiv'>"+ data.gsList[n].grade + data.gsList[n].subject +"</div>"+
                                    "</div>"
                    });
                }else{
                    vm.subjectList.push({
                        "htmlText":"<div class='large-6 medium-6 small-6 columns subjectDiv'>"+
                        "<div id='indicatorContainer"+ n +"'></div>"+
                        "<div class='subjectTextDiv'>"+ data.gsList[n].grade + data.gsList[n].subject +"</div>"+
                        "</div>"
                    });
                    $("#indicatorContainer"+n).radialIndicator({
                        barColor: "#449de2",
                        barWidth: 40,
                        initValue: 0,
                        roundCorner : true,
                        percentage: true,
                        fontColor: "#666666",
                        fontSize: 60,
                        radius: 200
                    });
                    var radialObj = $("#indicatorContainer"+n).data("radialIndicator");
                    radialObj.animate(data.gsList[n].process);
                    $("#indicatorContainer"+n).height($("#indicatorContainer"+n).width());
                }
            }
        }
    });
}

function selectSubject(obj){
    $(obj).find("img").removeClass("animated bounceIn");
    if($(obj).find("img").attr("src") == "images/selected.png"){
        $(obj).find("img").attr("src","images/updateOut.png");
        vm.subjects.shift($(obj).find(".subjectTextDiv").text());
    }else{
        $(obj).find("img").attr("src","images/selected.png");
        $(obj).find("img").addClass("animated bounceIn");
        vm.subjects.push($(obj).find(".subjectTextDiv").text());
    }
}

function changeBtn(obj,sign){
    if(sign == "in"){
        $(obj).css("backgroundColor","#3d8dcb");
    }else if(sign == "out"){
        $(obj).css("backgroundColor","#449de2");
    }
}

function subSubjects(){
    util.setSessionStorage("subjects",vm.subjects());
    window.location.href = "/applyForCollectTeacher/teacherInfo.html";
}

var viewModel = function() {
    this.subjectList = ko.observableArray();
    this.subjects = ko.observableArray();
};
var vm = new viewModel()
var userID = util.querystring('userID')[0];
var authSign = util.querystring('authSign')[0];
util.setSessionStorage("userID",userID);
util.setSessionStorage("authSign",authSign);
$(document).ready(function(){
    FastClick.attach(document.body);
    getSubjects();
    $("footer").css("height",$(window).height()*0.09 + "px");
    $("footer").css("lineHeight",$(window).height()*0.09 + "px");
    ko.applyBindings(vm);
    $("body").css("visibility","visible");
    $("body").addClass("animated fadeIn");
    setTimeout(function(){
        $("body").removeClass("animated fadeIn");
    },1000);
});