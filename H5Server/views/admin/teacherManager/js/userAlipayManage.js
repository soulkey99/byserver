/**
 * Created by hjy on 2016/2/18 0018.
 */

function subLoadUserAlipayList(){
    vm.startPos(1);
    vm.pageSize(15);
    loadUserAlipayList();
}

function loadUserAlipayList(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startPos = (vm.startPos()-1)*vm.pageSize()+1;
    postObj.pageSize = vm.pageSize();
    postObj.startTime = new Date($("#startTime").val()).getTime();
    postObj.endTime = new Date($("#endTime").val()).getTime();
    postObj.u_id = $("#uId").val();
    postObj.phone = $("#uPhone").val();
    postObj.type = $("#type").val();
    postObj.status = $("#status").val();
    postObj.userType = $("#userType").val();
    util.callServerFunction('adminGetMoneyList', postObj, function (data) {
        if (data.statusCode == 900) {
            vm.total(data.total);
            if(vm.total() <= vm.pageSize()){
                vm.totalPages(1);
            }else{
                if(vm.total()%vm.pageSize() > 0){
                    vm.totalPages(parseInt(vm.total()/vm.pageSize() + 1));
                }else if(vm.total()%vm.pageSize() == 0){
                    vm.totalPages(parseInt(vm.total()/vm.pageSize()));
                }
            }
            vm.userAlipayList.removeAll();
            if (data.list.length > 0) {
                var list = [];
                for (var i = 0; i < data.list.length; i++) {
                    var withdraw_info = data.list[i].withdraw_info
                        ,tableMoney = 0
                        ,trueMoney = ""
                        ,callcallMoney = ""
                        ,bindingId = ""
                        ,bindingName = ""
                        ,bindingTime = ""
                        ,statusText = "";
                    if(withdraw_info != undefined) {
                        for (var j = 0; j < withdraw_info.length; j++) {
                            if (withdraw_info[j].type == data.list[i].channel) {
                                bindingId = withdraw_info[j].id;
                                bindingName = withdraw_info[j].name;
                                bindingTime = util.convertTime2Str(withdraw_info[j].t);
                            }
                        }
                    }
                    if(data.list[i].type == "withdraw"){
                        tableMoney = parseFloat(data.list[i].money);
                        trueMoney = Math.abs(parseFloat(data.list[i].actual_pay)/100);
                        callcallMoney = Math.abs(parseFloat(data.list[i].rebate)/100);
                    }else if(data.list[i].type == "chrge"){
                        tableMoney = "充值面额:"+parseFloat(data.list[i].amount)+"|实付金额:"+parseFloat(data.list[i].money);
                    }else{
                        tableMoney = parseFloat(data.list[i].amount);
                    }
                    tableMoney = Math.abs(tableMoney/100);
                    if(data.list[i].type == "withdraw" && data.list[i].status == "pending"){
                        statusText = "提现中";
                    }else if(data.list[i].type == "rewardTeacher" && data.list[i].status == "pending"){
                        statusText = "支付中";
                    }else if(data.list[i].status == "paid"){
                        statusText = "成功";
                    }else if(data.list[i].status == "fail"){
                        statusText = "失败";
                    }else if(data.list[i].status == "cancel"){
                        statusText = "取消";
                    }else if(data.list[i].status == "pending"){
                        statusText = "进行中";
                    }
                    list.push({
                        id: (i + 1),
                        amount: Math.abs(data.list[i].amount),
                        bonus: Math.abs(data.list[i].bonus),
                        channel: data.list[i].channel,
                        tableMoney: tableMoney,
                        trueMoney: trueMoney,
                        callcallMoney: callcallMoney,
                        money: Math.abs(data.list[i].money),
                        money_id: data.list[i].money_id,
                        nick: data.list[i].nick,
                        phone: data.list[i].phone,
                        status: data.list[i].status,
                        statusText: statusText,
                        subject: data.list[i].subject,
                        t_nick: data.list[i].t_nick,
                        t_phone: data.list[i].t_phone,
                        type: data.list[i].type,
                        createTime: util.convertTime2Str(data.list[i].createTime),
                        userID: data.list[i].userID,
                        withdraw_info: data.list[i].withdraw_info,
                        bindingId: bindingId,
                        bindingName: bindingName,
                        bindingTime: bindingTime
                    });
                }
                vm.userAlipayList(list);
                $('i').tooltip({
                    "margin-top": "50px"
                });
            } else if (vm.startPos() != 1) {
                vm.startPos(vm.startPos() - 1);
                loadUserAlipayList();
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
        loadUserAlipayList();
    }
}

function nextPage(){
    vm.startPos(vm.startPos()+1);
    loadUserAlipayList();
}

function addBillId(){
    var html = "<input type='hidden' id='money_id' value='"+ this.money_id +"'/>"+
        "<input type='hidden' id='u_id' value='"+ this.userID +"'/>"+
        "<div class='form-group'>"+
        "<label>支付宝订单号：</label><input type='text' class='form-control' id='billId'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>订单状态：</label>" +
        "<select id='billStatus' class='form-control valid'>" +
        "<option value='pending'>支付中</option>" +
        "<option value='paid'>支付成功</option>" +
        "<option value='fail'>支付失败</option>" +
        "</select>" +
        "</div>" +
        "<div class='form-group'>"+
        "<label>备注：</label>" +
        "<textarea style='width:100%;border-color: #C7D5E0' id='billNote' rows='3'></textarea>" +
        "</div>" +
        "<button class='btn btn-primary' onclick='subAddBillId()'>提 交</button>";
    dialog = $.dialog({
        icon: "icon icon-document-edit",
        title: '填写支付宝订单号',
        content: html
    });
}

function subAddBillId(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.u_id = $("#u_id").val();
    postObj.money_id = $("#money_id").val();
    postObj.transaction_no = $("#billId").val();
    postObj.status = $("#billStatus").val();
    postObj.desc = $("#billNote").val();
    util.callServerFunction('adminSetPayStatus', postObj, function (data) {
        if (data.statusCode == 900) {
            dialog.close();
            util.toast("填写订单号成功", "success", "提示信息");
            loadUserAlipayList();
        } else {
            errorCodeApi(data.statusCode);
        }
    });
}

function showDetail(){
    var html = "<table class='table'>"+
        "<tbody>"+
        "<tr>"+
        "<td class='col-lg-1 col-md-2 col-sm-3 col-xs-4'> 总金额：</td>"+
        "<td class='subject'>"+ parseInt(this.amount)/100 +" 元</td>"+
        "</tr>"+
        "<tr>"+
        "<td style='width:25%'> 积分抵扣：</td>"+
        "<td class='subject'>"+ this.bonus +" 积分</td>"+
        "</tr>"+
        "<tr>"+
        "<td style='width:25%'> 实际支付金额：</td>"+
        "<td class='subject'>"+ parseInt(this.money)/100 +" 元</td>"+
        "</tr>"+
        "<tr>"+
        "<td style='width:25%'> 备注：</td>"+
        "<td class='subject'>"+ this.subject +"</td>"+
        "</tr>"+
        "</tbody>"+
        "<table>";
    $.dialog({
        icon: "icon icon-document-edit",
        title: '交易详情',
        content: html
    });
}

function seachUser(phone){
    $("#uPhone").val(phone);
    subLoadUserAlipayList();
}

function prevMonth(){
    if(month == 1){
        year = year - 1;
        month = 12;
    }else{
        month = month - 1;
    }
    day = new Date(year,month,0);
    daycount = day.getDate();
    $("#startTime").val(year + '/' + month + '/01 00:00:00');
    $("#endTime").val(year + '/' + month + '/' + daycount + ' 23:59:59');
    subLoadUserAlipayList();
}

function nextMonth(){
    if(month == 12){
        year = year + 1;
        month = 1;
    }else{
        month = month + 1;
    }
    day = new Date(year,month,0);
    daycount = day.getDate();
    $("#startTime").val(year + '/' + month + '/01 00:00:00');
    $("#endTime").val(year + '/' + month + '/' + daycount + ' 23:59:59');
    subLoadUserAlipayList();
}

function saveAsExcel(){
    var newTab = window.open('about:blank');
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startPos = 1;
    postObj.pageSize = 9999999;
    postObj.startTime = new Date($("#startTime").val()).getTime();
    postObj.endTime = new Date($("#endTime").val()).getTime();
    postObj.u_id = $("#uId").val();
    postObj.phone = $("#uPhone").val();
    postObj.type = $("#type").val();
    postObj.userType = $("#userType").val();
    util.callServerFunction('adminGetMoneyList', postObj, function (data) {
        if (data.statusCode == 900) {
            var uri = 'data:application/vnd.ms-excel;base64,';
            var table = "<table border='1px'><tr style='font-size:16px'>" +
                "<th bgcolor='#5f9ea0'>序号</th>" +
                "<th bgcolor='#5f9ea0'>类型</th>" +
                "<th bgcolor='#5f9ea0'>状态</th>" +
                "<th bgcolor='#5f9ea0'>支付方式</th>" +
                "<th bgcolor='#5f9ea0'>提现总额</th>" +
                "<th bgcolor='#5f9ea0'>实际应支付</th>" +
                "<th bgcolor='#5f9ea0'>平台分成</th>" +
                "<th bgcolor='#5f9ea0'>用户昵称</th>" +
                "<th bgcolor='#5f9ea0'>用户手机</th>" +
                "<th bgcolor='#5f9ea0'>教师昵称</th>" +
                "<th bgcolor='#5f9ea0'>教师手机</th>" +
                "<th bgcolor='#5f9ea0'>创建时间</th>" +
                "<th bgcolor='#5f9ea0'>绑定支付账号</th>" +
                "<th bgcolor='#5f9ea0'>绑定支付姓名</th>" +
                "</tr>";
            for (var i = 0; i < data.list.length; i++) {
                var withdraw_info = data.list[i].withdraw_info
                    ,tableMoney = 0
                    ,trueMoney = ""
                    ,callcallMoney = ""
                    ,bindingId = ""
                    ,bindingName = ""
                    ,bindingTime = ""
                    ,statusText = ""
                    ,typeText = ""
                    ,channelText = "";
                if(withdraw_info != undefined) {
                    for (var j = 0; j < withdraw_info.length; j++) {
                        if (withdraw_info[j].type == data.list[i].channel) {
                            bindingId = withdraw_info[j].id;
                            bindingName = withdraw_info[j].name;
                            bindingTime = util.convertTime2Str(withdraw_info[j].t);
                        }
                    }
                }

                if(data.list[i].type == "withdraw"){
                    tableMoney = parseFloat(data.list[i].money);
                    trueMoney = Math.abs(parseFloat(data.list[i].actual_pay)/100);
                    callcallMoney = Math.abs(parseFloat(data.list[i].rebate)/100);
                }else{
                    tableMoney = parseFloat(data.list[i].amount)
                }
                tableMoney = Math.abs(tableMoney/100);
                if(data.list[i].type == "withdraw"){
                    typeText = "提现";
                }else{
                    typeText = "打赏教师";
                }

                if(data.list[i].type == "withdraw" && data.list[i].status == "pending"){
                    statusText = "提现中";
                }else if(data.list[i].type == "rewardTeacher" && data.list[i].status == "pending"){
                    statusText = "支付中";
                }else if(data.list[i].status == "paid"){
                    statusText = "成功";
                }else if(data.list[i].status == "fail"){
                    statusText = "失败";
                }else if(data.list[i].status == "cancel"){
                    statusText = "取消";
                }

                if(data.list[i].channel == "alipay"){
                    channelText = "支付宝";
                }else{
                    channelText = "其他";
                }

                table += "<tr>" +
                    "<td align='center'>" + (i + 1) + "</td>" +
                    "<td align='center'>" + typeText + "</td>" +
                    "<td align='center'>" + statusText + "</td>" +
                    "<td align='center'>" + channelText + "</td>" +
                    "<td align='center'>" + tableMoney + "</td>" +
                    "<td align='center'>" + trueMoney + "</td>" +
                    "<td align='center'>" + callcallMoney + "</td>" +
                    "<td align='center'>" + data.list[i].nick + "</td>" +
                    "<td align='center'>" + data.list[i].phone + "</td>" +
                    "<td align='center'>" + data.list[i].t_nick + "</td>" +
                    "<td align='center'>" + data.list[i].t_phone + "</td>" +
                    "<td align='center'>" + util.convertTime2Str(data.list[i].createTime) + "</td>" +
                    "<td align='center'>" + bindingId + "</td>" +
                    "<td align='center'>" + bindingName + "</td>" +
                    "</tr>";
            }
            table += "</table>";
            var url = uri + window.btoa(unescape(encodeURIComponent(table)));
            newTab.location.href = url;
        } else {
            errorCodeApi(data.statusCode);
        }
    });
}

var viewModel = function(){
        this.userAlipayList = ko.observableArray();
        this.startPos = ko.observable(1);
        this.pageSize = ko.observable(15);
        this.total = ko.observable(0);
        this.totalPages = ko.observable(0);
        this.prevPage = prevPage;
        this.nextPage = nextPage;
        this.showDetail = showDetail;
        this.addBillId = addBillId;
        this.seachUser = seachUser;
    }
    ,vm = new viewModel()
    ,date = new Date()
    ,day = new Date(date.getFullYear(),date.getMonth(),0)
    ,daycount = day.getDate()
    ,year = date.getFullYear()
    ,month = date.getMonth();
$(document).ready(function(){
    ko.applyBindings(vm,document.getElementById("userAlipayTable"));
    util.initDateTimePicker("startTime",{defaultDate: new Date(year + '/' + month + '/01 00:00:00')});
    util.initDateTimePicker("endTime",{defaultDate: new Date(year + '/' + month + '/' + daycount + ' 23:59:59')});
    subLoadUserAlipayList();
    $('.selectpicker').selectpicker({
        style: 'btn btn-info'
    });
    $('.btn-group').css("width","100%");
    document.onkeydown = function(event){
        var e = event ? event :(window.event ? window.event : null);
        if(e.keyCode==13){
            subLoadUserAlipayList();
            return false;
        }
    }
});