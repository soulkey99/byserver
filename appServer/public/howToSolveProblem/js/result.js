/**
 * Created by hjy on 2016/5/4 0004.
 */

function getExerciseResult(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.e_id = util.getSessionStorage("e_id");
    util.callServerFunctionV2("getExerciseResult&random="+parseInt(Math.random()*10000), postObj, function(data) {
        if(data.statusCode == 900) {
            vm.percent(data.info.percent);
            $(".subjectDiv").css("height",$(window).height()*0.25 + "px");
            $(".progressDiv").css("height",$(window).height()*0.49 + "px");
            $(".resultDiv").css("height",$(window).height()*0.2 + "px");
            $(".menuDiv").css("height",$(window).height()*0.06 + "px");
            $("body").css("visibility","visible");
            $("body").addClass("animated fadeIn");
            var opts = {
                lines: 12, // The number of lines to draw
                angle: 0.35, // The length of each line
                lineWidth: 0.03, // The line thickness
                pointer: {
                    length: 0.9, // The radius of the inner circle
                    strokeWidth: 0.035, // The rotation offset
                    color: '#5db2f4' // Fill color
                },
                limitMax: 'false',   // If true, the pointer will not go past the end of the gauge
                colorStart: '#5db2f4',   // Colors
                colorStop: '#5db2f4',    // just experiment with them
                strokeColor: '#eeeeee',   // to see which ones work best for you
                generateGradient: true
            };
            var target = document.getElementById("progressCanvas"); // your canvas element
            var gauge = new Donut(target).setOptions(opts); // create sexy gauge!
            gauge.setTextField(document.getElementById("textfield"));
            gauge.maxValue = 100; // set max gauge value
            gauge.animationSpeed = 32; // set animation speed (32 is default value)
            if(parseInt(data.info.point) == 0){
                gauge.set(0.00001);
            }else{
                gauge.set(parseInt(data.info.point));
            }
            $("#progressCanvas").css("width",$(window).width());
            $("#progressCanvas").css("height","auto");
            $(".peopleNum").hide();
            $(".resultDiv").find("img").hide();
            var x = 0, time = 200;
            setInterval(function(){
                if(time > 0){
                    $(".world").css("backgroundPosition", x + "px 0px");
                    x -= time/10;
                    time -= 1;
                }else{
                    $(".world").css("backgroundPosition", x + "px 0px");
                    x -= 1;
                    time -= 1;
                }
                if(time == 0){
                    $(".peopleNum").show();
                    $(".peopleNum").addClass("animated tada");
                    setTimeout(function(){
                        $(".resultDiv").find("img").show();
                        $(".resultDiv").find("img").addClass("animated tada");
                    },1000);
                }
            }, 5);
        }else{
            alert(data.message);
        }
    });
}

function toReview(){
    window.location.href = "/howToSolveProblem/review.html";
}

function outward(){
    var postObj = {};
    //postObj.userID = "54f3b5fec08b6f54100c1cbe";
    //postObj.authSign = "z";
    //postObj.q_id = "5760eef2d926b5352c47cb61";
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.q_id = util.getSessionStorage("q_id");
    postObj.type = "enhance";
    postObj.limit = 1;
    util.callServerFunctionV2("getStudyQuestionExtra&random="+parseInt(Math.random()*10000), postObj, function(data) {
        if(data.statusCode == 900) {
            if(data.list.length == 0){
                alert("同学，你已经天下无敌！请挑战其它教材题目！");
            }else{
                util.setSessionStorage("q_id",data.list[0].q_id);
                window.location.href = "/howToSolveProblem/mainQuestions.html";
            }
        }else{
            alert(data.message);
        }
    });

}

function gotoQuestionList(){
    window.location.href = "/howToSolveProblem/questionList.html";
}

function goBack(){
    window.location.href = '/howToSolveProblem/questionList.html';
}

var viewModel = function() {
    this.percent = ko.observable("");
};
var vm = new viewModel();
$(document).ready(function(){
    FastClick.attach(document.body);
    ko.applyBindings(vm);
    getExerciseResult();
});