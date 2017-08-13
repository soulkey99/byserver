/**
 * Created by hjy on 2016/3/23 0023.
 */

function getMoney() {
    var postObj = {};
    postObj.userID = userID;
    postObj.authSign = authSign;
    util.callServerFunction("getMoney&random="+parseInt(Math.random()*10000), postObj, function(data) {
        if(data.statusCode == 900) {
            $(".balanceText").text(parseInt(data.money/100));
        }else{
        }
    });
}

function changeBg(moneyImgId){
    $("#moneyImg1").attr("src","images/moneyImg1out.png");
    $("#moneyImg2").attr("src","images/moneyImg2out.png");
    $("#moneyImg3").attr("src","images/moneyImg3out.png");
    $("#moneyImg4").attr("src","images/moneyImg4out.png");
    $("#moneyImg5").attr("src","images/moneyImg5out.png");
    $("#moneyImg6").attr("src","images/moneyImg6out.png");
    $("#"+moneyImgId).attr("src","images/"+moneyImgId+"in.png");
}

function showSelected(obj,money){
    $(".selected").each(function(){
        $(this).css("visibility","hidden");
    });
    $(obj).find(".selected").css("visibility","visible");
    vm.rechargeValue(money);
}

function setBtnInOrOut(color){
    $(".btn").css("backgroundColor",color);
}

function setBgColor(obj,color){
    $(obj).css("color",color);
}

function paymentDialog(){
    //$(".paymentDialog").css("visibility","visible");
    //$(".paymentDialog").removeClass("animated fadeOut");
    //$(".paymentDialog").addClass("animated fadeIn");
    if(now>=start && now<=end && vm.rechargeValue() == "20"){
        vm.rechargeValue("10");
    }
    var postObj = {};
    postObj.userID = userID;
    postObj.authSign = authSign;
    postObj.amount = parseInt(vm.rechargeValue())*100;
    util.callServerFunction("charge&random="+parseInt(Math.random()*10000), postObj, function(data) {
        if(data.statusCode == 900) {
            var u = navigator.userAgent;
            if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) {//安卓手机
                if(version != null && version != "" && version != undefined && version != "undefined" && parseInt(version)>31){
                    //javascript:callcall.jsCallback("setChargeObject", JSON.stringify({money_id: data.money_id, charge: data.charge}));  //new
                    javascript:callcall.jsCallback("setCharge", JSON.stringify({"rechargeValue":(parseInt(vm.rechargeValue())*100)}));  //old
                }else{
                    javascript:callcall.jsCallback("setCharge", JSON.stringify({"rechargeValue":(parseInt(vm.rechargeValue())*100)}));  //old
                }
            } else if (u.indexOf('iPhone') > -1) {//苹果手机
                if(version != null && version != "" && version != undefined && version != "undefined" && version == "1"){
                    window.location = "/setChargeObject?pinInfo="+JSON.stringify({money_id: data.money_id, charge: data.charge});  //new
                }else{
                    window.location = "/setCharge?amount="+parseInt(vm.rechargeValue())*100;  //old
                }
            }
        }else{
            alert(data.message);
        }
    });
}

function cancelPayment(){
    $(".paymentDialog").removeClass("animated fadeIn");
    $(".paymentDialog").addClass("animated fadeOut");
    setTimeout(function(){
        $(".paymentDialog").css("visibility","hidden");
    },400);
}

function rechargeSuccess(){
    var oldMoney = parseInt($(".balanceText").text());
    $(".balanceText").text(oldMoney + parseInt(vm.rechargeValue()));
}

var viewModel = function() {
    this.rechargeValue = ko.observable("");
};
var vm = new viewModel()
var userID = util.querystring('userID')[0];
var authSign = util.querystring('authSign')[0];
var version = util.querystring('version')[0];
var now = new Date();
var start = new Date("2016/6/1 09:00:00");
var end = new Date("2016/6/15 23:59:59");
$(document).ready(function(){
    FastClick.attach(document.body);
    ko.applyBindings(vm);
    $("footer").css("height",$(window).height()*0.25 + "px");
    $("footer").css("lineHeight",$(window).height()*0.25 + "px");
    $(".paymentDialog").css("height",$(window).height() + "px");
    $(".paymentDialog").css("lineHeight",$(window).height() + "px");
    getMoney();
    $("body").css("visibility","visible");
    $("body").addClass("animated fadeIn");
    setTimeout(function(){
        $("body").removeClass("animated fadeIn");
    },1000);
    if(now>=start && now<=end){
        $("#money20").text("10");
    }
});