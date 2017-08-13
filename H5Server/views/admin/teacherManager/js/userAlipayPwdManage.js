/**
 * Created by hjy on 2016/2/22 0022.
 */

function subLoadUserAlipayPwdList(){
    if($("#uId").val() == "" || $("#uPhone").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请填写用户ID 或 用户手机号！"
        })
    }else{
        vm.startPos(1);
        vm.pageSize(15);
        loadUserAlipayPwdList();
    }
}

function loadUserAlipayPwdList(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startPos = (vm.startPos()-1)*vm.pageSize()+1;
    postObj.pageSize = vm.pageSize();
    postObj.u_id = $("#uId").val();
    postObj.phone = $("#uPhone").val();
    util.callServerFunction('adminGetUserSecureQuestions', postObj, function (data) {
        if (data.statusCode == 900) {
            vm.answer1(data.result.answer1);
            vm.answer2(data.result.answer2);
            vm.answer3(data.result.answer3);
            postObj = {};
            postObj.userID = util.getSessionStorage("userID");
            postObj.authSign = util.getSessionStorage("authSign");
            postObj.u_id = $("#uId").val();
            postObj.phone = $("#uPhone").val();
            util.callServerFunction('adminGetUserWithdrawInfo', postObj, function (data) {
                if (data.statusCode == 900) {
                    vm.alipayId(data.info[0].id);
                    vm.alipayName(data.info[0].name);
                    vm.alipayType(data.info[0].type);
                    vm.alipayTime(util.convertTime2Str(data.info[0].t));
                } else {
                    errorCodeApi(data.statusCode);
                }
            });
        } else if(data.statusCode == 902) {
            $.dialog({
                icon: 'icon icon-warning',
                title: '提示信息',
                content: data.message
            })
        } else {
            errorCodeApi(data.statusCode);
        }
    });
}

function resetPwd(){
    $.confirm({
        icon: 'fontawesome-warning-sign',
        title: '提示信息',
        content: "确认清除用户支付密码吗？",
        confirmButton: "<span class='fontawesome-ok'></span>&nbsp;&nbsp;确定",
        cancelButton: "<span class='fontawesome-remove'></span>&nbsp;&nbsp;取消",
        confirm: function() {
            var postObj = {};
            postObj.userID = util.getSessionStorage("userID");
            postObj.authSign = util.getSessionStorage("authSign");
            postObj.u_id = $("#uId").val();
            postObj.phone = $("#uPhone").val();
            util.callServerFunction('adminClearUserPayPasswd', postObj, function (data) {
                if (data.statusCode == 900) {
                    util.toast("清除成功", "success", "提示信息");
                } else if(data.statusCode == 902) {
                    $.dialog({
                        icon: 'icon icon-warning',
                        title: '提示信息',
                        content: data.message
                    })
                } else {
                    errorCodeApi(data.statusCode);
                }
            });
        }
    })
}

function resetQuestions(){
    $.confirm({
        icon: 'fontawesome-warning-sign',
        title: '提示信息',
        content: "确认清除用户密保问题吗？",
        confirmButton: "<span class='fontawesome-ok'></span>&nbsp;&nbsp;确定",
        cancelButton: "<span class='fontawesome-remove'></span>&nbsp;&nbsp;取消",
        confirm: function() {
            var postObj = {};
            postObj.userID = util.getSessionStorage("userID");
            postObj.authSign = util.getSessionStorage("authSign");
            postObj.u_id = $("#uId").val();
            postObj.phone = $("#uPhone").val();
            util.callServerFunction('adminClearUserSecureQuestions', postObj, function (data) {
                if (data.statusCode == 900) {
                    util.toast("清除成功", "success", "提示信息");
                } else if(data.statusCode == 902) {
                    $.dialog({
                        icon: 'icon icon-warning',
                        title: '提示信息',
                        content: data.message
                    })
                } else {
                    errorCodeApi(data.statusCode);
                }
            });
        }
    })
}

function resetBills(){
    $.confirm({
        icon: 'fontawesome-warning-sign',
        title: '提示信息',
        content: "确认清除用户提现信息吗？",
        confirmButton: "<span class='fontawesome-ok'></span>&nbsp;&nbsp;确定",
        cancelButton: "<span class='fontawesome-remove'></span>&nbsp;&nbsp;取消",
        confirm: function() {
            var postObj = {};
            postObj.userID = util.getSessionStorage("userID");
            postObj.authSign = util.getSessionStorage("authSign");
            postObj.u_id = $("#uId").val();
            postObj.phone = $("#uPhone").val();
            util.callServerFunction('adminClearUserWithdrawInfo', postObj, function (data) {
                if (data.statusCode == 900) {
                    util.toast("清除成功", "success", "提示信息");
                } else if(data.statusCode == 902) {
                    $.dialog({
                        icon: 'icon icon-warning',
                        title: '提示信息',
                        content: data.message
                    })
                } else {
                    errorCodeApi(data.statusCode);
                }
            });
        }
    })
}

var viewModel = function(){
    this.answer1 = ko.observable("");
    this.answer2 = ko.observable("");
    this.answer3 = ko.observable("");
    this.alipayId = ko.observable("");
    this.alipayName = ko.observable("");
    this.alipayType = ko.observable("");
    this.alipayTime = ko.observable("");
    this.startPos = ko.observable(1);
    this.pageSize = ko.observable(15);
    this.resetPwd = resetPwd;
    this.resetQuestions = resetQuestions;
    this.resetBills = resetBills;
};
var vm = new viewModel();
var date = new Date();
$(document).ready(function(){
    ko.applyBindings(vm,document.getElementById("userAlipayPwdTable"));
    $('.selectpicker').selectpicker({
        style: 'btn btn-info'
    });
    $('.btn-group').css("width","100%");
    document.onkeydown = function(event){
        var e = event ? event :(window.event ? window.event : null);
        if(e.keyCode==13){
            subLoadUserAlipayPwdList();
            return false;
        }
    }
});