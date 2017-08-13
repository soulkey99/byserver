/**
 * Created by hjy on 2016/2/5 0005.
 */

function subLoadBetaUserManageList(){
    vm.startPos(1);
    vm.pageSize(15);
    loadBetaUserManageList();
}

function loadBetaUserManageList(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startPos = (vm.startPos()-1)*vm.pageSize()+1;
    postObj.pageSize = vm.pageSize();
    postObj.u_id = $("#uId").val();
    postObj.phone = $("#uPhone").val();
    postObj.platform = $("#platform").val();
    postObj.userType = $("#userType").val();
    util.callServerFunction('adminGetBetalist', postObj, function (data) {
        if (data.statusCode == 900) {
            vm.betaUserManageList.removeAll();
            if (data.list.length > 0) {
                var list = [];
                for (var i = 0; i < data.list.length; i++) {
                    var config = "", userType ="";
                    for(var c in data.list[i].config){
                        config += c + ":" + data.list[i].config[c] + "<br>";
                    }
                    if(data.list[i].userType.length > 1){
                        userType = "教师&学生";
                    }else if(data.list[i].userType[0] == "teacher"){
                        userType = "教师";
                    }else if(data.list[i].userType[0] == "student"){
                        userType = "学生";
                    }
                    list.push({
                        id: (i + 1),
                        userID: data.list[i].userID,
                        start_time: util.convertTime2Str(data.list[i].start_time),
                        end_time: util.convertTime2Str(data.list[i].end_time),
                        config: data.list[i].config,
                        configText: config,
                        userType: data.list[i].userType,
                        userTypeText: userType,
                        platform: data.list[i].platform,
                        type: data.list[i].type,
                        beta_id: data.list[i].beta_id,
                        nick: data.list[i].nick,
                        phone: data.list[i].phone,
                        avatar: data.list[i].avatar
                    });
                }
                vm.betaUserManageList(list);
                $('i').tooltip({
                    "margin-top": "50px"
                });
            } else if (vm.startPos() != 1) {
                vm.startPos(vm.startPos() - 1);
                loadBetaUserManageList();
                $.dialog({
                    icon: 'icon icon-warning',
                    title: '提示信息',
                    content: "您已经在最后一页了！"
                })
            }
        } else {
            errorCodeApi(data.statusCode);
        }
    });
}

function prevPage(){
    if(vm.startPos()==1){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"您已经在第一页了！"
        })
    }else{
        vm.startPos(vm.startPos()-1);
        loadBetaUserManageList();
    }
}

function nextPage(){
    vm.startPos(vm.startPos()+1);
    loadBetaUserManageList();
}

function editBeta(){
    var html = "<input type='hidden' id='beta_id' value='"+ this.beta_id +"'>" +
        "<input type='hidden' id='u_id' value='"+ this.userID +"'>" +
        "<div class='form-group'>" +
        "<label>用户昵称："+ this.nick +"</label>" +
        "</div>" +
        "<div class='form-group'>" +
        "<label>生效时间：</label>" +
        "<input id='startTime' class='form-control' data-format='yyyy/MM/dd hh:mm:ss' type='text'>" +
        "</div>" +
        "<div class='form-group'>" +
        "<label>失效时间：</label>" +
        "<input id='endTime' class='form-control' data-format='yyyy/MM/dd hh:mm:ss' type='text'>" +
        "</div>" +
        "<div class='form-group'>" +
        "<label>操作系统：</label>" +
        "<select id='platformEdit' class='form-control valid'>" +
        "<option value=''>-请选择-</option>" +
        "<option value='android,ios'>全部</option>" +
        "<option value='android'>安卓Android</option>" +
        "<option value='ios'>苹果IOS</option>" +
        "</select>" +
        "</div>" +
        "<div class='form-group'>" +
        "<label>用户类型：</label>" +
        "<select id='userTypeEdit' class='form-control valid'>" +
        "<option value=''>-请选择-</option>" +
        "<option value='student,teacher'>全部</option>" +
        "<option value='teacher'>教师</option>" +
        "<option value='student'>学生</option>" +
        "</select>" +
        "</div>" +
        "<div class='form-group'>" +
        "<label>用户配置：<a href='javascript:void(0)' onclick='addUserConfig()'><span class='entypo-plus'></span>添加配置</a></label>" +
        "<div id='userConfig'>" +
        "<div class='row'><div class='col-lg-5 column text-center'><span class='entypo-cog'></span>配置名称</div><div class='col-lg-5 column text-center'><span class='entypo-key'></span>配置开关</div><div class='col-lg-2 column text-center'><span class='entypo-tools'></span>操作</div></div>" +
        "</div>" +
        "</div>" +
        "<div align='center'><button class='btn btn-primary' onclick='subEditBeta()'>提 交</button></div>";
    dialog = $.dialog({
        icon: "icon icon-document-edit",
        title: '修改测试用户',
        content: html
    });
    util.initDateTimePicker("startTime",{defaultDate: this.start_time});
    util.initDateTimePicker("endTime",{defaultDate: this.end_time});
    $("#platformEdit").val(this.platform.join(","));
    $("#userTypeEdit").val(this.userType.join(","));
    $.each(this.config,function(name,value){
        $("#userConfig").append("<div class='row' style='margin-top: 10px'><div class='col-lg-5 column text-center'><input type='text' name='configName' class='form-control' value='"+ name +"'></div><div class='col-lg-5 column text-center'><input type='text' name='configVal' class='form-control' value='"+ value +"'></div><div class='col-lg-2 column text-center' style='line-height: 31px'><a href='javascript:void(0)' onclick='delConfig(this)'><span class='entypo-trash'></span>删除配置</a></div></div>");
    });
}

function subEditBeta(){
    if($("#startTime").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择生效时间！"
        })
    }else if($("#endTime").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择失效时间！"
        })
    }else if($("#platformEdit").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择操作系统！"
        })
    }else if($("#userTypeEdit").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择用户类型！"
        })
    }else if($("input:text[name='configName']").length <= 0){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请填写用户配置！"
        })
    }else{
        var postObj = {},config = {};
        var configVals = $("input:text[name='configVal']");
        $.each($("input:text[name='configName']"),function(i, value){
            config[$(this).val()] = $(configVals[i]).val();
        });
        postObj.userID = util.getSessionStorage("userID");
        postObj.authSign = util.getSessionStorage("authSign");
        postObj.beta_id = $("#beta_id").val();
        postObj.u_id = $("#u_id").val();
        postObj.start_time = new Date($("#startTime").val()).getTime();
        postObj.end_time = new Date($("#endTime").val()).getTime();
        postObj.platform = $("#platformEdit").val();
        postObj.userType = $("#userTypeEdit").val();
        postObj.config = JSON.stringify(config);
        util.callServerFunction("adminEditBeta&random="+parseInt(Math.random()*10000), postObj, function(data) {
            if(data.statusCode == 900) {
                util.toast("操作成功", "success", "提示信息");
                dialog.close();
                subLoadBetaUserManageList();
            }
        });
    }
}

function delBeta(){
    var beta_id = this.beta_id;
    $.confirm({
        icon: 'fontawesome-warning-sign',
        title: '提示信息',
        content: "确认要删除 <span class='label label-info'>"+ this.nick +"</span> 的测试用户配置吗？",
        confirmButton: "<span class='fontawesome-ok'></span>&nbsp;&nbsp;确定",
        cancelButton: "<span class='fontawesome-remove'></span>&nbsp;&nbsp;取消",
        confirm: function() {
            var postObj = {};
            postObj.userID = util.getSessionStorage("userID");
            postObj.authSign = util.getSessionStorage("authSign");
            postObj.beta_id = beta_id;
            postObj.action = "remove";
            util.callServerFunction("adminEditBeta&random="+parseInt(Math.random()*10000), postObj, function(data) {
                if(data.statusCode == 900) {
                    util.toast("删除成功", "success", "提示信息");
                    subLoadBetaUserManageList();
                }
            });
        }
    })
}

function initAddBetaUser(){
    vm.betaUserList.removeAll();
    vm.userNick("");
    vm.userId("");
    var html = "<div class='row' id='betaUserListTable'>" +
                    "<div class='col-lg-6 column'>" +
                        "<div style='margin-top: 10px;margin-bottom: 10px'><span class='label'>检索用户</span></div>" +
                        "<div class='form-group'>" +
                            "<div class='row' style='padding: 0px 5px 0px 15px'>" +
                                "<div class='col-lg-5 column' style='padding-left: 0px'><input id='sPhone' class='form-control' type='text' placeholder='手机号'></div>" +
                                "<div class='col-lg-5 column' style='padding: 0px'><input id='sNick' class='form-control' type='text' placeholder='昵称'></div>" +
                                "<div class='col-lg-2 column'><button class='btn btn-rounded' onclick='seachBetaUser()'><span class='entypo-search'></span>&nbsp;&nbsp;检索</button></div>" +
                            "</div>" +
                        "</div>" +
                        "<div class='table-responsive'>" +
                            "<table class='table table-bordered table-striped cf'>" +
                                "<thead class='cf'>" +
                                    "<tr>" +
                                    "<th align='center' class='col-lg-4'>昵称</th>" +
                                    "<th align='center' class='col-lg-4'>电话</th>" +
                                    "<th align='center' class='col-lg-3'>操作</th>" +
                                    "</tr>" +
                                "</thead>" +
                                "<tbody data-bind='foreach: betaUserList'>" +
                                    "<tr>" +
                                    "<td align='center'><span data-bind='text: nick'></span></td>" +
                                    "<td align='center'><span data-bind='text: phone'></span></td>" +
                                    "<td align='center'>" +
                                    "<div><a href='' data-bind='click:selectUser'><span class='entypo-feather'></span>&nbsp;选择用户</a></div>" +
                                    "</td>" +
                                    "</tr>" +
                                "</tbody>" +
                            "</table>" +
                        "</div>" +
                    "</div>"+
                    "<div class='col-lg-6 column' style='border-left: 1px #CCCCCC solid'>" +
                        "<div style='margin-top: 10px;margin-bottom: 10px'><span class='label'>设置测试用户</span></div>" +
                        "<div class='form-group'>"+
                        "<label>用户昵称：<span data-bind='text: userNick'></span></label>" +
                        "</div>"+
                        "<div class='form-group'>"+
                        "<label>生效时间：</label>" +
                        "<input id='startTime' class='form-control' data-format='yyyy/MM/dd hh:mm:ss' type='text'>"+
                        "</div>"+
                        "<div class='form-group'>"+
                        "<label>失效时间：</label>" +
                        "<input id='endTime' class='form-control' data-format='yyyy/MM/dd hh:mm:ss' type='text'>"+
                        "</div>"+
                        "<div class='form-group'>"+
                        "<label>操作系统：</label>" +
                        "<select id='platformAdd' class='form-control valid'>"+
                        "<option value=''>-请选择-</option>"+
                        "<option value='android,ios'>全部</option>"+
                        "<option value='android'>安卓Android</option>"+
                        "<option value='ios'>苹果IOS</option>"+
                        "</select>"+
                        "</div>"+
                        "<div class='form-group'>"+
                        "<label>用户类型：</label>" +
                        "<select id='userTypeAdd' class='form-control valid'>"+
                        "<option value=''>-请选择-</option>"+
                        "<option value='student,teacher'>全部</option>"+
                        "<option value='teacher'>教师</option>"+
                        "<option value='student'>学生</option>"+
                        "</select>"+
                        "</div>"+
                        "<div class='form-group'>"+
                        "<label>用户配置：<a href='javascript:void(0)' onclick='addUserConfig()'><span class='entypo-plus'></span>添加配置</a></label>" +
                        "<div id='userConfig'>" +
                        "<div class='row'><div class='col-lg-5 column text-center'><span class='entypo-cog'></span>配置名称</div><div class='col-lg-5 column text-center'><span class='entypo-key'></span>配置开关</div><div class='col-lg-2 column text-center'><span class='entypo-tools'></span>操作</div></div>" +
                        "</div>" +
                        "</div>"+
                        "<div align='center'><button class='btn btn-primary' onclick='addBetaUser()'>提 交</button></div>"+
                    "</div>"+
                "</div>";
    dialog = $.dialog({
        icon: "icon icon-plus",
        title: '新增测试用户',
        content: html,
        columnClass: "col-lg-12"
    });
    util.initDateTimePicker("startTime",{defaultDate: new Date(todayStartDate)});
    util.initDateTimePicker("endTime",{defaultDate: new Date(todayEndDate)});
    ko.applyBindings(vm,document.getElementById("betaUserListTable"));
}

function seachBetaUser(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.phonenum = $("#sPhone").val();
    util.callServerFunction("adminGetUserInfo&random="+parseInt(Math.random()*10000), postObj, function(data) {
        if(data.statusCode == 900) {
            vm.betaUserList.removeAll();
            vm.betaUserList(data.list);
        }else if(data.statusCode == 902){
            $.dialog({
                icon: 'icon icon-warning',
                title: '提示信息',
                content:"用户不存在！"
            })
        }
    });
}

function selectUser(){
    vm.userNick(this.nick);
    vm.userId(this.u_id);
}

function addUserConfig(){
    var html = "<div class='row' style='margin-top: 10px'><div class='col-lg-5 column text-center'><input type='text' name='configName' class='form-control'></div><div class='col-lg-5 column text-center'><input type='text' name='configVal' class='form-control'></div><div class='col-lg-2 column text-center' style='line-height: 31px'><a href='javascript:void(0)' onclick='delConfig(this)'><span class='entypo-trash'></span>删除配置</a></div></div>";
    $("#userConfig").append(html);
}

function delConfig(obj){
    $(obj).parent().parent().remove();
}

function addBetaUser(){
    if(vm.userId() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择用户！"
        })
    }if($("#startTime").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择生效时间！"
        })
    }if($("#endTime").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择失效时间！"
        })
    }else if($("#platformAdd").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择操作系统！"
        })
    }else if($("#userTypeAdd").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择用户类型！"
        })
    }else if($("input:text[name='configName']").length <= 0){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请填写用户配置！"
        })
    }else{
        var postObj = {},config = {};
        var configVals = $("input:text[name='configVal']");
        $.each($("input:text[name='configName']"),function(i, value){
            config[$(this).val()] = $(configVals[i]).val();
        });
        postObj.userID = util.getSessionStorage("userID");
        postObj.authSign = util.getSessionStorage("authSign");
        postObj.u_id = vm.userId();
        postObj.start_time = new Date($("#startTime").val()).getTime();
        postObj.end_time = new Date($("#endTime").val()).getTime();
        postObj.platform = $("#platformAdd").val();
        postObj.userType = $("#userTypeAdd").val();
        postObj.config = JSON.stringify(config);
        util.callServerFunction("adminEditBeta&random="+parseInt(Math.random()*10000), postObj, function(data) {
            if(data.statusCode == 900) {
                util.toast("操作成功", "success", "提示信息");
                subLoadBetaUserManageList();
            }
        });
    }
}

var viewModel = function(){
    this.betaUserManageList = ko.observableArray();
    this.betaUserList = ko.observableArray();
    this.startPos = ko.observable(1);
    this.pageSize = ko.observable(15);
    this.userNick = ko.observable("");
    this.userId = ko.observable("");
    this.prevPage = prevPage;
    this.nextPage = nextPage;
    this.editBeta = editBeta;
    this.delBeta = delBeta;
    this.addBetaUser = addBetaUser;
    this.selectUser = selectUser;
};
var vm = new viewModel();
var dialog = "";
var date = new Date();
var todayStartDate = date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + ' 00:00:00';
var todayEndDate = date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + ' 23:59:59';
$(document).ready(function(){
    ko.applyBindings(vm,document.getElementById("betaUserManagerTable"));
    subLoadBetaUserManageList();
    $('.selectpicker').selectpicker({
        style: 'btn btn-info'
    });
    $('.btn-group').css("width","100%");
    document.onkeydown = function(event){
        var e = event ? event :(window.event ? window.event : null);
        if(e.keyCode==13){
            subLoadBetaUserManageList();
            return false;
        }
    }
});