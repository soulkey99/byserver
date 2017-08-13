/**
 * Created by hjy on 2015/11/11 0011.
 */

function loadBonus(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    util.callServerFunction('adminGetBonusConfig', postObj, function (data) {
        if (data.statusCode == 900) {
            vm.newReg(data.config.newReg);
            vm.genOrder(data.config.genOrder);
            vm.grabOrder(data.config.grabOrder);
            vm.fillProfile(data.config.fillProfile);
            vm.shareClient(data.config.shareClient);
            vm.inviteUser(data.config.inviteUser);
            $('.selectpicker').selectpicker({
                style: 'btn btn-info'
            });
            $('.btn-group').css("width","25%");
        } else {
            errorCodeApi(data.statusCode);
        }
    });
}

function setBonus(){
    if(vm.newReg() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"您还没有设置 新注册用户奖励  (●'◡'●)"
        })
    }else if(vm.genOrder() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"您还没有设置 提问奖励  (●'◡'●)"
        })
    }else if(vm.grabOrder() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"您还没有设置 抢单答题奖励  (●'◡'●)"
        })
    }else if(vm.fillProfile() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"您还没有设置 完善资料奖励  (●'◡'●)"
        })
    }else if(vm.inviteUser() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"您还没有设置 邀请用户奖励  (●'◡'●)"
        })
    }else{
        var postObj = {};
        postObj.userID = util.getSessionStorage("userID");
        postObj.authSign = util.getSessionStorage("authSign");
        postObj.newReg = vm.newReg();
        postObj.genOrder = vm.genOrder();
        postObj.grabOrder = vm.grabOrder();
        postObj.fillProfile = vm.fillProfile();
        postObj.inviteUser = vm.inviteUser();
        util.callServerFunction('adminSetBonusConfig', postObj, function (data) {
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
        confirm: setBonus
    });
}

var viewModel = function(){
    this.newReg = ko.observable("");
    this.genOrder = ko.observable("");
    this.grabOrder = ko.observable("");
    this.fillProfile = ko.observable("");
    this.shareClient = ko.observable("");
    this.inviteUser = ko.observable("");
    this.loadBonus = loadBonus;
    this.setBonus = setBonus;
    this.confirm = confirm;
};
var vm = new viewModel();
$(document).ready(function(){;
    ko.applyBindings(vm,document.getElementById("bonusManage"));
    loadBonus();
    document.onkeydown = function(event){
        e = event ? event :(window.event ? window.event : null);
        if(e.keyCode==13){
            confirm();
            return false;
        }
    }
});