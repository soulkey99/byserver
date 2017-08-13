/**
 * Created by hjy on 2016/6/7 0007.
 */

function getUserInfo(){
    var postObj = {};
    postObj.userID = userID;
    postObj.authSign = authSign;
    util.callServerFunctionV2("getStrength&random="+parseInt(Math.random()*10000), postObj, function(data) {
        if(data.statusCode == 900) {
            $("body").css("visibility","visible");
            $(".levelText").text(data.result.level);
            $(".xueFenValue").text(data.result.bonus);
            $(".naoLiValue").text(data.result.intellectual);
            $(".tiLiValue").text(data.result.strength);
            $("body").addClass("animated fadeIn");
            setTimeout(function(){
                $("body").removeClass("animated fadeIn");
            },1000);
        }else{
            alert(data.message);
        }
    });
}

function charge(){
    closeDialog();
    var u = navigator.userAgent;
    if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) {//安卓手机
        //javascript:callcall.jsCallback("setChargeObject", JSON.stringify({money_id: data.money_id, charge: data.charge}));
        if(vm.sign() == "fen"){
            javascript:callcall.jsCallback("setCharge", JSON.stringify({"rechargeValue": vm.value()+"_f"}));  //old
        }else if(vm.sign() == "ti"){
            javascript:callcall.jsCallback("setCharge", JSON.stringify({"rechargeValue": vm.value()+"_t"}));  //old
        }
    } else if (u.indexOf('iPhone') > -1) {//苹果手机
        var postObj = {};
        postObj.userID = userID;
        postObj.authSign = authSign;
        if(vm.sign() == "fen"){
            postObj.bonus = vm.value();
        }else if(vm.sign() == "ti"){
            postObj.strength = vm.value();
        }
        util.callServerFunction("gameBuy&random="+parseInt(Math.random()*10000), postObj, function(data) {
            if(data.statusCode == 900) {
                window.location = "/setChargeObject?pinInfo=" + JSON.stringify({money_id: data.money_id, charge: data.charge});
            }else{
                alert(data.message);
            }
        });
    }
}

function changeBg(obj){
    if($(obj).children(":first").attr("src") == "images/fenOut.png"){
        $(obj).children(":first").attr("src","images/fenIn.png");
    }else if($(obj).children(":first").attr("src") == "images/fenIn.png"){
        $(obj).children(":first").attr("src","images/fenOut.png");
    }else if($(obj).children(":first").attr("src") == "images/tiOut.png"){
        $(obj).children(":first").attr("src","images/tiIn.png");
    }else if($(obj).children(":first").attr("src") == "images/tiIn.png"){
        $(obj).children(":first").attr("src","images/tiOut.png");
    }
}

function showDialog(sign,value,money){
    $(".dialogBg, .dialog").show();
    vm.sign(sign);
    vm.value(value);
    vm.money(money);
}

function closeDialog(){
    $(".dialogBg, .dialog").hide();
}

function rechargeSuccess(){
    setTimeout(function(){
        var postObj = {};
        postObj.userID = userID;
        postObj.authSign = authSign;
        util.callServerFunctionV2("getStrength&random="+parseInt(Math.random()*10000), postObj, function(data) {
            if(data.statusCode == 900) {
                $(".levelText").text(data.result.level);
                $(".xueFenValue").text(data.result.bonus);
                $(".naoLiValue").text(data.result.intellectual);
                $(".tiLiValue").text(data.result.strength);
            }else{
                alert(data.message);
            }
        });
    },1000);
}

var viewModel = function() {
    this.sign = ko.observable("");
    this.money = ko.observable("");
    this.value = ko.observable("");
};
var vm = new viewModel()
var userID = util.querystring('userID')[0];
var authSign = util.querystring('authSign')[0];
$(document).ready(function(){
    FastClick.attach(document.body);
    ko.applyBindings(vm);
    $("header").css("height",$(window).height()*0.23 + "px");
    $(".dialogBg").css("height",$(window).height() + "px");
    $(".dialogBg").css("lineHeight",$(window).height() + "px");
    $(".dialogBg, .dialog").hide();
    getUserInfo();
});