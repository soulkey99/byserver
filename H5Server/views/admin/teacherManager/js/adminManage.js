/**
 * Created by hjy on 2015/11/12 0012.
 */

function loadAdminManageList(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startPos = (vm.startPos()-1)*vm.pageSize()+1;
    postObj.pageSize = vm.pageSize();
    postObj.q_nick = $("#q_nick").val();
    postObj.q_userName = $("#q_userName").val();
    util.callServerFunction('adminGetAdminList', postObj, function (data) {
        if (data.statusCode == 900) {
            vm.adminManagerList.removeAll();
            if (data.list.length > 0) {
                var list = [];
                for (var i = 0; i < data.list.length; i++) {
                    list.push({
                        id: (i + 1),
                        u_id: data.list[i].u_id,
                        userName: data.list[i].userName,
                        adminType: data.list[i].adminType,
                        nick: data.list[i].nick,
                        sections: data.list[i].sections,
                        pages: data.list[i].pages,
                        lastLoginTime: util.convertTime2Str(data.list[i].lastLoginTime)
                    });
                }
                vm.adminManagerList(list);
            } else if (vm.startPos() != 1) {
                vm.startPos(vm.startPos() - 1);
                loadAdminManageList();
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
        loadAdminManageList();
    }
}

function nextPage(){
    vm.startPos(vm.startPos()+1);
    loadAdminManageList();
}

function subLoadAdminManageList(){
    vm.startPos(1);
    vm.pageSize(15);
    loadAdminManageList();
}

function initEditAdmin(){
    var sh = "";
    if(this.adminType == "superAdmin"){
        sh = "style='display:none'"
    }
    var html = "<div class='form-group'><input type='hidden' id='u_id' value='"+ this.u_id +"'>"+
        "<label>用户名：</label>" + this.userName + "<br>" +
        "<label>用户密码：</label><input type='text' class='form-control' id='userPwd' value='' placeholder='如要修改原密码请将新密码填入此处'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>用户类型：</label><select id='adminType' class='form-control valid' value='" + this.adminType + "' onchange='sh()'>";
    if(this.adminType == "superAdmin"){
        html += "<option value='admin'>普通管理员</option>" +
                "<option value='superAdmin' selected>超级管理员</option>" +
                "</select>";
    }else{
        html += "<option value='admin' selected>普通管理员</option>" +
                "<option value='superAdmin'>超级管理员</option>" +
                "</select>";
    }
    html += "</div>"+
        "<div class='form-group'>"+
        "<label>昵称：</label><input type='text' class='form-control' id='userNick' value='" + this.nick + "'>"+
        "</div>"+
        "<div class='form-group' "+ sh +" id='sh'>"+
        "<label style='vertical-align:top'>权限：</label>" +
        "<div style='width:100%;height:auto'>" +
        "" +
        "<div style='margin: 10px 0px 10px 0px;'><label class='checkbox-inline'><input type='checkbox' id='goodSection' name='section' value='goodSection' onchange='linkageCheckbox(this)'><span class='label label-success'>商城管理</span></label></div>" +
        "<div style='padding-left: 20px'>" +
        "<label class='checkbox-inline'><input type='checkbox' id='goodSectionChild1' name='page' value='goodPage' onchange='linkageCheckbox(this)'><span class='label'>商品管理</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='goodSectionChild2' name='page' value='bannerPage' onchange='linkageCheckbox(this)'><span class='label'>商城Banner管理</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='goodSectionChild3' name='page' value='logisticPage' onchange='linkageCheckbox(this)'><span class='label'>物流管理</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='goodSectionChild4' name='page' value='codePage' onchange='linkageCheckbox(this)'><span class='label'>兑换码管理</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='goodSectionChild5' name='page' value='shopPage' onchange='linkageCheckbox(this)'><span class='label'>商家管理</span></label>" +
        "</div><br><div style='border-bottom: 1px #CCCCCC solid'></div>" +
        "" +
        "<div style='margin: 10px 0px 10px 0px;'><label class='checkbox-inline'><input type='checkbox' id='shopSection' name='section' value='shopSection' onchange='linkageCheckbox(this)'><span class='label label-success'>商户管理</span></label></div>" +
        "<div style='padding-left: 20px'>" +
        "<label class='checkbox-inline'><input type='checkbox' id='shopSectionChild1' name='page' value='goodList' onchange='linkageCheckbox(this)'><span class='label'>商品列表</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='shopSectionChild2' name='page' value='codeManage' onchange='linkageCheckbox(this)'><span class='label'>兑换码管理</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='shopSectionChild3' name='page' value='mailManage' onchange='linkageCheckbox(this)'><span class='label'>发货管理</span></label>" +
        "</div><br><div style='border-bottom: 1px #CCCCCC solid'></div>" +
        "" +
        "<div style='margin: 10px 0px 10px 0px;'><label class='checkbox-inline'><input type='checkbox' id='adminSection' name='section' value='adminSection' onchange='linkageCheckbox(this)'><span class='label label-success'>管理中心</span></label></div>" +
        "<div style='line-height: 2;padding-left: 20px'>" +
        "<label class='checkbox-inline'><input type='checkbox' id='adminSectionChild1' name='page' value='teacherPage' onchange='linkageCheckbox(this)'><span class='label'>教师管理</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='adminSectionChild2' name='page' value='collectTeacherPage' onchange='linkageCheckbox(this)'><span class='label'>付费教师管理</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='adminSectionChild3' name='page' value='promotionPage' onchange='linkageCheckbox(this)'><span class='label'>推广管理</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='adminSectionChild4' name='page' value='userPage' onchange='linkageCheckbox(this)'><span class='label'>用户管理</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='adminSectionChild5' name='page' value='userAlipayPage' onchange='linkageCheckbox(this)'><span class='label'>资金管理</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='adminSectionChild6' name='page' value='userFeedbackPage' onchange='linkageCheckbox(this)'><span class='label'>反馈管理</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='adminSectionChild7' name='page' value='userReportPage' onchange='linkageCheckbox(this)'><span class='label'>举报管理</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='adminSectionChild8' name='page' value='systemPage' onchange='linkageCheckbox(this)'><span class='label'>系统管理</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='adminSectionChild9' name='page' value='adPage' onchange='linkageCheckbox(this)'><span class='label'>广告管理</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='adminSectionChild10' name='page' value='pubPage' onchange='linkageCheckbox(this)'><span class='label'>公众号管理</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='adminSectionChild11' name='page' value='questionPage' onchange='linkageCheckbox(this)'><span class='label'>题库管理</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='adminSectionChild12' name='page' value='studyQuestionPage' onchange='linkageCheckbox(this)'><span class='label'>引导问题管理</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='adminSectionChild13' name='page' value='studyQuestionReviewPage' onchange='linkageCheckbox(this)'><span class='label'>引导问题审核</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='adminSectionChild14' name='page' value='studyPointPage' onchange='linkageCheckbox(this)'><span class='label'>知识点管理</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='adminSectionChild15' name='page' value='textbooksPage' onchange='linkageCheckbox(this)'><span class='label'>教材管理</span></label>" +
        "</div><br><div style='border-bottom: 1px #CCCCCC solid'></div>" +
        "" +
        "<div style='margin: 10px 0px 10px 0px;'><label class='checkbox-inline'><input type='checkbox' id='qaSection' name='section' value='qaSection' onchange='linkageCheckbox(this)'><span class='label label-success'>答疑中心管理</span></label></div>" +
        "<div style='padding-left: 20px'>" +
        "<label class='checkbox-inline'><input type='checkbox' id='qaSectionChild1' name='page' value='QATeacherPage' onchange='linkageCheckbox(this)'><span class='label'>答疑教师列表</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='qaSectionChild2' name='page' value='QAStatPage' onchange='linkageCheckbox(this)'><span class='label'>答疑数据统计</span></label>" +
        "</div><br><div style='border-bottom: 1px #CCCCCC solid'></div>" +
        "" +
        "<div style='margin: 10px 0px 10px 0px;'><label class='checkbox-inline'><input type='checkbox' id='squareSection' name='section' value='squareSection' onchange='linkageCheckbox(this)'><span class='label label-success'>运营后台管理</span></label></div>" +
        "<div style='padding-left: 20px'>" +
        "<label class='checkbox-inline'><input type='checkbox' id='squareSectionChild1' name='page' value='offLineQuestion' onchange='linkageCheckbox(this)'><span class='label'>广场、圈子管理</span></label>" +
        "</div><br><div style='border-bottom: 1px #CCCCCC solid'></div>" +
        "" +
        "</div>"+
        "</div>"+
        "<div align='center' style='margin-top: 10px'><button class='btn btn-info' onclick='confirm()'>提 交</button></div>";
    dialog = $.dialog({
        icon: "icon icon-document-edit",
        title: '管理员设置',
        content: html
    });
    for (var i = 0; i < this.sections.length; i++) {
        $("input:checkbox[value='"+ this.sections[i] +"']").attr('checked', true);
    }
    for (var j = 0; j < this.pages.length; j++) {
        $("input:checkbox[value='"+ this.pages[j] +"']").attr('checked', true);
    }
}

function confirm(){
    var postObj = {},sections = [],pages = [];
    $(":checkbox[name='section']:checked").each(function(){
        sections.push($(this).val());
    })
    $(":checkbox[name='page']:checked").each(function(){
        pages.push($(this).val());
    })
    if(sections.length<=0 || pages.length<=0){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择权限！"
        })
    }else{
        postObj.userID = util.getSessionStorage("userID");
        postObj.authSign = util.getSessionStorage("authSign");
        postObj.u_id = $("#u_id").val();
        postObj.nick = $("#userNick").val();
        postObj.phone = $("#phone").val();
        postObj.adminType = $("#adminType").val();
        if($("#userPwd").val()!=""){
            postObj.userPwd = $("#userPwd").val();
        }
        postObj.sections = sections.join(",");
        postObj.pages = pages.join(",");
        util.callServerFunction('adminEditAdmin', postObj, function (data) {
            if (data.statusCode == 900) {
                dialog.close();
                util.toast("设置成功！","success","系统提示");
                loadAdminManageList();
            } else {
                errorCodeApi(data.statusCode);
            }
        });
    }
}

function linkageCheckbox(obj){
    var id = $(obj).attr("id");
    if(id.indexOf("Child")<0){
        if($(":checkbox[id='"+id+"']").prop("checked")){
            $(":checkbox[id^='"+id+"']").each(function(){
                $(this).prop("checked",true);
            });
        }else{
            $(":checkbox[id^='"+id+"']").each(function(){
                $(this).prop("checked",false);
            });
        }
    }else{
        if($(":checkbox[id='"+id+"']").prop("checked")){
            $(":checkbox[id='" + id.substring(0,id.indexOf('Child')) + "']").prop("checked", true);
        }else{
            var allEmpty = true;
            $(":checkbox[id^='"+id.substring(0,id.indexOf('Child'))+"Child']").each(function(){
                if($(this).prop("checked")){
                    allEmpty = false;
                }
            });
            if(allEmpty){
                $(":checkbox[id='" + id.substring(0,id.indexOf('Child')) + "']").prop("checked", false);
            }
        }
    }
}

function sh(){
    if($("#adminType").val()=="admin"){
        $("#sh").show();
    }else{
        $("#sh").hide();
    }
}

function initAddAdmin(){
    var html = "<div class='form-group'>"+
        "<label>用户名：</label><input type='text' class='form-control' id='userName'>" +
        "</div>" +
        "<div class='form-group'>" +
        "<label>用户密码：</label><input type='password' class='form-control' id='userPwd'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>用户类型：</label><select id='adminType' class='form-control valid' value='" + this.adminType + "' onchange='sh()'>"+
        "<option value='admin' selected>普通管理员</option>" +
        "<option value='superAdmin' >超级管理员</option>" +
        "</select>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>昵称：</label><input type='text' class='form-control' id='userNick'>"+
        "</div>"+
        "<div class='form-group' id='sh'>"+
        "<label style='vertical-align:top'>权限：</label>" +
        "<div style='width:100%;height:auto'>" +
        "" +
        "<div style='margin: 10px 0px 10px 0px;'><label class='checkbox-inline'><input type='checkbox' id='goodSection' name='section' value='goodSection' onchange='linkageCheckbox(this)'><span class='label label-success'>商城管理</span></label></div>" +
        "<div style='padding-left: 20px'>" +
        "<label class='checkbox-inline'><input type='checkbox' id='goodSectionChild1' name='page' value='goodPage' onchange='linkageCheckbox(this)'><span class='label'>商品管理</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='goodSectionChild2' name='page' value='bannerPage' onchange='linkageCheckbox(this)'><span class='label'>商城Banner管理</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='goodSectionChild3' name='page' value='logisticPage' onchange='linkageCheckbox(this)'><span class='label'>物流管理</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='goodSectionChild4' name='page' value='codePage' onchange='linkageCheckbox(this)'><span class='label'>兑换码管理</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='goodSectionChild5' name='page' value='shopPage' onchange='linkageCheckbox(this)'><span class='label'>商家管理</span></label>" +
        "</div><br><div style='border-bottom: 1px #CCCCCC solid'></div>" +
        "" +
        "<div style='margin: 10px 0px 10px 0px;'><label class='checkbox-inline'><input type='checkbox' id='shopSection' name='section' value='shopSection' onchange='linkageCheckbox(this)'><span class='label label-success'>商户管理</span></label></div>" +
        "<div style='padding-left: 20px'>" +
        "<label class='checkbox-inline'><input type='checkbox' id='shopSectionChild1' name='page' value='goodList' onchange='linkageCheckbox(this)'><span class='label'>商品列表</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='shopSectionChild2' name='page' value='codeManage' onchange='linkageCheckbox(this)'><span class='label'>兑换码管理</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='shopSectionChild3' name='page' value='mailManage' onchange='linkageCheckbox(this)'><span class='label'>发货管理</span></label>" +
        "</div><br><div style='border-bottom: 1px #CCCCCC solid'></div>" +
        "" +
        "<div style='margin: 10px 0px 10px 0px;'><label class='checkbox-inline'><input type='checkbox' id='adminSection' name='section' value='adminSection' onchange='linkageCheckbox(this)'><span class='label label-success'>管理中心</span></label></div>" +
        "<div style='line-height: 2;padding-left: 20px'>" +
        "<label class='checkbox-inline'><input type='checkbox' id='adminSectionChild1' name='page' value='teacherPage' onchange='linkageCheckbox(this)'><span class='label'>教师管理</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='adminSectionChild2' name='page' value='collectTeacherPage' onchange='linkageCheckbox(this)'><span class='label'>付费教师管理</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='adminSectionChild3' name='page' value='promotionPage' onchange='linkageCheckbox(this)'><span class='label'>推广管理</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='adminSectionChild4' name='page' value='userPage' onchange='linkageCheckbox(this)'><span class='label'>用户管理</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='adminSectionChild5' name='page' value='userAlipayPage' onchange='linkageCheckbox(this)'><span class='label'>资金管理</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='adminSectionChild6' name='page' value='userFeedbackPage' onchange='linkageCheckbox(this)'><span class='label'>反馈管理</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='adminSectionChild7' name='page' value='userReportPage' onchange='linkageCheckbox(this)'><span class='label'>举报管理</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='adminSectionChild8' name='page' value='systemPage' onchange='linkageCheckbox(this)'><span class='label'>系统管理</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='adminSectionChild9' name='page' value='adPage' onchange='linkageCheckbox(this)'><span class='label'>广告管理</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='adminSectionChild10' name='page' value='pubPage' onchange='linkageCheckbox(this)'><span class='label'>公众号管理</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='adminSectionChild11' name='page' value='questionPage' onchange='linkageCheckbox(this)'><span class='label'>题库管理</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='adminSectionChild12' name='page' value='studyQuestionPage' onchange='linkageCheckbox(this)'><span class='label'>引导问题管理</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='adminSectionChild13' name='page' value='studyQuestionReviewPage' onchange='linkageCheckbox(this)'><span class='label'>引导问题审核</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='adminSectionChild14' name='page' value='studyPointPage' onchange='linkageCheckbox(this)'><span class='label'>知识点管理</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='adminSectionChild15' name='page' value='textbooksPage' onchange='linkageCheckbox(this)'><span class='label'>教材管理</span></label>" +
        "</div><br><div style='border-bottom: 1px #CCCCCC solid'></div>" +
        "" +
        "<div style='margin: 10px 0px 10px 0px;'><label class='checkbox-inline'><input type='checkbox' id='qaSection' name='section' value='qaSection' onchange='linkageCheckbox(this)'><span class='label label-success'>答疑中心管理</span></label></div>" +
        "<div style='padding-left: 20px'>" +
        "<label class='checkbox-inline'><input type='checkbox' id='qaSectionChild1' name='page' value='QATeacherPage' onchange='linkageCheckbox(this)'><span class='label'>答疑教师列表</span></label>" +
        "<label class='checkbox-inline'><input type='checkbox' id='qaSectionChild2' name='page' value='QAStatPage' onchange='linkageCheckbox(this)'><span class='label'>答疑数据统计</span></label>" +
        "</div><br><div style='border-bottom: 1px #CCCCCC solid'></div>" +
        "" +
        "<div style='margin: 10px 0px 10px 0px;'><label class='checkbox-inline'><input type='checkbox' id='squareSection' name='section' value='squareSection' onchange='linkageCheckbox(this)'><span class='label label-success'>运营后台管理</span></label></div>" +
        "<div style='padding-left: 20px'>" +
        "<label class='checkbox-inline'><input type='checkbox' id='squareSectionChild1' name='page' value='offLineQuestion' onchange='linkageCheckbox(this)'><span class='label'>广场、圈子管理</span></label>" +
        "</div><br><div style='border-bottom: 1px #CCCCCC solid'></div>" +
        "" +
        "</div>"+
        "</div>"+
        "<div align='center' style='margin-top: 10px'><button class='btn btn-info' onclick='confirmAdd()'>提 交</button></div>";
    dialog = $.dialog({
        icon: "icon icon-plus",
        title: '添加管理员',
        content: html
    });
}

function confirmAdd(){
    var postObj = {},sections = [],pages = [];
    $(":checkbox[name='section']:checked").each(function(){
        sections.push($(this).val());
    })
    $(":checkbox[name='page']:checked").each(function(){
        pages.push($(this).val());
    })
    if($("#userName").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请输入用户名！"
        })
    }else if($("#userPwd").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请输入密码！"
        })
    }else if(sections.length<=0 || pages.length<=0){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择权限！"
        })
    }else{
        postObj.userID = util.getSessionStorage("userID");
        postObj.authSign = util.getSessionStorage("authSign");
        postObj.userName = $("#userName").val();
        util.callServerFunction('adminCheckUserName', postObj, function (data) {
            if(data.statusCode == 900){
                postObj = {};
                postObj.userID = util.getSessionStorage("userID");
                postObj.authSign = util.getSessionStorage("authSign");
                postObj.nick = $("#userNick").val();
                postObj.adminType = $("#adminType").val();
                postObj.userName = $("#userName").val();
                postObj.userPwd = $("#userPwd").val();
                postObj.sections = sections.join(",");
                postObj.pages = pages.join(",");
                util.callServerFunction('adminEditAdmin', postObj, function (data) {
                    if (data.statusCode == 900) {
                        dialog.close();
                        util.toast("添加管理员成功！","success","系统提示");
                        subLoadAdminManageList();
                    } else {
                        errorCodeApi(data.statusCode);
                    }
                });
            }else if(data.statusCode == 901){
                $.dialog({
                    icon: 'icon icon-warning',
                    title: '提示信息',
                    content:"您输入的用户名已存在！"
                })
            }else{
                errorCodeApi(data.statusCode);
            }
        });
    }
}

var viewModel = function(){
    this.adminManagerList = ko.observableArray();
    this.startPos = ko.observable(1);
    this.pageSize = ko.observable(15);
    this.prevPage = prevPage;
    this.nextPage = nextPage;
    this.loadAdminManageList = loadAdminManageList;
    this.subLoadAdminManageList = subLoadAdminManageList;
    this.initEditAdmin = initEditAdmin;
};
var vm = new viewModel();
var date = new Date();
var dialog = "";
$(document).ready(function(){
    ko.applyBindings(vm,document.getElementById("adminManage"));
    document.onkeydown=function(event){
        e = event ? event :(window.event ? window.event : null);
        if(e.keyCode==13){
            subLoadAdminManageList();
            return false;
        }
    }
    loadAdminManageList();
});