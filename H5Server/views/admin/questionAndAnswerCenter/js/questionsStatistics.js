/**
 * Created by hjy on 2015/9/22 0019.
 */

function subLoadQuestionsStatisticsList(){
    vm.startPos(1);
    vm.pageSize(15);
    $("#empty").val("");
    loadQuestionsStatisticsList();
}

function subLoadQuestionsStatisticsListEmpty(){
    vm.startPos(1);
    vm.pageSize(15);
    $("#searchStatus").val("");
    $("#empty").val("true");
    loadQuestionsStatisticsList();
}

/*
    获取答疑题目列表
 */
function loadQuestionsStatisticsList(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startPos = (vm.startPos()-1)*vm.pageSize()+1;
    postObj.pageSize = vm.pageSize();
    postObj.startTime = new Date($("#startTime").val()).getTime();
    postObj.endTime = new Date($("#endTime").val()).getTime();
    postObj.s_phone = $("#sPhone").val();
    postObj.t_phone = $("#tPhone").val();
    postObj.status = $("#searchStatus").val();
    postObj.empty = $("#empty").val();
    postObj.grade = $("#grade").val();
    postObj.subject = $("#subject").val();
    util.callServerFunction('adminQAList',postObj, function(data){
        if(data.statusCode == 900){
            vm.questionsStatisticsList.removeAll();
            if(data.list.length > 0) {
                var teacherList = [];
                for (var i = 0; i < data.list.length; i++) {
                    var status = "";
                    if(data.list[i].status=="finished"){
                        status = "完成";
                    }else if(data.list[i].status=="canceled"){
                        status = "取消";
                    }else if(data.list[i].status=="timeout"){
                        status = "超时";
                    }else if(data.list[i].status=="received"){
                        status = "教师答疑中";
                    }else if(data.list[i].status=="toBeFinished"){
                        status = "待学生确认";
                    }else if(data.list[i].status=="failed"){
                        status = "失败";
                    }else if(data.list[i].status=="pending"){
                        status = "等待接单";
                    }
                    var endTime = "";
                    var betweenTime = "";
                    if(data.list[i].end_time != 0){
                        endTime = util.convertTime2Str(data.list[i].end_time).substring(11,19);
                        betweenTime = util.getBetweenTime(data.list[i].start_time,data.list[i].end_time);
                    }
                    teacherList.push({
                        id: (i+1),
                        oId: data.list[i].o_id,
                        sId: data.list[i].s_id,
                        sPhone: data.list[i].s_phone,
                        sNick: data.list[i].s_nick,
                        sAvatar: data.list[i].s_avatar,
                        tId: data.list[i].t_id,
                        tPhone: data.list[i].t_phone,
                        tNick: data.list[i].t_nick,
                        tAvatar: data.list[i].t_avatar,
                        tName: data.list[i].t_name,
                        staff: data.list[i].staff,
                        grade: data.list[i].grade,
                        subject: data.list[i].subject,
                        status: status,
                        //create_time: util.convertTime2Str(data.list[i].create_time) + endTime,
                        create_date: util.convertTime2Str(data.list[i].create_time).substring(0,10),
                        create_time: util.convertTime2Str(data.list[i].create_time).substring(10,util.convertTime2Str(data.list[i].create_time).length),
                        finish_time: endTime,
                        betweenTime: betweenTime,
                        end_time: util.convertTime2Str(data.list[i].end_time),
                        q_count: data.list[i].q_count,
                        chat_count: data.list[i].chat_count,
                        stars: data.list[i].stars
                    });
                }
                vm.questionsStatisticsList(teacherList);
                $('i').tooltip({
                    "margin-top": "50px"
                });
            }else if(vm.startPos()!=1){
                vm.startPos(vm.startPos()-1);
                loadQuestionsStatisticsList();
                $.dialog({
                    icon: 'icon icon-warning',
                    title: '提示信息',
                    content:"您已经在最后一页了！"
                })
            }else{
                $.dialog({
                    icon: 'icon icon-warning',
                    title: '提示信息',
                    content:"哎呦！没有数据哦！"
                })
            }
        }else{
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
        loadQuestionsStatisticsList();
    }
}

function nextPage(){
    vm.startPos(vm.startPos()+1);
    loadQuestionsStatisticsList();
}

/*
    显示答疑详情
 */
function showDetail(){
    var myDate = new Date();
    var sNick = this.sNick;
    var tNick = this.tNick;
    var tName = this.tName;
    var tPhone = this.tPhone;
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.o_id = this.oId;
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
            }else if(data.detail.status=="pending"){
                status = "等待接单";
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
            var sPhone = data.detail.s_phone;
            html += "<li>"+
                    "<i class='fa entypo-help'></i>"+
                    "<div class='timeline-item'>"+
                    "<div><h3 class='timeline-header'><i class='fontawesome-user'></i> "+ sNick +" (学生)</h3></div>" +
                    "<div>电话："+ sPhone +"</div>" +
                    "<div>学科："+ data.detail.grade + data.detail.subject +"</div>" +
                    "<div class='time'><i class='fa fa-clock-o'></i> 提单时间："+ util.convertTime2Str(data.detail.create_time) +"<br><i class='fa fa-clock-o'></i> 接单时间："+ util.convertTime2Str(data.detail.start_time) +"</div>"+
                    "<div><i class='fa fontawesome-exclamation-sign'></i> 订单状态："+ status +"</div>"+
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
            html += "</div></div></li>";
            if(chat_msg.length > 0) {
                for (var j = 0; j < chat_msg.length; j++) {
                    html += "<li>";
                    if(chat_msg[j].from == sid){
                        html += "<i class='fa entypo-user'></i>"+
                                "<div class='timeline-item'>"+
                                "<div><h4 class='timeline-header'><i class='entypo-user'></i> "+sNick+" (学生)</h4></div>" +
                                "<div>电话："+ sPhone +"</div>" +
                                "<div>学科："+ data.detail.grade + data.detail.subject +"</div>" +
                                "<div class='time'><i class='fa fa-clock-o'></i> "+ util.convertTime2Str(parseFloat(chat_msg[j].t)) +"</div>";
                    }else if(chat_msg[j].from == tid){
                        html += "<i class='fa entypo-graduation-cap'></i>" +
                                "<div class='timeline-item'>" +
                                "<div><h4 class='timeline-header'><i class='entypo-graduation-cap'></i> "+tNick+" (教师)</h4></div>" +
                                "<div>姓名："+ tName +"</div>" +
                                "<div>电话："+ tPhone +"</div>" +
                                "<div class='time'><i class='fa fa-clock-o'></i> "+ util.convertTime2Str(parseFloat(chat_msg[j].t)) +"</div>";
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

/*
    根据选择年级联动改变科目选项列表
 */
function changeSubject(){
    var option = "<option value=''>请选择年级</option>";
    if($("#grade").val() == "小学"){
        option = "<option value=''>-请选择-</option>"+
                 "<option value='数学'>数学</option>"+
                 "<option value='语文'>语文</option>"+
                 "<option value='英语'>英语</option>";
    }else if($("#grade").val() == "初中"){
        option = "<option value=''>-请选择-</option>"+
                "<option value='数学'>数学</option>"+
                "<option value='语文'>语文</option>"+
                "<option value='英语'>英语</option>"+
                "<option value='物理'>物理</option>"+
                "<option value='化学'>化学</option>";
    }else if($("#grade").val() == "高中"){
        option = "<option value=''>-请选择-</option>"+
                "<option value='数学'>数学</option>"+
                "<option value='语文'>语文</option>"+
                "<option value='英语'>英语</option>"+
                "<option value='物理'>物理</option>"+
                "<option value='化学'>化学</option>"+
                "<option value='生物'>生物</option>"+
                "<option value='地理'>地理</option>"+
                "<option value='历史'>历史</option>"+
                "<option value='政治'>政治</option>";
    }
    $("#subject").empty();
    $("#subject").append(option);
    $("#subject").selectpicker('refresh',{style: 'btn btn-info'});
    $(".btn-group").css("width",'100%');
}

/*
    查看原图
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
    导出Excel
 */
function saveAsExcel(){
    var newTab = window.open('about:blank');
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startPos = 1;
    postObj.pageSize = 999999;
    postObj.startTime = new Date($("#startTime").val()).getTime();
    postObj.endTime = new Date($("#endTime").val()).getTime();
    postObj.s_phone = $("#sPhone").val();
    postObj.t_phone = $("#tPhone").val();
    postObj.status = $("#searchStatus").val();
    postObj.empty = $("#empty").val();
    postObj.grade = $("#grade").val();
    postObj.subject = $("#subject").val();
    util.callServerFunction('adminQAList',postObj, function(data){
        if(data.statusCode == 900){
            var uri = 'data:application/vnd.ms-excel;base64,';
            var table = "<table border='1px'><tr style='font-size:16px'>"+
                "<th align='center'></th>"+
                "<th align='center' colspan='2'>学年</th>"+
                "<th align='center' colspan='2'>学生信息</th>"+
                "<th align='center' colspan='4'>教师信息</th>"+
                "<th align='center' colspan='5'>订单信息</th>"+
                "<th align='center' colspan='2'>答疑信息</th>"+
                "</tr>"+
                "<tr style='font-size:13px'>"+
                "<th align='center'>序号</th>"+
                "<th align='center'>年级</th>"+
                "<th align='center'>学科</th>"+
                "<th align='center'>学生昵称</th>"+
                "<th align='center'>学生联系电话</th>"+
                "<th align='center'>教师姓名</th>"+
                "<th align='center'>教师昵称</th>"+
                "<th align='center'>教师联系电话</th>"+
                "<th align='center'>是/否答疑中心老师</th>"+
                "<th align='center'>订单状态</th>"+
                "<th align='center'>创建日期</th>"+
                "<th align='center'>创建时间</th>"+
                "<th align='center'>完成时间</th>"+
                "<th align='center'>持续时间</th>"+
                "<th align='center'>问题描述信息数</th>"+
                "<th align='center'>师生答疑信息数</th>"+
                "</tr>";
            var staff = "不是"
            var status =  "";
            var endTime = "";
            var betweenTime = "";
            for (var i = 0; i < data.list.length; i++) {
                endTime = betweenTime = status = staff = "";
                if(data.list[i].status=="finished"){
                    status = "完成";
                }else if(data.list[i].status=="canceled"){
                    status = "取消";
                }else if(data.list[i].status=="timeout"){
                    status = "超时";
                }else if(data.list[i].status=="received"){
                    status = "教师答疑中";
                }else if(data.list[i].status=="toBeFinished"){
                    status = "待学生确认";
                }else if(data.list[i].status=="failed"){
                    status = "失败";
                }else if(data.list[i].status=="pending"){
                    status = "等待接单";
                }
                if(data.list[i].staff){
                    staff = "是";
                }
                if(data.list[i].end_time != 0){
                    endTime = util.convertTime2Str(data.list[i].end_time).substring(11,19);
                    betweenTime = util.getBetweenTime(data.list[i].start_time,data.list[i].end_time);
                }
                table += "<tr>" +
                    "<td align='center'>" + (i + 1) + "</td>" +
                    "<td align='center'>" + data.list[i].grade + "</td>" +
                    "<td align='center'>" + data.list[i].subject + "</td>" +
                    "<td align='center'>" + data.list[i].s_nick + "</td>" +
                    "<td align='center'>" + data.list[i].s_phone + "</td>" +
                    "<td align='center'>" + data.list[i].t_name + "</td>" +
                    "<td align='center'>" + data.list[i].t_nick + "</td>" +
                    "<td align='center'>" + data.list[i].t_phone + "</td>" +
                    "<td align='center'>" + staff + "</td>" +
                    "<td align='center'>" + status + "</td>" +
                    "<td align='center'>" + util.convertTime2Str(data.list[i].create_time).substring(0,10) + "</td>" +
                    "<td align='center'>" + util.convertTime2Str(data.list[i].create_time).substring(10,util.convertTime2Str(data.list[i].create_time).length) + "</td>" +
                    "<td align='center'>" + endTime + "</td>" +
                    "<td align='center'>" + betweenTime + "</td>" +
                    "<td align='center'>" + data.list[i].q_count + "</td>" +
                    "<td align='center'>" + data.list[i].chat_count + "</td>" +
                    "</tr>";
            }
            table += "</table>";
            var url = uri + window.btoa(unescape(encodeURIComponent(table)));
            newTab.location.href = url;
        }else{
            errorCodeApi(data.statusCode);
        }
    });
}

var viewModel = function(){
    this.questionsStatisticsList = ko.observableArray();
    this.loadQuestionsStatisticsList = loadQuestionsStatisticsList;
    this.showDetail = showDetail;
    this.prevPage = prevPage;
    this.nextPage = nextPage;
    this.startPos = ko.observable(1);
    this.pageSize = ko.observable(15);
};
var vm = new viewModel();
var date = new Date();
$(document).ready(function(){
    ko.applyBindings(vm,document.getElementById("questionsList"));
    util.initDateTimePicker("startTime",{defaultDate: new Date(date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + ' 00:00:00')});
    util.initDateTimePicker("endTime",{defaultDate: new Date(date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + " 23:59:59")});
    $('.selectpicker').selectpicker({
        style: 'btn btn-info'
    });
    $('.btn-group').css("width","100%");
    loadQuestionsStatisticsList();
    document.onkeydown=function(event){
        e = event ? event :(window.event ? window.event : null);
        if(e.keyCode==13){
            subLoadQuestionsStatisticsList();
            return false;
        }
    }
});