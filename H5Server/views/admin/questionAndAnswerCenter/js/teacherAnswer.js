/**
 * Created by hjy on 2015/9/23
 */

/*
    获取教师答疑列表
 */
function loadTeacherAnswerLsit(){
    if($('#tPhone').val()==""){
        $('#tPhone').val($('#tPhoneSelect').val());
    }
    if($('#startTime').val()==""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content: "请填写开始时间！"
        });
    }else if($('#endTime').val()==""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content: "请填写结束时间！"
        });
    }else if($('#tPhone').val()==""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content: "请填写教师电话！"
        });
    }else{
        var postObj = {};
        postObj.userID = util.getSessionStorage("userID");
        postObj.authSign = util.getSessionStorage("authSign");
        postObj.startPos = (vm.startPos-1)*vm.pageSize+1;
        postObj.pageSize = vm.pageSize;
        postObj.startTime = new Date($("#startTime").val()).getTime();
        postObj.endTime = new Date($("#endTime").val()).getTime();
        postObj.phonenum = $("#tPhoneSelect").val();
        util.callServerFunction('adminQADailyStat',postObj, function(data){
            if(data.statusCode == 900){
                $("#pieDiv").empty();
                vm.teacherAnswer.removeAll();
                var list = [];
                if(data.list.length > 0) {
                    for(var i=0;i<data.list.length;i++){
                        var date = data.list[i].date;
                        var detail = "";
                        $.each(data.list[i].detail,function(name,value){
                            if(name=="小学"){
                                detail += "<span class='label label-success'>"+name+" "+value+"</span>&nbsp;&nbsp;";
                            }else if(name=="初中"){
                                detail += "<span class='label label-warning'>"+name+" "+value+"</span>&nbsp;&nbsp;";
                            }else if(name=="高中"){
                                detail += "<span class='label label-info'>"+name+" "+value+"</span>&nbsp;&nbsp;";
                            }else{
                                detail += "<span class='label label-primary'>"+name+" "+value+"</span>&nbsp;&nbsp;";
                            }
                        });
                        list.push({
                            id: (i+1),
                            date: date.substring(0,4)+"-"+date.substring(4,6)+"-"+date.substring(6,8),
                            count: data.list[i].count,
                            s_count: data.list[i].s_count,
                            detail:detail
                        });
                    }
                    vm.teacherAnswer(list);
                }else if(vm.startPos!=1){
                    vm.startPos = vm.startPos-1;
                    loadTeacherAnswerLsit();
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
            }else if(data.statusCode == 902){
                $.dialog({
                    icon: 'icon icon-warning',
                    title: '提示信息',
                    content: "该手机号暂未注册！"
                });
            }else{
                errorCodeApi(data.statusCode);
            }
        });
    }
}

function prevPage(){
    if(vm.startPos==1){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"您已经在第一页了！",
            columnClass: "large-12"
        })
    }else{
        vm.startPos = vm.startPos-1;
        loadTeacherAnswerLsit();
    }
}

function nextPage(){
    vm.startPos = vm.startPos+1;
    loadTeacherAnswerLsit();
}

function saveAsExcel(){
    if($('#tPhone').val()==""){
        $('#tPhone').val($('#tPhoneSelect').val());
    }
    if($('#startTime').val()==""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content: "请填写开始时间！"
        });
    }else if($('#endTime').val()==""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content: "请填写结束时间！"
        });
    }else if($('#tPhone').val()==""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content: "请填写教师电话！"
        });
    }else {
        var newTab = window.open('about:blank');
        var postObj = {};
        postObj.userID = util.getSessionStorage("userID");
        postObj.authSign = util.getSessionStorage("authSign");
        postObj.startPos = 1;
        postObj.pageSize = 9999999;
        postObj.startTime = new Date($("#startTime").val()).getTime();
        postObj.endTime = new Date($("#endTime").val()).getTime();
        postObj.phonenum = $("#tPhoneSelect").val();
        util.callServerFunction('adminQADailyStat', postObj, function (data) {
            if (data.statusCode == 900) {
                var uri = 'data:application/vnd.ms-excel;base64,';
                var table = "<table border='1'><tr style='font-size:16px'>" +
                    "<th bgcolor='#5f9ea0'>序号</th>" +
                    "<th bgcolor='#5f9ea0'>时间</th>" +
                    "<th bgcolor='#5f9ea0'>答疑数</th>" +
                    "<th bgcolor='#5f9ea0'>学生数</th>" +
                    "<th bgcolor='#5f9ea0'>答疑详情</th>" +
                    "</tr>";
                for (var i = 0; i < data.list.length; i++) {
                    var date = data.list[i].date;
                    var detail = "";
                    $.each(data.list[i].detail, function (name, value) {
                        detail += name + "(" + value + ")&nbsp;&nbsp;";
                    });
                    table += "<tr>" +
                        "<td align='center'>" + (i + 1) + "</td>" +
                        "<td align='left'>" + date.substring(0, 4) + "-" + date.substring(4, 6) + "-" + date.substring(6, 8) + "</td>" +
                        "<td align='center'>" + data.list[i].count + "</td>" +
                        "<td align='center'>" + data.list[i].s_count + "</td>" +
                        "<td align='left'>" + detail + "</td>" +
                        "</tr>";
                }
                table += "</table>";
                var url = uri + window.btoa(unescape(encodeURIComponent(table)));
                newTab.location.href = url;
            }else if(data.statusCode == 902){
                $.dialog({
                    icon: 'icon icon-warning',
                    title: '提示信息',
                    content: "该手机号暂未注册！"
                });
            }else{
                errorCodeApi(data.statusCode);
            }
        });
    }
}

function subLoadTeacherAnswerLsit(){
    vm.startPos = 1;
    vm.pageSize = 15;
    loadTeacherAnswerLsit();
}

var viewModel = function(){
    this.teacherAnswer = ko.observableArray();
    this.loadTeacherAnswerLsit = loadTeacherAnswerLsit;
    this.prevPage = prevPage;
    this.nextPage = nextPage;
    this.startPos = 1;
    this.pageSize = 15;
};
var vm = new viewModel();
var date = new Date();
$(document).ready(function(){
    ko.applyBindings(vm,document.getElementById("teacherAnswer"));
    util.initDateTimePicker("startTime",{defaultDate: new Date(date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + ' 00:00:00')});
    util.initDateTimePicker("endTime",{defaultDate: new Date(date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + " 23:59:59")});

    //初始化自动填充
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.type = "simple";
    util.callServerFunction('adminQACenterTeacherList',postObj, function(data){
        if(data.statusCode == 900){
            var teachers = data.list;
            $.fn.typeahead.Constructor.prototype.blur = function () {
                var that = this;
                setTimeout(function () { that.hide() }, 250);
            };
            $('#tPhoneSelect').typeahead({
                source: function (query, process) {
                    var list = [];
                    $.each(teachers,function(name,value){
                        list.push(value.name+"-"+value.phonenum)
                    });
                    return list;
                },
                items: 8,
                highlighter: function (item) {
                    return "" + item + "";
                },
                updater: function (item) {
                    $("#tPhone").val(item.substring(item.indexOf('-')+1,item.length));
                    return item;
                }
            });
        }else{
            errorCodeApi(data.statusCode);
        }
    });

    //教师答疑排行跳转接口
    $("#startTime").val(startTimeAll==""?date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + ' 00:00:00':startTimeAll);
    $("#endTime").val(endTimeAll==""?date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + ' 23:59:59':endTimeAll);
    $("#tPhone").val(phoneAll==""?"":phoneAll);
    $("#tPhoneSelect").val(phoneAll==""?"":phoneAll);
    if(phoneAll!=""){
        loadTeacherAnswerLsit();
    }
    startTimeAll = endTimeAll = phoneAll = "";
    document.onkeydown=function(event){
        e = event ? event :(window.event ? window.event : null);
        if(e.keyCode==13){
            subLoadTeacherAnswerLsit();
            return false;
        }
    }
});