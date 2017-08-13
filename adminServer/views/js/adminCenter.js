/**
 * Created by MengLei on 2015/4/10.
 */

var fileServerAddr = 'http://123.57.16.157:8062/';
function Init() {  //初始化
    var adminType = util.getSessionStorage("adminType");
    if ( (!util.getSessionStorage("userID")) || (!util.getSessionStorage("authSign")) || (!adminType)) {
        util.showDialog('请先登录！', function () {
            window.open('index.html', '_self');
        });
    } else {
        switch (adminType) {
            case "superAdmin":
                adminTeacher();
                break;
            case "teacherAdmin":
                adminTeacher();
                break;
            case "adAdmin":
                adminAd();
                break;
            default:
                modifyPwd();
                break;
        }
        vm.adminNick(util.getSessionStorage("nick"));
        vm.adminType(adminType == "superAdmin" ? "超级管理员" : adminType == "teacherAdmin" ? "教师管理员" : adminType == "adAdmin" ? "广告管理员" : "其他");
    }
}

function adminTeacher(){  //教师管理
    vm.adminTeacherVisibility(true);
    vm.adminShareCodeVisibility(false);
    vm.adminAdVisibility(false);
    vm.createAdminVisibility(false);
    vm.modifyPwdVisibility(false);
    loadTeacherList();
}

function adminShareCode(){  //邀请码管理
    vm.adminTeacherVisibility(false);
    vm.adminShareCodeVisibility(true);
    vm.adminAdVisibility(false);
    vm.createAdminVisibility(false);
    vm.modifyPwdVisibility(false);
    loadPromoters();
}

function adminAd(){  //广告管理
    vm.adminTeacherVisibility(false);
    vm.adminShareCodeVisibility(false);
    vm.adminAdVisibility(true);
    vm.createAdminVisibility(false);
    vm.modifyPwdVisibility(false);
}

function adminStat(){
    //
    window.location.href = './stat.html';
}

function adminFeedbacks(){
    window.location.href = './feedbacks.html';
}

function createAdmin(){  //创建管理员
    vm.adminTeacherVisibility(false);
    vm.adminShareCodeVisibility(false);
    vm.adminAdVisibility(false);
    vm.createAdminVisibility(true);
    vm.modifyPwdVisibility(false);
}

function modifyPwd(){  //修改密码
    vm.adminTeacherVisibility(false);
    vm.adminShareCodeVisibility(false);
    vm.adminAdVisibility(false);
    vm.createAdminVisibility(false);
    vm.modifyPwdVisibility(true);
}

function logout(){
    util.showDialog('确认退出登录吗？', function(){
        util.removeSessionStorage("userID");
        util.removeSessionStorage("authSign");
        util.removeSessionStorage("nick");
        util.removeSessionStorage("adminType");
        window.open('index.html', '_self');
    }, "confirm", function(){});
}


function loadTeacherList(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startPos = 1;
    postObj.pageSize = 20;
    if((!postObj.userID)||(!postObj.authSign)){
        //没有userID或者authSign的时候，先跳转登陆页
        util.showDialog('请先登录！', function(){
            window.open('index.html', '_self');
        });
    } else {
        util.callServerFunction('getTeacherListToVerify', postObj, function(data){
            switch(data.statusCode){
                case 900:  //success
                    vm.teacherToVerify.removeAll();
                    if(data.teacherList.length > 0) {
                        var teacherList = [];
                        for (var i = 0; i < data.teacherList.length; i++) {
                            if (data.teacherList[i].userInfo.teacher_info.id_pic.indexOf('http://') < 0) {
                                data.teacherList[i].userInfo.teacher_info.id_pic = fileServerAddr + data.teacherList[i].userInfo.teacher_info.id_pic;
                            }
                            if (data.teacherList[i].userInfo.teacher_info.certificate_pic.indexOf('http://') < 0) {
                                data.teacherList[i].userInfo.teacher_info.certificate_pic = fileServerAddr + data.teacherList[i].userInfo.teacher_info.certificate_pic;
                            }
                            teacherList.push({
                                t_id: data.teacherList[i].t_id,
                                t_name: data.teacherList[i].userInfo.name,
                                id_no: data.teacherList[i].userInfo.id_no,
                                gender: data.teacherList[i].userInfo.gender,
                                school: data.teacherList[i].userInfo.school,
                                id_pic: data.teacherList[i].userInfo.teacher_info.id_pic,
                                certificate_pic: data.teacherList[i].userInfo.teacher_info.certificate_pic,
                                //admin_reason: data.teacherList[i].userInfo.teacher_info.admin_reason,
                                verify_desc: data.teacherList[i].userInfo.teacher_info.verify_desc
                            });
                        }
                        vm.teacherToVerify(teacherList);
                    }
                    break;
                case 903: //token invalid
                    util.showDialog('当前登录失效，请重新登录！', function(){
                        window.open('index.html', '_self');
                    });
                    break;
                case 905: //internal server error
                    util.showDialog(data.message);
                    break;
                case 908:  //not authorized
                    util.showDialog('管理员权限不足！');
                    break;
                default:
                    util.showDialog('错误！');
                    break;
            }
        })
    }
}

function loadPromoters(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startPos = 1;
    postObj.pageSize = 500;
    if((!postObj.userID)||(!postObj.authSign)){
        //没有userID或者authSign的时候，先跳转登陆页
        util.showDialog('请先登录！', function(){
            window.open('index.html', '_self');
        });
    } else {
        util.callServerFunction('getPromoters', postObj, function(data){
            switch(data.statusCode){
                case 900:
                    var list = [];
                    for (var i = 0; i < data.promoterList.length; i++) {
                        list.push({
                            u_id: data.promoterList[i].userID,
                            phone: data.promoterList[i].phone || '',
                            name: data.promoterList[i].userInfo.name || ((data.promoterList[i].userInfo.family_name + data.promoterList[i].userInfo.given_name) || ((data.promoterList[i].nick) || '')),
                            stats: data.promoterList[i].stat,
                            shareCode: data.promoterList[i].shareCode || '',
                            promoter: data.promoterList[i].userInfo.promoter
                        });
                    }
                    vm.promoters.removeAll();
                    vm.promoters(list);
                    break;
                case 903: //token invalid
                    util.showDialog('当前登录失效，请重新登录！', function(){
                        window.open('index.html', '_self');
                    });
                    break;
                case 905: //internal server error
                    util.showDialog(data.message);
                    break;
                case 908:  //not authorized
                    util.showDialog('管理员权限不足！');
                    break;
                default:
                    util.showDialog('错误！');
                    break;
            }
        })
    }
}

function showDetail(){   //显示教师详情
    $("body").append("<div id='mask'></div>");
    $("#mask").addClass("admin-center-mask").fadeIn("slow");
    $("#teacherDetail").fadeIn("slow");

    vm.detail_admin_reason=ko.observable("");

    vm.detail_t_id(this.t_id);
    vm.detail_name(this.t_name);
    vm.detail_gender(this.gender);
    vm.detail_school(this.school);
    vm.detail_id_no(this.id_no);
    vm.detail_verify_desc(this.verify_desc);
    vm.detail_id_pic(this.id_pic);
    vm.detail_certificate_pic(this.certificate_pic);
}

function closeDetail () {   //关闭浮层
    $("#teacherDetail").fadeOut("fast");
    $("#promoterStat").fadeOut("fast");
    $("#promoterAdmin").fadeOut("fast");
    $("#promotedList").fadeOut("fast");
    $("#mask").css({ display: 'none' }).remove();
    //关闭浮层，清空数据
    vm.detail_t_id("");
    vm.detail_name("");
    vm.detail_gender("");
    vm.detail_school("");
    vm.detail_id_no("");
    vm.detail_verify_desc("");
    vm.detail_id_pic("");
    vm.detail_certificate_pic("");
    vm.detail_admin_reason("");

    vm.total("");
    vm.registered("");
    vm.unRegistered("");
}

function teacher_granted(){   //验证通过
    var t_id = vm.detail_t_id();
    if(!t_id){
        return;
    }
    var postObj = {userID: util.getSessionStorage("userID"), authSign: util.getSessionStorage("authSign"), t_id: t_id, verify: "true"};
    postObj.admin_reason = vm.detail_admin_reason();
    util.callServerFunction("verifyTeacher", postObj, function(data){
        switch(data.statusCode){
            case 900:
                alert("操作成功！");
                //关闭浮层，去掉列表中已认证的item
                var item = {};
                for(var i=0; i<vm.teacherToVerify().length; i++){
                    if(vm.teacherToVerify()[i].t_id == vm.detail_t_id()){
                        item = vm.teacherToVerify()[i];
                        break;
                    }
                }
                vm.teacherToVerify.remove(item);
                closeDetail();
                break;
            default:
                util.showDialog(data.message);
                break;
        }
    });
}

function teacher_rejected() {  //验证不通过
    var postObj = {
        userID: util.getSessionStorage("userID"),
        authSign: util.getSessionStorage("authSign"),
        t_id: vm.detail_t_id(),
        verify: "false"
    };
    postObj.admin_reason = vm.detail_admin_reason();
    util.callServerFunction("verifyTeacher", postObj, function (data) {
        switch (data.statusCode) {
            case 900:
                alert("操作成功！");
                //关闭浮层，去掉列表中已认证的item
                var item = {};
                for (var i = 0; i < vm.teacherToVerify().length; i++) {
                    if (vm.teacherToVerify()[i].t_id == vm.detail_t_id()) {
                        item = vm.teacherToVerify()[i];
                        break;
                    }
                }
                vm.teacherToVerify.remove(item);
                closeDetail();
                break;
            default:
                util.showDialog(data.message);
                break;
        }
    });
}

function getUserByPhoneNum(){
    //
    var phonenum = $("#phonenum").val();
    var postObj = {
        userID: util.getSessionStorage("userID"),
        authSign: util.getSessionStorage("authSign"),
        phonenum: phonenum
    };
    util.callServerFunction("getUserByPhoneNum", postObj, function(data){
        switch(data.statusCode){
            case 900:
                var list = [];
                list.push({
                    u_id: data.user.userID,
                    phone: data.user.phone || '',
                    name: data.user.userInfo.name || '',
                    shareCode: data.user.shareCode || '无',
                    stats: data.user.stat,
                    promoter: data.user.userInfo.promoter
                });
                vm.promoters.removeAll();
                vm.promoters(list);
                break;
            default:
                break;
        }
    });
}

function showAllPromoter() {
    loadPromoters();
}

function showStat(){
    //显示数据
    $("body").append("<div id='mask'></div>");
    $("#mask").addClass("admin-center-mask").fadeIn("slow");
    $("#promoterStat").fadeIn("slow");

    var postObj = {
        userID: util.getSessionStorage("userID"),
        authSign: util.getSessionStorage("authSign"),
        u_id: this.u_id
    };

    util.callServerFunction('getStatistics', postObj, function(data){
        switch (data.statusCode){
            case 900:
                vm.total(data.stat.total);
                vm.registered(data.stat.registered);
                vm.unRegistered(data.stat.unRegistered);
                break;
            default :
                break;
        }
    });
}

function setPromoter(){
    //设置推广员身份
    var that = this;
    util.showDialog(that.promoter == true ? '确定取消推广员吗？' : '确定设置管理员吗？', function(){
        //positive callback
        var postObj = {
            userID: util.getSessionStorage("userID"),
            authSign: util.getSessionStorage("authSign"),
            u_id: that.u_id,
            promoter: that.promoter == true ? 'false' : 'true'
        };
        util.callServerFunction('setPromoter', postObj, function(data){
            switch (data.statusCode){
                case 900:
                    var tmp = {
                        userID: that.userID,
                        phone: that.phone || '',
                        name: that.name || '',
                        shareCode: that.shareCode || '无',
                        stats: that.stats,
                        promoter: !that.promoter
                    };
                    vm.promoters.replace(that, tmp);
                    break;
                default :
                    break;
            }
        });
    }, 'confirm', function(){
        //negtive callback
    });
}

function promotedList(){
    //推广邀请注册的用户
    $("body").append("<div id='mask'></div>");
    $("#mask").addClass("admin-center-mask").fadeIn("slow");
    $("#promotedList").fadeIn("slow");

    var postObj = {
        userID: util.getSessionStorage("userID"),
        authSign: util.getSessionStorage("authSign"),
        startPos: 1,
        pageSize: 500,
        shareCode: this.shareCode
    };

    util.callServerFunction('getInvitedUser', postObj, function(data){
        switch (data.statusCode){
            case 900:
                vm.invitedList(data.invitedList);
                break;
            default:
                break;
        }
    })
}

function changePwd(){
    //修改密码
    var old_pwd = $("#old_pwd").val();
    var new_pwd = $("#new_pwd").val();
    var new_pwd2 = $("#new_pwd2").val();
    if(!old_pwd){
        util.showDialog("请输入旧密码！");
        return;
    }
    if(!new_pwd){
        util.showDialog("请输入新密码！");
        return;
    }
    if(new_pwd == new_pwd2){
        var postObj = {
            userID: util.getSessionStorage("userID"),
            authSign: util.getSessionStorage("authSign"),
            oldPwd: old_pwd,
            newPwd: new_pwd
        };
        util.callServerFunction("changePwd", postObj, function(data){
            switch(data.statusCode){
                case 900:
                    util.showDialog("修改密码成功！", function(){
                        var old_pwd = $("#old_pwd").val("");
                        var new_pwd = $("#new_pwd").val("");
                        var new_pwd2 = $("#new_pwd2").val("");
                    });
                    break;
                case 907:
                    util.showDialog("旧密码错误！");
                    break;
                default:
                    break;
            }
        });
    }else{
        util.showDialog("两次输入的新密码不符！");
    }
}