/**
 * Created by MengLei on 2015/8/8.
 */

function prevPageShopMail(){
    if(vmShopMail.startPosAllShopMail()==1){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"您已经在第一页了！"
        })
    }else{
        vmShopMail.startPosAllShopMail(vmShopMail.startPosAllShopMail()-1);
        loadMailList();
    }
}

function nextPageShopMail(){
    vmShopMail.startPosAllShopMail(vmShopMail.startPosAllShopMail()+1);
    loadMailList();
}

//获取兑换码列表信息
function loadMailList(){
    var postObj = {
        userID: util.getSessionStorage('userID'),
        authSign: util.getSessionStorage('authSign'),
        deliver: 'mail',
        startPos: (vmShopMail.startPosAllShopMail()-1)*vmShopMail.pageSizeAllShopMail()+1,
        pageSize: vmShopMail.pageSizeAllShopMail(),
        startTime: new Date($("#startTime").val()).getTime(),
        endTime: new Date($("#endTime").val()).getTime(),
        status: $("#statusSelect").val(),
        shopID: vmShopMail.shopID()
    };
    util.callServerFunction('adminShopExchangeList', postObj, function(resp){
        if(resp.statusCode == 900){
            vmShopMail.itemListShopMail.removeAll();
            if(resp.list.length>0){
                var list = [],checkTime = "";
                for(var i=0; i<resp.list.length; i++){
                    checkTime = "";
                    if(resp.list[i].detail.status){
                        checkTime = util.convertTime2Str(resp.list[i].detail.checkTime);
                    }
                    list.push({
                        id: (i+1),
                        goodName: resp.list[i].goodName,
                        money: resp.list[i].money + " 元",
                        nick: resp.list[i].nick,
                        userName: resp.list[i].phone,
                        name: resp.list[i].detail.name,
                        phone: resp.list[i].detail.phone,
                        status: resp.list[i].detail.status,
                        detail: resp.list[i].detail,
                        time: util.convertTime2Str(resp.list[i].time),
                        checkTime: checkTime
                    });
                }
                vmShopMail.itemListShopMail(list);
                $('i').tooltip({
                    "margin-top": "50px"
                });
            }else if(vmShopMail.startPosAllShopMail()!=1){
                vmShopMail.startPosAllShopMail(vmShopMail.startPosAllShopMail()-1);
                loadMailList();
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

//显示物流详情
function showDetail(){
    var html = "<table class='table'>"+
                    "<tbody>"+
                        "<tr>"+
                            "<td class='col-lg-1 col-md-2 col-sm-3 col-xs-4'><i class='fa entypo-basket'></i> 商品名称：</td>"+
                            "<td class='subject'>"+this.goodName+"</td>"+
                        "</tr>"+
                        "<tr>"+
                            "<td style='width:19%'><i class='fa entypo-user'></i> 用户名称：</td>"+
                            "<td class='subject'>"+this.detail.name+"</td>"+
                        "</tr>"+
                        "<tr>"+
                            "<td style='width:19%'><i class='fa entypo-phone'></i> 手机号：</td>"+
                            "<td class='subject'>"+this.detail.phone+"</td>"+
                        "</tr>"+
                        "<tr>"+
                            "<td style='width:19%'><i class='fa entypo-address'></i> 地址：</td>"+
                            "<td class='subject'>"+this.detail.address+"</td>"+
                        "</tr>"+
                        "<tr>"+
                            "<td style='width:19%'><i class='fa entypo-mail'></i> 邮政编码：</td>"+
                            "<td class='subject'>"+this.detail.postCode+"</td>"+
                        "</tr>"+
                        "<tr>"+
                            "<td style='width:19%'><i class='fa entypo-paper-plane'></i> 发货状态：</td>"+
                            "<td class='subject'>"+(this.detail.status==true?'已发货':'未发货')+"</td>"+
                        "</tr>"+
                        "<tr>"+
                        "<td style='width:19%'><i class='fa entypo-paper-plane'></i> 发货时间：</td>"+
                        "<td class='subject'>"+this.checkTime+"</td>"+
                        "</tr>"+
                        "<tr>"+
                            "<td style='width:19%'><i class='fa entypo-users'></i> 快递公司：</td>"+
                            "<td class='subject'>"+this.detail.postCompany+"</td>"+
                        "</tr>"+
                        "<tr>"+
                            "<td style='width:19%'><i class='fa entypo-attach'></i> 快递单号：</td>"+
                            "<td class='subject'>"+this.detail.postNumber+"</td>"+
                        "</tr>"+
                    "</tbody>"+
                "<table>";
    $.dialog({
        icon: "icon icon-document-edit",
        title: '物流详情',
        content: html
    });
}

function subLoadMailList(){
    vmShopMail.startPosAllShopMail(1);
    vmShopMail.pageSizeAllShopMail(15);
    loadMailList();
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
    vmShopMail.shopID(shopIDTemp);
    dialog.close();
}

function saveAsExcel(){
    var newTab = window.open('about:blank');
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.deliver = 'mail',
    postObj.startPos = 1;
    postObj.pageSize = 9999999;
    postObj.startTime = new Date($("#startTime").val()).getTime(),
    postObj.endTime = new Date($("#endTime").val()).getTime(),
    postObj.status = $("#statusSelect").val(),
    postObj.shopID = vmShopMail.shopID()
    util.callServerFunction('adminShopExchangeList', postObj, function (resp) {
        if (resp.statusCode == 900) {
            var uri = 'data:application/vnd.ms-excel;base64,';
            var table = "<table border='1px'><tr style='font-size:16px'>" +
                "<th bgcolor='#5f9ea0'>序号</th>" +
                "<th bgcolor='#5f9ea0'>商品名称</th>" +
                "<th bgcolor='#5f9ea0'>结算价格</th>" +
                "<th bgcolor='#5f9ea0'>账号</th>" +
                "<th bgcolor='#5f9ea0'>姓名</th>" +
                "<th bgcolor='#5f9ea0'>手机</th>" +
                "<th bgcolor='#5f9ea0'>兑换时间</th>" +
                "<th bgcolor='#5f9ea0'>是/否兑换</th>" +
                "<th bgcolor='#5f9ea0'>发货时间</th>" +
                "</tr>";
            var status = "未兑换",name = "",phone = "",checkTime="";
            for (var i = 0; i < resp.list.length; i++) {
                status = "未兑换";
                name = "";
                phone = "";
                checkTime = "";
                if(resp.list[i].detail.status){
                    status = "已兑换";
                    checkTime = util.convertTime2Str(resp.list[i].detail.checkTime);
                }
                if(resp.list[i].detail.name != undefined){
                    name = resp.list[i].detail.name;
                }
                if(resp.list[i].detail.phone != undefined){
                    phone = resp.list[i].detail.phone;
                }
                table += "<tr>" +
                    "<td align='center'>" + (i + 1) + "</td>" +
                    "<td align='left'>" + resp.list[i].goodName + "</td>" +
                    "<td align='left'>" + resp.list[i].money + "</td>" +
                    "<td align='center'>" + resp.list[i].phone + "</td>" +
                    "<td align='center'>" + name + "</td>" +
                    "<td align='center'>" + phone + "</td>" +
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

var dialog;
var viewModel = function(){
    this.itemListShopMail = ko.observableArray();
    this.showDetail = showDetail;
    this.shopID = ko.observable("");
    this.startPosAllShopMail = ko.observable(1);
    this.pageSizeAllShopMail = ko.observable(15);
};
var vmShopMail = new viewModel();
var date = new Date();
$(document).ready(function() {
    ko.applyBindings(vmShopMail,document.getElementById("shopMailTable"));
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
    subLoadMailList();
    document.onkeydown = function(event){
        e = event ? event :(window.event ? window.event : null);
        if(e.keyCode==13){
            subLoadMailList();
            return false;
        }
    }
});