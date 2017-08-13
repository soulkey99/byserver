/**
 * Created by hjy on 2015/9/23
 */

/*
    加载系统答疑列表
 */
function loadSystemAnswerLsit(){
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
        util.callServerFunction('adminQAStat',postObj, function(data){
            if(data.statusCode == 900){
                $("#pieDiv").empty();
                vm.systemAnswer.removeAll();
                var listOption = {};
                var dataList = [];
                if(data.stats != "" && data.stats.total>0) {
                    listOption = {
                        name: "超时",
                        y: data.stats.timeout,
                        status: "timeout",
                        grade: "",
                        subject: ""
                    }
                    dataList.push(listOption);

                    listOption = {
                        name: "取消",
                        y: data.stats.canceled,
                        status: "canceled",
                        grade: "",
                        subject: ""
                    }
                    dataList.push(listOption);

                    listOption = {
                        name: "完成",
                        y: data.stats.finished,
                        status: "finished",
                        grade: "",
                        subject: ""
                    }
                    dataList.push(listOption);

                    listOption = {
                        name: "等待中",
                        y: data.stats.pending,
                        status: "pending",
                        grade: "",
                        subject: ""
                    }
                    dataList.push(listOption);

                    listOption = {
                        name: "已接单",
                        y: data.stats.received,
                        status: "received",
                        grade: "",
                        subject: ""
                    }
                    dataList.push(listOption);

                    listOption = {
                        name: "待确认",
                        y: data.stats.toBeFinished,
                        status: "toBeFinished",
                        grade: "",
                        subject: ""
                    }
                    dataList.push(listOption);

                    var html = "<div class='col-lg-4 col-md-6 col-sm-12' id=''>"+
                                "<div class='plan'>"+
                                "<p class='plan-recommended'>订单状态</p>"+
                                "<div id='pie1' style='height:250px;'></div>"+
                                "<ul class='plan-features'>"+
                                "<li class='plan-feature'>"+
                                "<span id='pie1Total'>"+data.stats.total+"</span>"+
                                "<span class='plan-feature-name'> Total</span>"+
                                "</li>"+
                                "</ul>"+
                                "</div>"+
                                "</div>";
                    $("#pieDiv").append(html);
                    pieChart("pie1",dataList);

                    var num = 2;
                    $.each(data.stats.gs,function(grade,value) {
                        var total = 0;
                        dataList = [];
                        var html = "<div class='col-lg-4 col-md-6 col-sm-12' id='pie1Div'>"+
                                    "<div class='plan'>"+
                                    "<p class='plan-recommended'>"+grade+"</p>"+
                                    "<div id='pie"+num+"' style='height:250px;'></div>"+
                                    "<ul class='plan-features'>"+
                                    "<li class='plan-feature'>"+
                                    "<span id='total"+num+"'></span>"+
                                    "<span class='plan-feature-name'> Total</span>"+
                                    "</li>"+
                                    "</ul>"+
                                    "</div>"+
                                    "</div>";
                        $.each(value,function(name,value){
                            if(name!="total") {
                                listOption = {
                                    name: name,
                                    y: value,
                                    status: "",
                                    grade: grade,
                                    subject: name
                                };
                                //list.push(name);
                                //list.push(value);
                                dataList.push(listOption);
                            }else{
                                total = value;
                            }
                        });
                        $("#pieDiv").append(html);
                        $("#total"+num).html(total);
                        pieChart("pie"+num,dataList);
                        num++;
                    });
                    //vm.systemAnswer(list);
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
}

/*
    初始化饼图
 */
function pieChart(id,dataList){
    $('#'+id).highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false
        },
        credits: {
            enabled: false
        },
        title: {
            text: null
        },
        tooltip: {
            pointFormat: '<b>{point.y} 单</b><br/><b>占比：{point.percentage:.1f} %</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    color: 'skyblue',
                    connectorColor: '#aaa',
                    format: '<b>{point.name}</b><br/>{point.y} 单',
                    shadow: false
                },
                events: {
                    click: function (e) {
                        showZhuTu(e.point.status, e.point.grade, e.point.subject);
                    }
                }
            }
        },
        series: [{
            type: 'pie',
            name: 'Browser share',
            data: dataList
        }]
    });
}

/*
    显示分类柱图
 */
function showZhuTu(status,grade,subject){
    var zhuTuTitle = ""
    if(status == "timeout"){
        zhuTuTitle = "超时订单数量时间分布统计";
    }else if(status == "canceled") {
        zhuTuTitle = "取消订单数量时间分布统计";
    }else if(status == "finished") {
        zhuTuTitle = "完成订单数量时间分布统计";
    }else if(status == "pending") {
        zhuTuTitle = "等待订单数量时间分布统计";
    }else if(status == "canceled") {
        zhuTuTitle = "取消订单数量时间分布统计";
    }else if(status == "received") {
        zhuTuTitle = "已接订单数量时间分布统计";
    }else if(status == "toBeFinished") {
        zhuTuTitle = "待确认订单数量时间分布统计";
    }else{
        zhuTuTitle = grade+"-"+subject+" 订单数量时间分布统计";
    }
    $.dialog({
        icon: 'icon icon-graph-bar',
        title: zhuTuTitle,
        content:"<div id='zhuTu' align='center'><div class='loader'>"+
        "<div class='loader-inner line-scale'>"+
        "<div></div>"+
        "<div></div>"+
        "<div></div>"+
        "<div></div>"+
        "<div></div>"+
        "</div>"+
        "</div></div>",
        columnClass: 'col-lg-12 col-md-12 col-sm-12 col-xs-12'
    });
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.status = status;
    postObj.grade = grade;
    postObj.subject = subject;
    postObj.startTime = new Date($("#startTime").val()).getTime();
    postObj.endTime = new Date($("#endTime").val()).getTime();
    util.callServerFunction('adminQAStatDetail',postObj, function(data){
        if(data.statusCode == 900){
            var seriesList = new Array();
            var list = data.list;
            var gsObj = {};
            if(status!=""){
                for(var j=0; j<list.length; j++){
                    for(var k=0; k<Object.keys(list[j].gs).length; k++){
                        for(var m=0; m<Object.keys(list[j].gs[Object.keys(list[j].gs)[k]]).length; m++){
                            if(!gsObj[Object.keys(list[j].gs)[k] + Object.keys(list[j].gs[Object.keys(list[j].gs)[k]])[m]]) {
                                gsObj[Object.keys(list[j].gs)[k] + Object.keys(list[j].gs[Object.keys(list[j].gs)[k]])[m]] = [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null];
                            }
                            if(!!list[j].gs[Object.keys(list[j].gs)[k]][Object.keys(list[j].gs[Object.keys(list[j].gs)[k]])[m]].total) {
                                gsObj[Object.keys(list[j].gs)[k] + Object.keys(list[j].gs[Object.keys(list[j].gs)[k]])[m]][parseInt(list[j].hour)] = list[j].gs[Object.keys(list[j].gs)[k]][Object.keys(list[j].gs[Object.keys(list[j].gs)[k]])[m]].total;
                            }
                        }
                    }
                }
            }else{
                for(var j=0; j<list.length; j++){
                    for(var k=0; k<Object.keys(list[j].stat).length; k++){
                        if(!gsObj[Object.keys(list[j].stat)[k]]){
                            gsObj[Object.keys(list[j].stat)[k]] = [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null];
                        }
                        if(!!list[j].stat[Object.keys(list[j].stat)[k]]) {
                            gsObj[Object.keys(list[j].stat)[k]][parseInt(list[j].hour)] = list[j].stat[Object.keys(list[j].stat)[k]];
                        }
                    }
                }
            }
            //console.log(gsObj);
            $.each(gsObj,function(subject,data) {
                var name = subject;
                if (subject == "timeout") {
                    name = "超时订单";
                } else if (subject == "canceled") {
                    name = "取消订单";
                } else if (subject == "finished") {
                    name = "完成订单";
                } else if (subject == "pending") {
                    name = "等待订单";
                } else if (subject == "canceled") {
                    name = "取消订单";
                } else if (subject == "received") {
                    name = "已接订单";
                } else if (subject == "toBeFinished") {
                    name = "待确认订单";
                }
                if (name != "total") {
                    var option = {
                        name: name,
                        data: data
                    };
                    seriesList.push(option);
                }
            });
            initZhuTu(zhuTuTitle,seriesList);
        }else{
            errorCodeApi(data.statusCode);
        }
    });
}

function initZhuTu(titleObj,seriesList){
    $('#zhuTu').highcharts({
        chart: {
            type: 'column'
        },
        credits: {
            enabled: false
        },
        title: {
            text: titleObj,
            style: { "fontSize": "20px", "font-weight": "bold" }
        },
        xAxis: {
            categories: ['00:00:00至00:59:59', '01:00:00至01:59:59', '02:00:00至02:59:59', '03:00:00至03:59:59', '04:00:00至04:59:59', '05:00:00至05:59:59', '06:00:00至06:59:59', '07:00:00至07:59:59', '08:00:00至08:59:59', '09:00:00至09:59:59', '10:00:00至10:59:59', '11:00:00至11:59:59', '12:00:00至12:59:59', '13:00:00至13:59:59', '14:00:00至14:59:59', '15:00:00至15:59:59',
                '16:00:00至16:59:59', '17:00:00至17:59:59', '18:00:00至18:59:59', '19:00:00至19:59:59', '20:00:00至20:59:59', '21:00:00至21:59:59', '22:00:00至22:59:59', '23:00:00至23:59:59']
        },
        yAxis: {
            allowDecimals: false,
            min: 0,
            title: {
                text: '订单数量'
            },
            stackLabels: {
                enabled: true,
                style: {
                    fontWeight: 'bold',
                    color: 'gray'
                },
                formatter: function(){
                    if(this.total!=0) {
                        return "<b>总数：</b>" + this.total + '单';
                    }
                }
            }
        },
        legend: {
            align: 'right',
            x: 0,
            verticalAlign: 'top',
            y: 20,
            floating: false,
            backgroundColor: 'white',
            borderColor: '#CCC',
            borderWidth: 1,
            shadow: false,
            navigation: {

            }
        },
        tooltip: {
            shared:true,
            formatter: function() {
                if(this.y!=null){
                    var curPointList = this.points;
                    var temp = '<b>'+ this.x +'</b><br/>总订单数: '+ curPointList[0].point.stackTotal + '单<br/>';
                    for(var i=0;i<curPointList.length;i++){
                        temp += curPointList[i].series.name + ': ' + curPointList[i].y + '单('+ (curPointList[i].y/curPointList[i].point.stackTotal*100).toFixed(1) + '%)<br/>';
                    }
                    return temp;
                }else{
                    return "0 单";
                }
            }
        },
        plotOptions: {
            column: {
                stacking: 'normal',
                dataLabels: {
                    enabled: false,
                    color: 'black',
                    formatter: function() {
                        if(this.y!=null) {
                            return '<b>' + this.series.name + ':</b>' + this.y + '单';
                        }
                    }
                }
            }
        },
        series: seriesList
    });
}

var viewModel = function(){
    this.systemAnswer = ko.observableArray();
    this.loadSystemAnswerLsit = loadSystemAnswerLsit;
};
var vm = new viewModel();
var date = new Date();
$(document).ready(function(){
    ko.applyBindings(vm,document.getElementById("systemAnswer"));
    util.initDateTimePicker("startTime",{defaultDate: new Date(date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + ' 00:00:00')});
    util.initDateTimePicker("endTime",{defaultDate: new Date(date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + " 23:59:59")});
    loadSystemAnswerLsit();
    document.onkeydown=function(event){
        e = event ? event :(window.event ? window.event : null);
        if(e.keyCode==13){
            loadSystemAnswerLsit();
            return false;
        }
    }
});