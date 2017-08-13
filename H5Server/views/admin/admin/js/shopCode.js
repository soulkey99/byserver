/**
 * Created by MengLei on 2015/8/8.
 */

function prevPageShopCode(){
    if(vmShopCode.startPosAllShopCode()==1){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"您已经在第一页了！"
        })
    }else{
        vmShopCode.startPosAllShopCode(vmShopCode.startPosAllShopCode()-1);
        loadCodeList();
    }
}

function nextPageShopCode(){
    vmShopCode.startPosAllShopCode(vmShopCode.startPosAllShopCode()+1);
    loadCodeList();
}

//获取兑换码列表信息
function loadCodeList(){
    var postObj = {
        userID: util.getSessionStorage('userID'),
        authSign: util.getSessionStorage('authSign'),
        deliver: 'code',
        startPos: (vmShopCode.startPosAllShopCode()-1)*vmShopCode.pageSizeAllShopCode()+1,
        pageSize: vmShopCode.pageSizeAllShopCode(),
        startTime: new Date($("#startTime").val()).getTime(),
        endTime: new Date($("#endTime").val()).getTime(),
        status: $("#statusSelect").val(),
        shopID: vmShopCode.shopID()
    };
    util.callServerFunction('adminShopExchangeList', postObj, function(resp){
        if(resp.statusCode == 900){
            vmShopCode.itemListShopCode.removeAll();
            if(resp.list.length>0) {
                var list = [],checkTime = "";
                for (var i = 0; i < resp.list.length; i++) {
                    checkTime = "";
                    if(resp.list[i].detail.status){
                        checkTime = util.convertTime2Str(resp.list[i].detail.checkTime);
                    }
                    list.push({
                        id: (i + 1),
                        goodName: resp.list[i].goodName,
                        code: resp.list[i].detail.code,
                        status: resp.list[i].detail.status,
                        time: util.convertTime2Str(resp.list[i].time),
                        money: resp.list[i].money + " 元",
                        nick: resp.list[i].nick,
                        phone: resp.list[i].phone,
                        checkTime: checkTime
                    });
                }
                vmShopCode.itemListShopCode(list);
                $('i').tooltip({
                    "margin-top": "50px"
                });
            }else if(vmShopCode.startPosAllShopCode()!=1){
                vmShopCode.startPosAllShopCode(vmShopCode.startPosAllShopCode()-1);
                loadCodeList();
                $.dialog({
                    icon: 'icon icon-warning',
                    title: '提示信息',
                    content:"您已经在最后一页了！"
                })
            }
        }else{
            errorCodeApi(resp.statusCode);
        }
    });
}

function getShopList(){
    var html = "<div><button type='button' class='btn btn btn-warning btn-md' onclick=\"shopConfirm('','全部商户')\" style='margin:0px 5px 5px 0px'>"+
        "<span class='glyphicon glyphicon-user'></span>全部商户</button>";
    var postObj = {
        userID: util.getSessionStorage('userID'),
        authSign: util.getSessionStorage('authSign')
    };
    util.callServerFunction('adminGetShopList', postObj, function(resp){
        if(resp.statusCode == 900){
            for(var i=0; i<resp.list.length; i++){
                html += "<button type='button' class='btn btn btn-info btn-md' onclick=\"shopConfirm('"+resp.list[i].shopID+"','"+resp.list[i].shopName+"')\" style='margin:0px 5px 5px 0px'>"+
                    "<span class='glyphicon glyphicon-user'></span>"+resp.list[i].shopName+
                    "</button>";
            }
            html += "</div>";
            dialog = $.dialog({
                icon: "icon icon-user-group",
                title: '选择商户',
                content: html
            });
        }else{
            util.errorCodeApi(resp.statusCode);
        }
    });
}

function shopConfirm(shopIDTemp,shopName){
    $("#shopName").text(shopName);
    vmShopCode.shopID(shopIDTemp);
    dialog.close();
}

function showDetail(){
    $.dialog({
        icon: 'icon icon-warning',
        title: '提示信息',
        content:"暂不支持！"
    })
}

function subLoadCodeList(){
    vmShopCode.startPosAllShopCode(1);
    vmShopCode.pageSizeAllShopCode(15);
    loadCodeList();
}

function saveAsExcel(){
    var newTab = window.open('about:blank');
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.deliver = 'code',
    postObj.startPos = 1;
    postObj.pageSize = 9999999;
    postObj.startTime = new Date($("#startTime").val()).getTime(),
    postObj.endTime = new Date($("#endTime").val()).getTime(),
    postObj.status = $("#statusSelect").val(),
    postObj.shopID = vmShopCode.shopID()
    util.callServerFunction('adminShopExchangeList', postObj, function (resp) {
        var table = "<table border='1px'><tr style='font-size:16px'>" +
            "<th bgcolor='#5f9ea0'>序号</th>" +
            "<th bgcolor='#5f9ea0'>商品名称</th>" +
            "<th bgcolor='#5f9ea0'>结算价格</th>" +
            "<th bgcolor='#5f9ea0'>兑换码</th>" +
            "<th bgcolor='#5f9ea0'>用户昵称</th>" +
            "<th bgcolor='#5f9ea0'>用户手机</th>" +
            "<th bgcolor='#5f9ea0'>兑换时间</th>" +
            "<th bgcolor='#5f9ea0'>是/否兑换</th>" +
            "<th bgcolor='#5f9ea0'>发货时间</th>" +
            "</tr>";
        if (resp.statusCode == 900) {
            var uri = 'data:application/vnd.ms-excel;base64,';
            var status = "未兑换",code = "",checkTime = "";
            for (var i = 0; i < resp.list.length; i++) {
                status = "未兑换";
                checkTime = "";
                code = "";
                if(resp.list[i].detail.status){
                    status = "已兑换";
                    checkTime = util.convertTime2Str(resp.list[i].detail.checkTime);
                }
                if(resp.list[i].detail.code!=undefined){
                    code = resp.list[i].detail.code;
                }
                table += "<tr>" +
                    "<td align='center'>" + (i + 1) + "</td>" +
                    "<td align='left'>" + resp.list[i].goodName + "</td>" +
                    "<td align='center'>" + resp.list[i].money + "</td>" +
                    "<td align='center'>" + resp.list[i].detail.code + "</td>" +
                    "<td align='center'>" + resp.list[i].nick + "</td>" +
                    "<td align='center'>" + resp.list[i].phone + "</td>" +
                    "<td align='center'>" + util.convertTime2Str(resp.list[i].time) + "</td>" +
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
    this.itemListShopCode = ko.observableArray();
    this.shopID = ko.observable("");
    this.showDetail = showDetail;
    this.startPosAllShopCode = ko.observable(1);
    this.pageSizeAllShopCode = ko.observable(15);
    this.timeType = ko.observable("");
};
var vmShopCode = new viewModel();
var date = new Date();
$(document).ready(function(){
    ko.applyBindings(vmShopCode,document.getElementById("shopCodeTable"));
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
    util.initDateTimePicker("startTime",{defaultDate: new Date(startYear + '/' + startMonth + '/' + startDay + " 00:00:00")});
    util.initDateTimePicker("endTime",{defaultDate: new Date(endYear + '/' + endMonth + '/' + endDay + " 23:59:59")});
    $('.selectpicker').selectpicker({
        style: 'btn btn-info'
    });
    $('.btn-group').css("width","100%");
    loadCodeList();
    document.onkeydown = function(event){
        e = event ? event :(window.event ? window.event : null);
        if(e.keyCode==13){
            subLoadCodeList();
            return false;
        }
    }
});