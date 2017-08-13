/**
 * Created by hjy on 2015/11/10 0010.
 */

function loadUserReportList(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startPos = (vm.startPos()-1)*vm.pageSize()+1;
    postObj.pageSize = vm.pageSize();
    util.callServerFunction('adminGetReportList', postObj, function (data) {
        if (data.statusCode == 900) {
            vm.userReportList.removeAll();
            if (data.list.length > 0) {
                var list = [];
                for (var i = 0; i < data.list.length; i++) {
                    var reportType = data.list[i].reportType,type = data.list[i].type;
                    if(data.list[i].reportType == "advertise"){
                        reportType = "广告等垃圾信息";
                    }else if(data.list[i].reportType == "unfriendly"){
                        reportType = "不友善内容";
                    }else if(data.list[i].reportType == "illegal"){
                        reportType = "违反法律法规";
                    }else if(data.list[i].reportType == "political"){
                        reportType = "不宜公开的政治内容";
                    }else if(data.list[i].reportType == "other"){
                        reportType = "其他";
                    }
                    if(data.list[i].type == "offlineTopic"){
                        type = "离线问题";
                    }else if(data.list[i].type == "order"){
                        type = "即时订单";
                    }
                    list.push({
                        id: (i + 1),
                        u_id: data.list[i].u_id,
                        r_id: data.list[i].r_id,
                        phone: data.list[i].phone,
                        nick: data.list[i].nick,
                        type: type,
                        reportID: data.list[i].reportID,
                        reportType: reportType,
                        reportDesc: data.list[i].reportDesc,
                        userType: data.list[i].userType,
                        time: util.convertTime2Str(data.list[i].time)
                    });
                }
                vm.userReportList(list);
                $('i').tooltip({
                    "margin-top": "50px"
                });
            } else if (vm.startPos() != 1) {
                vm.startPos(vm.startPos() - 1);
                loadUserReportList();
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
        loadUserReportList();
    }
}

function nextPage(){
    vm.startPos(vm.startPos()+1);
    loadUserReportList();
}

function showDetail(){
    if(this.type == "离线问题"){
        showOfflineTopic(this.reportID);
    }else if(this.type == "即时订单"){
        showOther(this.reportID);
    }
}

function showOfflineTopic(off_id){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.off_id = off_id;
    postObj.startPos = 1;
    postObj.pageSize = 1;
    util.callServerFunction('adminGetTopicDetail',postObj, function(data){
        if(data.statusCode == 900){
            var html = "";
            var tag = "";
            if(data.detail.tag.length>0){
                for(var j=0;j<data.detail.tag.length;j++){
                    tag += "<span class='label label-info'>"+data.detail.tag[j]+"</span>&nbsp;";
                }
            }
            html = "<table class='table'>"+
                "<tbody>"+
                "<tr>"+
                "<td class='col-lg-3 col-md-4 col-sm-5 col-xs-6'><i class='fa fontawesome-user'></i> 问题作者昵称：</td>"+
                "<td class='subject'>"+ data.detail.author_nick +"</td>"+
                "</tr>"+
                "<tr>"+
                "<td style='width:19%'><i class='fa fontawesome-flag'></i> 问题主题：</td>"+
                "<td class='subject'>"+ data.detail.topic +"</td>"+
                "</tr>"+
                "<tr>"+
                "<td style='width:19%'><i class='fa fontawesome-tags'></i> 问题标签：</td>"+
                "<td class='subject'>"+ tag +"</td>"+
                "</tr>"+
                "<tr>"+
                "<td style='width:19%'><i class='fa fontawesome-calendar'></i> 离线问题创建时间：</td>"+
                "<td class='subject'>"+ util.convertTime2Str(data.detail.createTime) +"</td>"+
                "</tr>"+
                "<tr>"+
                "<td style='width:19%'><i class='fa fontawesome-comments'></i> 最新回复时间：</td>"+
                "<td class='subject'>"+ util.convertTime2Str(data.detail.lastReplyTime) +"</td>"+
                "</tr>"+
                "<tr>"+
                "<td style='width:19%'><i class='fa fontawesome-pinterest'></i> 点击量：</td>"+
                "<td class='subject'>"+ data.detail.visit +"</td>"+
                "</tr>"+
                "<tr>"+
                "<td style='width:19%'><i class='fa fontawesome-comment-alt'></i> 回复数：</td>"+
                "<td class='subject'>"+ data.detail.reply +"</td>"+
                "</tr>"+
                "<tr>"+
                "<td style='width:19%'><i class='fa fontawesome-thumbs-up'></i> 收藏数：</td>"+
                "<td class='subject'>"+ data.detail.collect +"</td>"+
                "</tr>"+
                "<tr>"+
                "<td style='width:19%'><i class='fa fontawesome-heart'></i> 关注数：</td>"+
                "<td class='subject'>"+ data.detail.watch +"</td>"+
                "</tr>";
            var q_msg  = data.detail.q_msg;
            html += "<tr><td style='width:19%'><i class='fa fontawesome-list-alt'></i> 问题详情：</td><td class='subject'>";
            if(q_msg.length>0){
                for(var i=0;i<q_msg.length;i++){
                    html += "<div style='margin-top:5px;border-left: 5px #CCCCCC solid;padding-left: 10px'>";
                    if(q_msg[i].type == "text"){
                        html += q_msg[i].msg;
                    }else if(q_msg[i].type == "image"){
                        var width,height;
                        if(q_msg[i].orientation=="portrait"){
                            width = "180px";
                            height = "320px";
                        }else{
                            width = "320px";
                            height = "180px";
                        }
                        width = "50%";
                        height = "auto";
                        html += "<div style='cursor:pointer;margin-top:5px' onclick=\"showSrcImg('"+ util.changeUrl(q_msg[i].msg) +"')\"><img width='"+width+"' height='"+height+"' src='"+ util.changeUrl(q_msg[i].msg) +"'></div>";
                    }else if(q_msg[i].type == "voice"){
                        html += "<audio src='http://123.57.16.157:8062/redirectAmr?url="+q_msg[i].msg+"' controls='controls'></audio>";
                    }
                    html += "</div>";
                }
            }
            var nick = data.detail.author_nick, u_id = data.detail.author_id;
            postObj = {}
            postObj.userID = util.getSessionStorage("userID");
            postObj.authSign = util.getSessionStorage("authSign");
            postObj.u_id = u_id;
            util.callServerFunction('adminGetUserInfo',postObj, function(data) {
                if (data.statusCode == 900) {
                    html += "</td></tr><tr><td colspan='2' align='center'>" +
                        "<div class='btn-group'>" +
                        "<button type='button' class='btn btn-primary' onclick=\"initSendMessage('"+nick+"','"+data.list[0].phone+"')\"><span class='entypo-mail'></span>&nbsp;&nbsp;发送短信</button>" +
                        "<button type='button' class='btn btn-primary' onclick=\"initDeductIntegral('"+nick+"','"+data.list[0].phone+"','"+u_id+"')\"><span class='entypo-minus'></span>&nbsp;&nbsp;扣减积分</button>" +
                        "<button type='button' class='btn btn-primary' onclick=\"initInBlacklist('"+nick+"','"+data.list[0].phone+"')\"><span class='entypo-eye'></span>&nbsp;&nbsp;加入黑名单</button>" +
                        "</div>" +
                        "</td></tr></tbody><table>";
                }else{
                    html = "抱歉！无法找到此问题详情！";
                    errorCodeApi(data.statusCode);
                }
                $.dialog({
                    icon: "icon icon-document-edit",
                    title: '举报问题详情',
                    content: html
                });
            });
        }else{
            errorCodeApi(data.statusCode);
        }
    });
}

/*
 显示图片原图
 */
function showSrcImg(src){
    $.dialog({
        icon: "icon icon-document-edit",
        title: '原图',
        content: "<div align='center'><button class='btn btn-success' onclick=\"util.rotateImg('testImg', 'left')\"><span class='entypo-ccw'></span>&nbsp;&nbsp;左转</button>&nbsp;&nbsp;"+
        "<button class='btn btn-success' onclick=\"util.rotateImg('testImg', 'right')\">右转&nbsp;&nbsp;<span class='entypo-cw'></span></button></div>" +
        "<br><img style='width:100%;max-width:100%;height:auto' src='"+src+"' id='testImg'>",
        columnClass: 'col-lg-12 col-md-6 col-sm-3 col-xs-2'
    });
}

/*
 显示答疑详情
 */
function showOther(oId){
    var myDate = new Date();
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.o_id = oId;
    util.callServerFunction('adminQAOrderDetail',postObj, function(data){
        if(data.statusCode == 900){
            var status = "";
            if(data.detail.status=="finished"){
                status = "完成";
            }else if(data.detail.status=="canceled"){
                status = "取消";
            }else if(data.detail.status=="timeout"){
                status = "超时";
            }else if(data.detail.status=="received"){
                status = "教师答疑中";
            }else if(data.detail.status=="toBeFinished"){
                status = "待学生确认";
            }else if(data.detail.status=="failed"){
                status = "失败";
            }
            var html = "<div class='content-wrap'>"+
                "<div class='time-wrap'>"+
                "<div class='row'>"+
                "<div class='col-md-12'>"+
                "<ul class='timeline'>"+
                "<li class='time-label'>"+
                "<span class='bg-red'>"+myDate.getFullYear()+"年</span>"+
                "</li>";
            var sid = data.detail.s_id;
            var tid = data.detail.t_id;
            var q_msg = data.detail.q_msg;
            var chat_msg = data.detail.chat_msg;
            var sNick = data.detail.s_nick;
            var sPhone = data.detail.s_phone;
            var tNick = data.detail.t_nick;
            var tPhone = data.detail.t_phone;
            html += "<li>"+
                "<i class='fa entypo-help'></i>"+
                "<div class='timeline-item'>"+
                "<div><h3 class='timeline-header'><i class='entypo-user'></i> "+ sNick +" (学生)</h3></div>" +
                "<div>电话："+ sPhone +"</div>" +
                "<div>学科："+ data.detail.grade + data.detail.subject +"</div>" +
                "<div class='time'><i class='fa fa-clock-o'></i> 提单时间："+ util.convertTime2Str(data.detail.create_time) +"<br><i class='fa fa-clock-o'></i> 接单时间："+ util.convertTime2Str(data.detail.start_time) +"</div>"+
                "<div><i class='fa fontawesome-exclamation-sign'></i> 订单状态："+ status +"</div>"+
                "<div class='btn-group'>" +
                "<button type='button' class='btn btn-primary' onclick=\"initSendMessage('"+ sNick +"','"+ sPhone +"')\"><span class='entypo-mail'></span>&nbsp;&nbsp;发送短信</button>" +
                "<button type='button' class='btn btn-primary' onclick=\"initDeductIntegral('"+ sNick +"','"+ sPhone +"','"+ sid +"')\"><span class='entypo-minus'></span>&nbsp;&nbsp;扣减积分</button>" +
                "<button type='button' class='btn btn-primary' onclick=\"initInBlacklist('"+ sNick +"','"+ sPhone +"')\"><span class='entypo-eye'></span>&nbsp;&nbsp;加入黑名单</button>" +
                "</div>" +
                "<div class='timeline-body'>";
            if(q_msg.length>0){
                for(var i=0;i<q_msg.length;i++){
                    if(q_msg[i].type == "text"){
                        html += "<div style='border-left: 5px #CCCCCC solid;padding-left: 10px;margin-bottom: 10px'>"+q_msg[i].msg+"</div>";
                    }else if(q_msg[i].type == "image"){
                        var width,height;
                        if(q_msg[i].orientation=="portrait"){
                            width = "180px";
                            height = "320px";
                        }else{
                            width = "320px";
                            height = "180px";
                        }
                        html += "<div style='cursor:pointer;border-left: 5px #CCCCCC solid;padding-left: 10px;margin-bottom: 10px' onclick=\"showSrcImg('"+ util.changeUrl(q_msg[i].msg) +"')\"><img width='"+width+"' height='"+height+"' src='"+ util.changeUrl(q_msg[i].msg) +"'></div>";
                    }else if(q_msg[i].type == "voice"){
                        html += "<div style='border-left: 5px #CCCCCC solid;padding-left: 10px;margin-bottom: 10px'><audio src='http://123.57.16.157:8062/redirectAmr?url="+q_msg[i].msg+"' controls='controls'></audio></div>";
                    }
                }
            }
            html += "</div>"+
                "</div>"+
                "</li>";
            if(chat_msg.length > 0) {
                for (var j = 0; j < chat_msg.length; j++) {
                    html += "<li>";
                    if(chat_msg[j].from == sid){
                        html += "<i class='fa entypo-user'></i>"+
                            "<div class='timeline-item'>"+
                            "<div><h4 class='timeline-header'><i class='entypo-user'></i> "+ sNick +" (学生)</h4></div>" +
                            "<div>电话："+ sPhone +"</div>" +
                            "<div>学科："+ data.detail.grade + data.detail.subject +"</div>" +
                            "<div class='time'><i class='fa fa-clock-o'></i> "+ util.convertTime2Str(parseFloat(chat_msg[j].t)) +"</div>"+
                            "<div class='btn-group'>" +
                            "<button type='button' class='btn btn-primary' onclick=\"initSendMessage('"+ sNick +"','"+ sPhone +"')\"><span class='entypo-mail'></span>&nbsp;&nbsp;发送短信</button>" +
                            "<button type='button' class='btn btn-primary' onclick=\"initDeductIntegral('"+ sNick +"','"+ sPhone +"','"+ sid +"')\"><span class='entypo-minus'></span>&nbsp;&nbsp;扣减积分</button>" +
                            "<button type='button' class='btn btn-primary' onclick=\"initInBlacklist('"+ sNick +"','"+ sPhone +"')\"><span class='entypo-eye'></span>&nbsp;&nbsp;加入黑名单</button>" +
                            "</div>";
                    }else if(chat_msg[j].from == tid){
                        html += "<i class='fa entypo-graduation-cap'></i>"+
                            "<div class='timeline-item'>"+
                            "<div><h4 class='timeline-header'><i class='entypo-graduation-cap'></i> "+ tNick +" (教师)</h4></div>" +
                            "<div>电话："+ tPhone +"</div>" +
                            "<div class='time'><i class='fa fa-clock-o'></i> "+ util.convertTime2Str(parseFloat(chat_msg[j].t)) +"</div>"+
                            "<div class='btn-group'>" +
                            "<button type='button' class='btn btn-primary' onclick=\"initSendMessage('"+ tNick +"','"+ tPhone +"')\"><span class='entypo-mail'></span>&nbsp;&nbsp;发送短信</button>" +
                            "<button type='button' class='btn btn-primary' onclick=\"initDeductIntegral('"+ tNick +"','"+ tPhone +"','"+ tid +"')\"><span class='entypo-minus'></span>&nbsp;&nbsp;扣减积分</button>" +
                            "<button type='button' class='btn btn-primary' onclick=\"initInBlacklist('"+ tNick +"','"+ tPhone +"')\"><span class='entypo-eye'></span>&nbsp;&nbsp;加入黑名单</button>" +
                            "</div>";
                    }
                    html += "<div class='timeline-body'>";
                    if(chat_msg[j].type == "text"){
                        html += "<div style='border-left: 5px #CCCCCC solid;padding-left: 10px;margin-bottom: 10px'>"+chat_msg[j].msg+"</div>";
                    }else if(chat_msg[j].type == "image"){
                        var width,height;
                        if(chat_msg[j].orientation=="portrait"){
                            width = "180px";
                            height = "320px";
                        }else{
                            width = "320px";
                            height = "180px";
                        }
                        html += "<div style='cursor:pointer;border-left: 5px #CCCCCC solid;padding-left: 10px;margin-bottom: 10px' onclick=\"showSrcImg('"+ util.changeUrl(chat_msg[j].msg) +"')\"><img width='"+width+"' height='"+height+"' src='"+ util.changeUrl(chat_msg[j].msg) +"'></div>";
                    }else if(chat_msg[j].type == "voice"){
                        html += "<div style='border-left: 5px #CCCCCC solid;padding-left: 10px;margin-bottom: 10px'><audio src='http://123.57.16.157:8062/redirectAmr?url="+chat_msg[j].msg+"' controls='controls'></audio></div>";
                    }
                    html += "</div></div></li>";
                }
            }
            html += "</ul>"+
                "</div>"+
                "</div>"+
                "</div>"+
                "</div>";
            $.dialog({
                icon: "icon icon-document-edit",
                title: '答疑详情',
                content: html
            });
        }else{
            errorCodeApi(data.statusCode);
        }
    });
}

function initManageReport(nick,phone,u_id){
    var html = "<button type='button' class='btn btn-primary' onclick=\"initSendMessage('"+nick+"','"+phone+"')\"><span class='entypo-mail'></span>&nbsp;&nbsp;发送短信</button>" +
               "<button type='button' class='btn btn-primary' onclick=\"initDeductIntegral('"+nick+"','"+phone+"','"+u_id+"')\"><span class='entypo-minus'></span>&nbsp;&nbsp;扣减积分</button>" +
               "<button type='button' class='btn btn-primary' onclick=\"initInBlacklist('"+nick+"','"+phone+"')\"><span class='entypo-eye'></span>&nbsp;&nbsp;加入黑名单</button>";
    dialog = $.dialog({
        icon: "icon icon-document-edit",
        title: '举报处理',
        content: html
    });
}

//显示发送短信弹出层
function initSendMessage(nick,phone){
    if(phone == ""){
        dialog = $.alert({
            title: "系统提示",
            content: "用户<span class='label label-info'>"+ nick +"</span>未填写手机号码，暂时无法发送短信，请选择其他操作",
            confirmButton: "我知道了"
        });
    }else {
        dialog = $.dialog({
            icon: 'icon icon-mail',
            title: '发送短信',
            content: "<div>" +
            "<div>用户昵称：" + nick + "</div>" +
            "<div>手机号：" + phone + "</div>" +
            "<div class='form-group'><div>短信类型：被举报<input type='hidden' id='template' value='complain'>" +
            "</div>" +
            "<div>短信内容：" +
            "<div id='select6'>" +
            "【CallCall教师】您好，尊敬的用户您好，由于您的账号被举报存在<input type='text' id='action2' style='width:145px;display: inline;border: 0px #CCCCCC solid;border-bottom: 1px #C7D5E0 solid;color: #C7D5E0;text-align: center' placeholder='请填写账号行为'>行为，经过我们核实，现决定对您的账号<input type='text' id='result2' style='width:150px;display: inline;border: 0px #CCCCCC solid;border-bottom: 1px #C7D5E0 solid;color: #C7D5E0;text-align: center' placeholder='请填写账号处理'/>。" +
            "</div></div>" +
            "<div align='center'><button class='btn btn-primary' onclick='sendMessage()'>发 送</button></div>" +
            "<input type='hidden' id='phoneNum' value='" + phone + "'>" +
            "</div></div>"
        });
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
            } else {
                errorCodeApi(data.statusCode);
            }
        });
    }
}

//显示扣减积分弹出层
function initDeductIntegral(nick,phone,u_id){
    dialog = $.dialog({
        icon: 'icon icon-minus',
        title: '扣减积分',
        content: "<div>" +
        "<div>用户昵称："+ nick +"</div>"+
        "<div>手机号："+ phone +"</div>"+
        "<div class='form-group'><label>扣减积分数：</label><input type='text' class='form-control' id='integral' value=''></div>" +
        "<div align='center'><button class='btn btn-primary' onclick='deductIntegral()'>扣 减</button></div>"+
        "<input type='hidden' id='u_id' value='"+ u_id +"'>"+
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
            } else {
                errorCodeApi(data.statusCode);
            }
        });
    }
}

//显示加入黑名单弹出层
function initInBlacklist(nick,phone){
    dialog = $.dialog({
        icon: 'fontawesome-eye-close',
        title: '加入黑名单',
        content: "<div>" +
        "<div>用户昵称："+ nick +"</div>"+
        "<div>手机号："+ phone +"</div>"+
        "<div class='form-group'><label>解黑时间：</label>"+
        "<input id='expireTime' class='form-control' type='text'>"+
        "</div>" +
        "<div class='form-group'><label>加黑备注：</label><textarea id='desc' rows='5' style='width:100%;height:50px;border-color: #C7D5E0'></textarea></div>" +
        "<div align='center'><button class='btn btn-primary' onclick='inBlacklist()'>确 定</button></div>"+
        "<input type='hidden' id='phoneNum' value='"+ phone +"'>"+
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
            } else {
                errorCodeApi(data.statusCode);
            }
        });
    }
}

var viewModel = function(){
    this.userReportList = ko.observableArray();
    this.startPos = ko.observable(1);
    this.pageSize = ko.observable(15);
    this.prevPage = prevPage;
    this.nextPage = nextPage;
    this.loadUserReportList = loadUserReportList;
    this.showDetail = showDetail;
    this.initManageReport = initManageReport;
};
var vm = new viewModel();
$(document).ready(function(){
    ko.applyBindings(vm,document.getElementById("userReportManage"));
    loadUserReportList();
});