/**
 * Created by hjy on 2015/11/11 0011.
 */

function loadAntiCheat(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    util.callServerFunction('adminGetAntiCheatConfig', postObj, function (data) {
        if (data.statusCode == 900) {
            vm.time(data.config.time);
            vm.finished(data.config.finished);
            vm.duration(data.config.duration);
            vm.canceled(data.config.canceled);
            vm.abandon(data.config.abandon);
            vm.sms(data.config.sms + '');
            vm.bonus(data.config.bonus);
            $('.selectpicker').selectpicker({
                style: 'btn btn-info'
            });
            $('.btn-group').css("width","25%");
        } else {
            errorCodeApi(data.statusCode);
        }
    });
}

function setAntiCheat(){
    if(vm.time() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"您还没有填写 统计在多少时间内的数据  (●'◡'●)"
        })
    }else if(vm.finished() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"您还没有填写 完成订单数  (●'◡'●)"
        })
    }else if(vm.duration() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"您还没有填写 完成订单的持续时间  (●'◡'●)"
        })
    }else if(vm.canceled() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"您还没有填写 取消订单数  (●'◡'●)"
        })
    }else if(vm.abandon() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"您还没有填写 封禁的时间（小时）  (●'◡'●)"
        })
    }else if(vm.sms() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"您还没有选择 是否发送短信通知  (●'◡'●)"
        })
    }else if(vm.bonus() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"您还没有填写 每次扣减积分数  (●'◡'●)"
        })
    }else{
        var postObj = {};
        postObj.userID = util.getSessionStorage("userID");
        postObj.authSign = util.getSessionStorage("authSign");
        postObj.time = vm.time();
        postObj.finished = vm.finished();
        postObj.duration = vm.duration();
        postObj.canceled = vm.canceled();
        postObj.abandon = vm.abandon();
        postObj.sms = vm.sms();
        postObj.bonus = vm.bonus();
        util.callServerFunction('adminSetAntiCheatConfig', postObj, function (data) {
            if (data.statusCode == 900) {
                util.toast("设置成功！","success","系统提示");
            } else {
                errorCodeApi(data.statusCode);
            }
        });
    }
}

function confirm(){
    $.confirm({
        icon: 'icon icon-warning',
        title: '提示信息',
        content:"您确定要保存当前设置吗？",
        confirmButton: "<span class='fontawesome-ok'></span>&nbsp;&nbsp;保存",
        cancelButton: "<span class='fontawesome-remove'></span>&nbsp;&nbsp;取消",
        confirm: setAntiCheat
    })
}

var viewModel = function(){
    this.time = ko.observable("");
    this.finished = ko.observable("");
    this.duration = ko.observable("");
    this.canceled = ko.observable("");
    this.abandon = ko.observable("");
    this.sms = ko.observable("");
    this.bonus = ko.observable("");
    this.loadAntiCheat = loadAntiCheat;
    this.setAntiCheat = setAntiCheat;
    this.confirm = confirm;
};
var vm = new viewModel();
$(document).ready(function(){
    ko.applyBindings(vm,document.getElementById("antiCheatManage"));
    loadAntiCheat();
    document.onkeydown = function(event){
        e = event ? event :(window.event ? window.event : null);
        if(e.keyCode==13){
            confirm();
            return false;
        }
    }
});