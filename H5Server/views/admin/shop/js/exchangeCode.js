/**
 * Created by MengLei on 2015/8/6.
 */

function subLoadExchangeCodeList(){
    vm.startPos(1);
    vm.pageSize(15);
    loadExchangeCodeList();
}
/*
    获取兑换码列表
 */
function loadExchangeCodeList(){
    var postObj = {
        userID: util.getSessionStorage('userID'),
        authSign: util.getSessionStorage('authSign'),
        startPos: (vm.startPos()-1)*vm.pageSize()+1,
        pageSize: vm.pageSize(),
        startTime: new Date($("#startTime").val()).getTime(),
        endTime: new Date($("#endTime").val()).getTime(),
        deliver: "code",
        code: $("#code").val()
    }
    util.callServerFunction('shopExchangeList', postObj, function(resp){
        if(resp.statusCode == 900){
            vm.itemList.removeAll();
            if(resp.list.length>0) {
                var list = [];
                var checkTime = "";
                for (var i = 0; i < resp.list.length; i++) {
                    if(resp.list[i].detail.checkTime==undefined){
                        checkTime = "";
                    }else{
                        checkTime = util.convertTime2Str(resp.list[i].detail.checkTime);
                    }
                    list.push({
                        id: (i + 1),
                        bonusID: resp.list[i]._id,
                        deliver: resp.list[i].deliver,
                        goodId: resp.list[i].goodId,
                        goodName: resp.list[i].goodName,
                        status: resp.list[i].detail.status,
                        code: resp.list[i].detail.code,
                        createTime: util.convertTime2Str(resp.list[i].createTime),
                        checkTime: checkTime,
                        money: resp.list[i].money + " 元"
                    });
                }
                vm.itemList(list);
                $('i').tooltip({
                    "margin-top": "50px"
                });
            }else if(vm.startPos()!=1){
                vm.startPos(vm.startPos()-1);
                loadExchangeCodeList();
                $.dialog({
                    icon: 'icon icon-warning',
                    title: '提示信息',
                    content:"您已经在最后一页了！"
                })
            }
        }else{
            errorCodeApi(resp.statusCode);
        }
    })
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
        loadExchangeCodeList();
    }
}

function nextPage(){
    vm.startPos(vm.startPos()+1);
    loadExchangeCodeList();
}

/*
    验证兑换码
 */
function onInputCode(){
    if(vm.code()) {
        var postObj = {
            userID: util.getSessionStorage('userID'),
            authSign: util.getSessionStorage('authSign'),
            code: vm.code()
        };
        util.callServerFunction('shopCheckCode', postObj, function (resp) {
            if (resp.statusCode == 900) {
                vm.goodName(resp.detail.goodName);
                vm.status(resp.detail.status == true ? '已兑换' : '未兑换');
            }else if(resp.statusCode == 940){
                vm.goodName("");
                vm.status("");
                $.dialog({
                    icon: 'icon icon-warning',
                    title: '提示信息',
                    content:"兑换码不存在！"
                })
            }else{
                errorCodeApi(resp.statusCode);
            }
        });
    }
}

/*
    使用兑换码
 */
function onConfirmCode(){
    if(this.code) {
        $.confirm({
            icon: 'fontawesome-shopping-cart',
            title: '使用兑换码',
            content:"是否要是使用 <span class='label label-info'>"+ this.code +"</span> 兑换码？",
            confirmButton: '兑换',
            cancelButton: '取消',
            confirm: function(){
                var postObj = {
                    userID: util.getSessionStorage('userID'),
                    authSign: util.getSessionStorage('authSign'),
                    code: $("#code").val()
                };
                util.callServerFunction('shopConfirmCode', postObj, function (resp) {
                    if (resp.statusCode == 900) {
                        vm.status(resp.status == true ? '已兑换' : '未兑换');
                        util.toast("兑换成功！","success","系统提示");
                        loadExchangeCodeList();
                    }else{
                        $.dialog({
                            icon: 'icon icon-warning',
                            title: '提示信息',
                            content:"兑换码不存在或者已经被兑换！"
                        })
                    }
                });
            }
        })
    }else{
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请输入兑换码！"
        })
    }
}

/*
    导出Excel
 */
function saveAsExcel(){
    var newTab = window.open('about:blank');
    var postObj = {
        userID: util.getSessionStorage('userID'),
        authSign: util.getSessionStorage('authSign'),
        startPos: 1,
        pageSize: 9999999,
        startTime: new Date($("#startTime").val()).getTime(),
        endTime: new Date($("#endTime").val()).getTime(),
        deliver: "code",
        code: $("#code").val()
    }
    util.callServerFunction('shopExchangeList', postObj, function (resp) {
        if (resp.statusCode == 900) {
            var uri = 'data:application/vnd.ms-excel;base64,';
            var table = "<table border='1px'><tr style='font-size:16px'>" +
                "<th bgcolor='#5f9ea0'>序号</th>" +
                "<th bgcolor='#5f9ea0'>兑换码</th>" +
                "<th bgcolor='#5f9ea0'>商品名称</th>" +
                "<th bgcolor='#5f9ea0'>结算价格</th>" +
                "<th bgcolor='#5f9ea0'>兑换时间</th>" +
                "<th bgcolor='#5f9ea0'>是/否兑换</th>" +
                "<th bgcolor='#5f9ea0'>发货时间</th>" +
                "</tr>";
            var status = "已兑换";
            var checkTime = "";
            for (var i = 0; i < resp.list.length; i++) {
                if(resp.list[i].detail.checkTime==undefined){
                    checkTime = "";
                }else{
                    checkTime = util.convertTime2Str(resp.list[i].detail.checkTime);
                }
                if(!resp.list[i].detail.status){
                    status = "未兑换";
                }
                table += "<tr>" +
                    "<td align='center'>" + (i + 1) + "</td>" +
                    "<td align='center'>" + resp.list[i].detail.code + "</td>" +
                    "<td align='left'>" + resp.list[i].goodName + "</td>" +
                    "<td align='left'>" + resp.list[i].money + "</td>" +
                    "<td align='center'>" + util.convertTime2Str(resp.list[i].createTime) + "</td>" +
                    "<td align='center'>" + status + "</td>" +
                    "<td align='center'>" + checkTime + "</td>" +
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
    this.code = ko.observable();
    this.goodName = ko.observable();
    this.status = ko.observable();
    this.startPos = ko.observable(1);
    this.pageSize = ko.observable(15);
    this.prevPage = prevPage;
    this.nextPage = nextPage;
    this.itemList = ko.observableArray();
    this.onConfirmCode = onConfirmCode;
};
var vm = new viewModel();
var date = new Date();
$(document).ready(function() {
    ko.applyBindings(vm,document.getElementById("exchangeCodeTable"));
    var startYear = endYear = date.getFullYear(),startMonth = endMonth = date.getMonth()+ 1,startDay = endDay =date.getDate();
    if(date.getDate()<=10){
        if(startMonth == 1){
            startYear = endYear = startYear-1;
            startMonth = endMonth = 12;
        }else{
            startMonth -= 1;
            endMonth = startMonth;
        }
        startDay = 16;
        if(startMonth == 1 || startMonth == 3 || startMonth == 5 || startMonth == 7 || startMonth == 8 || startMonth == 10 || startMonth == 12){
            endDay = 31;
        }else{
            endDay = 30;
        }
    }else if(date.getDate()>=26){
        startDay = 16;
        if(startMonth == 1 || startMonth == 3 || startMonth == 5 || startMonth == 7 || startMonth == 8 || startMonth == 10 || startMonth == 12){
            endDay = 31;
        }else{
            endDay = 30;
        }
    }else{
        startDay = 1;
        endDay = 15;
    }
    $('i').tooltip({
        "margin-top": "50px"
    });
    util.initDateTimePicker("startTime",{defaultDate: new Date(startYear + '/' + startMonth + '/' + startDay + " 00:00:00")});
    util.initDateTimePicker("endTime",{defaultDate: new Date(endYear + '/' + endMonth + '/' + endDay + " 23:59:59")});
    loadExchangeCodeList();
    document.onkeydown = function(event){
        e = event ? event :(window.event ? window.event : null);
        if(e.keyCode==13){
            subLoadExchangeCodeList();
            return false;
        }
    }
});