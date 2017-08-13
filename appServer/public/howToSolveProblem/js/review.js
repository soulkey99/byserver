/**
 * Created by hjy on 2016/5/6 0006.
 */

function getExerciseReview(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.e_id = util.getSessionStorage("e_id");
    util.callServerFunctionV2("getExerciseReview&random="+parseInt(Math.random()*10000), postObj, function(data) {
        if(data.statusCode == 900) {
            vm.reviewList(data.info.list);
            vm.rootReview(data.info.root);
            MathJax.Hub.Queue(["Typeset",MathJax.Hub, "questionText"]);
            MathJax.Hub.Queue(["Typeset",MathJax.Hub, "content"]);
            MathJax.Hub.Queue(function(){
                $("body").css("visibility","visible");
                $("body").addClass("animated fadeIn");
                $("body").removeClass("animated fadeIn");
            });
        }else{
            alert(data.message);
        }
    });
}

function goBack(){
    window.location.href = '/howToSolveProblem/result.html';
}

var viewModel = function() {
    this.reviewList = ko.observableArray();
    this.rootReview = ko.observable("");
};
var vm = new viewModel();
$(document).ready(function() {
    FastClick.attach(document.body);
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
    getExerciseReview();
});