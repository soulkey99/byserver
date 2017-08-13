/**
 * Created by hjy on 2016/1/22 0022.
 */

function getUserInfo(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    util.callServerFunction('getWithdrawInfo&random='+parseInt(Math.random()*10000), postObj, function(data) {
        if(data.statusCode == 900) {
            vm.userNick(data.info[0].name);
            vm.userName(data.info[0].id);
            $("body").css("visibility","visible");
            $("body").addClass("animated fadeIn");
        } else {
            util.errorCodeAlert(data.statusCode);
        }
    });
}

var viewModel = function(){
    this.userName = ko.observable("");
    this.userNick = ko.observable("");
};
var vm = new viewModel();
$(document).ready(function(){
    ko.applyBindings(vm);
    getUserInfo();
    $(".errorText").text(util.getSessionStorage("message"));
});