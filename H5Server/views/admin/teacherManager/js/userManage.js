/**
 * Created by hjy on 2015/10/16 0016.
 */

//获取用户列表
function loadUserManageList(){
    if($("#uPhone").val()=="" && $("#uNick").val()==""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content: "请填写用户电话 或 用户昵称！"
        })
    }else {
        var postObj = {};
        postObj.userID = util.getSessionStorage("userID");
        postObj.authSign = util.getSessionStorage("authSign");
        postObj.phonenum = $("#uPhone").val();
        postObj.nick = $("#uNick").val();
        postObj.startPos = (vm.startPos()-1)*vm.pageSize()+1;
        postObj.pageSize = vm.pageSize();
        util.callServerFunction('adminGetUserInfo', postObj, function (data) {
            if (data.statusCode == 900) {
                vm.userManageList.removeAll();
                if (data.list.length > 0) {
                    var list = [];
                    for (var i = 0; i < data.list.length; i++) {
                        list.push({
                            id: (i + 1),
                            u_id: data.list[i].u_id,
                            phone: data.list[i].phone,
                            nick: data.list[i].nick,
                            shareCode: data.list[i].shareCode,
                            invited: data.list[i].invited,
                            registered: data.list[i].registered,
                            promoter: data.list[i].promoter,
                            create_time: util.convertTime2Str(data.list[i].create_time),
                            last_login: util.convertTime2Str(data.list[i].last_login),
                            userType: data.list[i].userType,
                            bonus: data.list[i].bonus
                        });
                    }
                    vm.userManageList(list);
                    $('i').tooltip({
                        "margin-top": "50px"
                    });
                } else if (vm.startPos() != 1) {
                    vm.startPos(vm.startPos() - 1);
                    loadUserManageList();
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
}

//显示发送短信弹出层
function initSendMessage(){
    if(this.phone == ""){
        dialog = $.alert({
            title: "系统提示",
            content: "用户<span class='label label-info'>"+ this.nick +"</span>未填写手机号码，暂时无法发送短信，请选择其他操作",
            confirmButton: "我知道了"
        });
    }else{
        dialog = $.dialog({
            icon: 'icon icon-mail',
            title: '发送短信',
            content: "<div>" +
            "<div>用户昵称：" + this.nick + "</div>" +
            "<div>手机号：" + this.phone + "</div>" +
            "<div class='form-group'><div>短信类型：<select id='template' class='form-control valid' onchange='changeInput();'>" +
            "<option value='system'>系统通知</option>" +
            "<option value='complain'>被举报</option>" +
            "<option value='smscode'>验证码短信</option>" +
            "<option value='byflow'>流量到账通知</option>" +
            "<option value='teacher_pass'>通过审核</option>" +
            "<option value='teacher_reject'>未通过审核</option>" +
            "</select></div>" +
            "<div>短信内容：<div id='select1' class='hidden'>" +
            "【CallCall教师】您好，感谢您使用CallCall教师服务，短信验证码有效期<input type='text' id='ttl' style='width:60px;display: inline;border: 0px #CCCCCC solid;border-bottom: 1px #C7D5E0 solid;color: #C7D5E0;text-align: center' placeholder='1'>分钟，请尽快使用。" +
            "</div>" +
            "<div id='select2' class='hidden'>" +
            "【CallCall教师】您好，感谢您使用CallCall教师，为了感谢您的支持，<input type='text' id='flow' style='width:50px;display: inline;border: 0px #CCCCCC solid;border-bottom: 1px #C7D5E0 solid;color: #C7D5E0;text-align: center' placeholder='1'>兆免费手机流量包已存入您的手机账户，请注意查收短信通知。" +
            "</div>" +
            "<div id='select3' class='hidden'>" +
            "【CallCall教师】您好，尊敬的用户，恭喜您的教师资格认证信息已经通过审核，师者，所以传道授业解惑也，感谢您的使用。" +
            "</div>" +
            "<div id='select4' class='hidden'>" +
            "【CallCall教师】您好，尊敬的用户，很抱歉您的教师资格认证信息未通过审核，审核意见为：<input type='text' id='result0' style='width:80%;display: inline;border: 0px #CCCCCC solid;border-bottom: 1px #C7D5E0 solid;color: #C7D5E0;text-align: center' placeholder='请填写审核意见'>，请您重新上传，谢谢。" +
            "</div>" +
            "<div id='select5'>" +
            "【CallCall教师】您好，尊敬的用户您好，由于系统检测到您的账号存在<input type='text' id='action1' style='width:150px;display: inline;border: 0px #CCCCCC solid;border-bottom: 1px #C7D5E0 solid;color: #C7D5E0;text-align: center' placeholder='请填写账号行为'>行为，已经对我们的正常运营造成影响，现已对您的账号<input type='text' id='result1' style='width:150px;display: inline;border: 0px #CCCCCC solid;border-bottom: 1px #C7D5E0 solid;color: #C7D5E0;text-align: center' placeholder='请填写账号处理'/>。" +
            "</div>" +
            "<div id='select6' class='hidden'>" +
            "【CallCall教师】您好，尊敬的用户您好，由于您的账号被举报存在<input type='text' id='action2' style='width:150px;display: inline;border: 0px #CCCCCC solid;border-bottom: 1px #C7D5E0 solid;color: #C7D5E0;text-align: center' placeholder='请填写账号行为'>行为，经过我们核实，现决定对您的账号<input type='text' id='result2' style='width:150px;display: inline;border: 0px #CCCCCC solid;border-bottom: 1px #C7D5E0 solid;color: #C7D5E0;text-align: center' placeholder='请填写账号处理'/>。" +
            "</div></div>" +
            "<div align='center'><button class='btn btn-primary' onclick='sendMessage()'>发 送</button></div>" +
            "<input type='hidden' id='phoneNum' value='" + this.phone + "'>" +
            "</div></div>"
        });
    }
}

//选择短信类型
function changeInput(){
    var templateList = ["smscode","byflow","teacher_pass","teacher_reject","system","complain"];
    for(var i=0;i<6;i++){
        if(templateList[i]==$("#template").val()){
            $("#select"+(i+1)).removeClass("hidden");
        }else{
            $("#select"+(i+1)).addClass("hidden");
        }
    }
}

//发送短信
function sendMessage(){
    var send = true;
    var postObj = {};
    var template = $("#template").val();
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.phonenum = $("#phoneNum").val();
    postObj.template = template;
    if(template == "smscode"){
        if($("#ttl").val()==""){
            send = false;
            $.dialog({
                icon: 'icon icon-warning',
                title: '提示信息',
                content: "请填写短信验证码有效时间！"
            })
        }
        postObj.ttl = $("#ttl").val();
    }else if(template == "byflow"){
        if($("#flow").val()==""){
            send = false;
            $.dialog({
                icon: 'icon icon-warning',
                title: '提示信息',
                content: "请填写流量包大小！"
            })
        }
        postObj.flow = $("#flow").val();
    }else if(template == "teacher_reject"){
        if($("#result0").val()==""){
            send = false;
            $.dialog({
                icon: 'icon icon-warning',
                title: '提示信息',
                content: "请填写审核意见！"
            })
        }
        postObj.result = $("#result0").val();
    }else if(template == "system"){
        if($("#action1").val()=="" || $("#result1").val()==""){
            send = false;
            $.dialog({
                icon: 'icon icon-warning',
                title: '提示信息',
                content: "请填写账号行为 和 账号处理！"
            })
        }
        postObj.action = $("#action1").val();
        postObj.result = $("#result1").val();
    }else if(template == "complain"){
        if($("#action2").val()=="" || $("#result2").val()==""){
            send = false;
            $.dialog({
                icon: 'icon icon-warning',
                title: '提示信息',
                content: "请填写账号行为 和 账号处理！"
            })
        }
        postObj.action = $("#action2").val();
        postObj.result = $("#result2").val();
    }
    if(send){
        util.callServerFunction('adminSendSMS', postObj, function (data) {
            if (data.statusCode == 900) {
                dialog.close();
                util.toast("发送短信成功！","success","系统提示");
                loadUserManageList();
            } else {
                errorCodeApi(data.statusCode);
            }
        });
    }
}

//显示扣减积分弹出层
function initDeductIntegral(){
    dialog = $.dialog({
        icon: 'icon icon-minus',
        title: '扣减积分',
        content: "<div>" +
        "<div>用户昵称："+this.nick+"</div>"+
        "<div>手机号："+this.phone+"</div>"+
        "<div class='form-group'><label>扣减积分数：</label><input type='text' class='form-control' id='integral' value=''></div>" +
        "<div align='center'><button class='btn btn-primary' onclick='deductIntegral()'>扣 减</button></div>"+
        "<input type='hidden' id='u_id' value='"+this.u_id+"'>"+
        "</div>"
    });
}

//扣减积分
function deductIntegral(){
    if($("#integral").val()==""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content: "请填写扣减积分数！"
        });
    }else{
        var postObj = {};
        postObj.userID = util.getSessionStorage("userID");
        postObj.authSign = util.getSessionStorage("authSign");
        postObj.u_id = $("#u_id").val();
        postObj.bonus = $("#integral").val();
        util.callServerFunction('adminSetBonus', postObj, function (data) {
            if (data.statusCode == 900) {
                dialog.close();
                util.toast("扣减积分成功！","success","系统提示");
                loadUserManageList();
            } else {
                errorCodeApi(data.statusCode);
            }
        });
    }
}

//显示加入黑名单弹出层
function initInBlacklist(){
    dialog = $.dialog({
        icon: 'fontawesome-eye-close',
        title: '加入黑名单',
        content: "<div>" +
        "<div>用户昵称："+this.nick+"</div>"+
        "<div>手机号："+this.phone+"</div>"+
        "<div class='form-group'><label>解黑时间：</label>"+
        "<input id='expireTime' class='form-control' type='text'>"+
        "</div>" +
        "<div class='form-group'><label>加黑备注：</label><textarea id='desc' rows='5' style='width:100%;height:50px;border-color: #C7D5E0'></textarea></div>" +
        "<div align='center'><button class='btn btn-primary' onclick='inBlacklist()'>确 定</button></div>"+
        "<input type='hidden' id='phoneNum' value='"+this.phone+"'>"+
        "</div>"
    });
    var date = new Date((new Date()/1000+86400)*1000);
    util.initDateTimePicker("expireTime",{defaultDate: new Date(date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + " 23:59:59")});
}

//加入黑名单
function inBlacklist(){
    if($("#expireTime").val()==""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content: "请填写过期时间！"
        });
    }else {
        var postObj = {};
        postObj.userID = util.getSessionStorage("userID");
        postObj.authSign = util.getSessionStorage("authSign");
        postObj.phonenum = $("#phoneNum").val();
        postObj.expire = new Date($("#expireTime").val()).getTime();
        postObj.desc = $("#desc").val();
        util.callServerFunction('adminAddBlacklist', postObj, function (data) {
            if (data.statusCode == 900) {
                dialog.close();
                util.toast("加入黑名单成功！","success","系统提示");
                loadUserManageList();
            } else {
                errorCodeApi(data.statusCode);
            }
        });
    }
}

//显示黑名单列表
function initBlackList(){
    $.dialog({
        icon: 'fontawesome-eye-close',
        title: '黑名单列表',
        content: "<div class='table-responsive' id='black'>"+
                    "<table class='table table-bordered table-striped cf'>"+
                    "<thead class='cf'>"+
                    "<tr>"+
                    "<th class='numeric'>序号</th>"+
                    "<th>昵称</th>"+
                    "<th>联系电话</th>"+
                    "<th>注册时间</th>"+
                    "<th>上次登录时间</th>"+
                    "<th>加黑时间</th>"+
                    "<th>解黑时间</th>"+
                    "<th>加黑描述</th>"+
                    "<th>操作</th>"+
                    "</tr>"+
                    "</thead>"+
                    "<tbody data-bind='foreach: blackList'>"+
                    "<tr>"+
                    "<td align='center'><span data-bind='text: id'></span></td>"+
                    "<td align='center'><span data-bind='text: nick'></span></td>"+
                    "<td align='center'><span data-bind='text: phone'></span></td>"+
                    "<td align='center'><span data-bind='text: create_time'></span></td>"+
                    "<td align='center'><span data-bind='text: last_login'></span></td>"+
                    "<td align='center'><span data-bind='text: time'></span></td>"+
                    "<td align='center'><span data-bind='text: expire'></span></td>"+
                    "<td align='center'><span data-bind='text: desc'></span></td>"+
                    "<td align='center'>"+
                    "<a href='' data-bind='click:outBlacklist'><span class='fontawesome-eye-open'></span>&nbsp;取消黑名单</a>"+
                    "</td>"+
                    "</tr>"+
                    "</tbody>"+
                    "<tfoot></tfoot>"+
                    "</table>" +
                    "<div id='page'>"+
                    "<div>当前第 <span style='font-size:2rem;color: #4db6ac' data-bind='text:startPosBlack'></span> 页&nbsp;&nbsp;&nbsp;每页 <span style='font-size:2rem;color: #4db6ac' data-bind='text:pageSizeBlack'></span> 项</div>"+
                    "<ul class='pager'>"+
                        "<li id='prevLi'><a data-bind='click:prevPageBlack' style='color: darkgray;cursor: pointer'>上一页</a></li>"+
                        "<li id='nextLi'><a data-bind='click:nextPageBlack' style='color: darkgray;cursor: pointer'>下一页</a></li>"+
                    "</ul>"+
                    "</div>"+
                    "</div>",
        columnClass: 'col-lg-12 col-md-12 col-sm-12 col-xs-12'
    });
    ko.applyBindings(vm,document.getElementById("black"));
    loadBlackList()
}

//加载黑名单列表
function loadBlackList(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startPos = (vm.startPosBlack() - 1) * vm.pageSizeBlack() + 1;
    postObj.pageSize = vm.pageSizeBlack();
    util.callServerFunction('adminGetBlacklist', postObj, function (data) {
        if (data.statusCode == 900) {
            vm.blackList.removeAll();
            if (data.list.length > 0) {
                var list = [];
                for (var i = 0; i < data.list.length; i++) {
                    list.push({
                        id: (i + 1),
                        phone: data.list[i].phone,
                        nick: data.list[i].nick,
                        create_time: util.convertTime2Str(data.list[i].create_time),
                        last_login: util.convertTime2Str(data.list[i].last_login),
                        time: util.convertTime2Str(data.list[i].time),
                        expire: util.convertTime2Str(data.list[i].expire),
                        desc: data.list[i].desc
                    });
                }
                vm.blackList(list);

            } else if (vm.startPosBlack() != 1) {
                vm.startPosBlack(vm.startPosBlack() - 1);
                loadBlackList();
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

//取消黑名单
function outBlacklist(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.phonenum = this.phone;
    postObj.action = "un";
    util.callServerFunction('adminAddBlacklist', postObj, function (data) {
        if (data.statusCode == 900) {
            util.toast("取消黑名单成功！","success","系统提示");
            loadBlackList();
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
        loadUserManageList();
    }
}

function nextPage(){
    vm.startPos(vm.startPos()+1);
    loadUserManageList();
}

function prevPageBlack(){
    if(vm.startPosBlack()==1){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"您已经在第一页了！"
        })
    }else{
        vm.startPosBlack(vm.startPosBlack()-1);
        loadBlackList();
    }
}

function nextPageBlack(){
    vm.startPosBlack(vm.startPosBlack()+1);
    loadBlackList();
}

function subLoadUserManageList(){
    vm.startPos(1);
    vm.pageSize(15);
    loadUserManageList();
}

var viewModel = function(){
    this.userManageList = ko.observableArray();
    this.blackList = ko.observableArray();
    this.initDeductIntegral = initDeductIntegral;
    this.initSendMessage = initSendMessage;
    this.initInBlacklist = initInBlacklist;
    this.startPos = ko.observable(1);
    this.pageSize = ko.observable(15);
    this.prevPage = prevPage;
    this.nextPage = nextPage;
    this.startPosBlack = ko.observable(1);
    this.pageSizeBlack = ko.observable(15);
    this.prevPageBlack = prevPageBlack;
    this.nextPageBlack = nextPageBlack;
};
var vm = new viewModel();
var dialog = "";
$(document).ready(function(){
    ko.applyBindings(vm,document.getElementById("userManagerTable"));
    document.onkeydown = function(event){
        e = event ? event :(window.event ? window.event : null);
        if(e.keyCode==13){
            subLoadUserManageList();
            return false;
        }
    }
});