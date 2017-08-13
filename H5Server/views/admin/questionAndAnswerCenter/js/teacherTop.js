/**
 * Created by hjy on 2015/9/21
 */

/*
    加载教师排行列表
 */
function loadTeacherTop(){
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
    }else{
        var postObj = {};
        postObj.userID = util.getSessionStorage("userID");
        postObj.authSign = util.getSessionStorage("authSign");
        postObj.startTime = new Date($("#startTime").val()).getTime();
        postObj.endTime = new Date($("#endTime").val()).getTime();
        util.callServerFunction('adminQATeacherStat',postObj, function(data){
            if(data.statusCode == 900){
                vm.teacherTopList.removeAll();
                vm.teachers.removeAll();
                vm.counts.removeAll();
                if(data.list.length > 0) {
                    var teacherList = [];
                    for (var i = 0; i < data.list.length; i++) {
                        teacherList.push({
                            id: (i+1),
                            u_id: data.list[i].u_id,
                            phone: data.list[i].phone,
                            nick: data.list[i].nick,
                            name: data.list[i].name,
                            count: data.list[i].count
                        });
                        vm.teachers.push(data.list[i].name);
                        vm.counts.push(parseInt(data.list[i].count));
                    }
                    vm.teacherTopList(teacherList);
                    initHighCharts();
                }else{
                    $.dialog({
                        icon: 'icon icon-warning',
                        title: '提示信息',
                        content:"您是第一名唉！"
                    })
                }
            }else{
                errorCodeApi(data.statusCode);
            }
        });
    }
}

/*
    初始化条形图
 */
function initHighCharts(){
    $('#highcharts').css("height",vm.teachers().length*40+135);
    $('#highcharts').highcharts({
        chart: {
            type: 'bar'
        },
        title: {
            text: '教师答疑数量排行'
        },
        subtitle: {
            text: '答疑中心'
        },
        xAxis: {
            categories: vm.teachers(),
            title: {
                text: "教师"
            }
        },
        yAxis: {
            min: 0,
            labels: {
                overflow: 'justify'
            },
            title: {
                text: "答疑数量"
            }
        },
        tooltip: {
            valueSuffix: ''
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: true
                }
            },
            spline:{
                lineWidth:2  //线条粗细
            }
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            x: -40,
            y: 100,
            floating: true,
            borderWidth: 1,
            backgroundColor: '#FFFFFF',
            shadow: true
        },
        credits: {
            enabled: false
        },
        series: [{
            name: "答疑数量",
            data: vm.counts()
        }],
        exporting: {
            enabled: false
        }
    });
}

function searchTA(){
    startTimeAll = $("#startTime").val();
    endTimeAll = $("#endTime").val();
    phoneAll = this.phone;
    tabTeacherAnswer();
}

function saveAsExcel(){
    var newTab = window.open('about:blank');
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startTime = new Date($("#startTime").val()).getTime();
    postObj.endTime = new Date($("#endTime").val()).getTime();
    util.callServerFunction('adminQATeacherStat', postObj, function (data) {
        if (data.statusCode == 900) {
            var uri = 'data:application/vnd.ms-excel;base64,';
            var table = "<table border='1px'><tr style='font-size:16px'>" +
                "<th bgcolor='#5f9ea0'>排名</th>" +
                "<th bgcolor='#5f9ea0'>姓名</th>" +
                "<th bgcolor='#5f9ea0'>联系电话</th>" +
                "<th bgcolor='#5f9ea0'>昵称</th>" +
                "<th bgcolor='#5f9ea0'>答疑数量</th>" +
                "</tr>";
            for (var i = 0; i < data.list.length; i++) {
                table += "<tr>" +
                    "<td align='center'>" + (i + 1) + "</td>" +
                    "<td align='center'>" + data.list[i].name + "</td>" +
                    "<td align='center'>" + data.list[i].phone + "</td>" +
                    "<td align='center'>" + data.list[i].nick + "</td>" +
                    "<td align='center'>" + data.list[i].count + "</td>" +
                    "</tr>";
            }
            table += "</table>";
            var url = uri + window.btoa(unescape(encodeURIComponent(table)));
            newTab.location.href = url;
        } else {
            errorCodeApi(resp.statusCode);
        }
    });
}

var viewModel = function(){
    this.teacherTopList = ko.observableArray();
    this.loadTeacherTop = loadTeacherTop;
    this.searchTA = searchTA;

    this.teachers = ko.observableArray();
    this.counts = ko.observableArray();
};
var vm = new viewModel();
var date = new Date();
$(document).ready(function(){
    ko.applyBindings(vm,document.getElementById("teacherTop"));
    util.initDateTimePicker("startTime",{defaultDate: new Date(date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + ' 00:00:00')});
    util.initDateTimePicker("endTime",{defaultDate: new Date(date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + " 23:59:59")});
    loadTeacherTop();
    document.onkeydown=function(event){
        e = event ? event :(window.event ? window.event : null);
        if(e.keyCode==13){
            loadTeacherTop();
            return false;
        }
    }
});