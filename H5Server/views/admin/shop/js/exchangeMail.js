/**
 * Created by MengLei on 2015/8/6.
 */
/*
 获取发货列表
 */
function loadExchangeMailList(){
    var postObj = {
        userID: util.getSessionStorage('userID'),
        authSign: util.getSessionStorage('authSign'),
        startPos: (vm.startPos()-1)*vm.pageSize()+1,
        pageSize: vm.pageSize(),
        deliver: "mail",
        startTime: new Date($("#startTime").val()).getTime(),
        endTime: new Date($("#endTime").val()).getTime(),
        status: $("#statusSelect").val()
    };
    util.callServerFunction('shopExchangeList', postObj, function(resp){
        if(resp.statusCode == 900){
            vm.itemList.removeAll();
            if(resp.list.length>0) {
                var list = [];
                for (var i = 0; i < resp.list.length; i++) {
                    var checkTime = "";
                    if(resp.list[i].detail.status && resp.list[i].detail.checkTime!=undefined){
                        checkTime = util.convertTime2Str(resp.list[i].detail.checkTime);
                    }
                    list.push({
                        id: (i + 1),
                        bonusID: resp.list[i]._id,
                        goodName: resp.list[i].goodName,
                        name: resp.list[i].detail.name,
                        phone: resp.list[i].detail.phone,
                        address: resp.list[i].detail.address,
                        postCode: resp.list[i].detail.postCode,
                        //status: resp.list[i].detail.status == true ? '已邮寄' : '未邮寄',
                        status: resp.list[i].detail.status,
                        postCompany: resp.list[i].detail.postCompany,
                        postNumber: resp.list[i].detail.postNumber,
                        remark: resp.list[i].detail.remark,
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
                loadExchangeMailList();
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
        loadExchangeMailList();
    }
}

function nextPage(){
    vm.startPos(vm.startPos()+1);
    loadExchangeMailList();
}

/*
    添加快递公司
 */
var dialog;
function confirm(){
    vm.bonusID(this.bonusID);
    var html = "<input type='hidden' class='form-control' id='bonusID' value='"+this.bonusID+"'><div class='form-group'>"+
        "<label>快递公司：</label><input type='text' class='form-control' id='postCompany' value='"+this.postCompany+"'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>快递单号：</label><input type='text' class='form-control' id='postNumber' value='"+this.postNumber+"'>"+
        "</div>"+
        "<button class='btn btn-primary' onclick='confirmPost()'>确 定</button>";
    dialog = $.dialog({
        icon: "icon icon-document-edit",
        title:"添加快递",
        content:html
    });
}

function confirmPost(){
    if($("#postCompany").val()==""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请输入快递公司名称！"
        })
    }else if($("#postNumber").val()==""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请输入快递单号！"
        })
    }else{
        var postObj = {
            userID: util.getSessionStorage('userID'),
            authSign: util.getSessionStorage('authSign'),
            bonusID: vm.bonusID(),
            postCompany: $("#postCompany").val(),
            postNumber: $("#postNumber").val()
        };
        util.callServerFunction('shopConfirmMail', postObj, function(resp){
            if(resp.statusCode == 900){
                util.toast("添加成功！","success","系统提示");
                dialog.close();
                loadExchangeMailList();
            }else{
                errorCodeApi(resp.statusCode);
            }
        });
    }
}

function saveAsExcel(){
    var newTab = window.open('about:blank');
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startPos = 1;
    postObj.pageSize = 9999999;
    postObj.deliver = "mail";
    postObj.startTime = new Date($("#startTime").val()).getTime();
    postObj.endTime = new Date($("#endTime").val()).getTime();
    postObj.status = $("#statusSelect").val();
    util.callServerFunction('shopExchangeList', postObj, function (resp) {
        if (resp.statusCode == 900) {
            var uri = 'data:application/vnd.ms-excel;base64,';
            var table = "<table border='1px'><tr style='font-size:16px'>" +
                        "<th bgcolor='#5f9ea0'>序号</th>" +
                        "<th bgcolor='#5f9ea0'>商品名称</th>" +
                        "<th bgcolor='#5f9ea0'>结算价格</th>" +
                        "<th bgcolor='#5f9ea0'>姓名</th>" +
                        "<th bgcolor='#5f9ea0'>手机</th>" +
                        "<th bgcolor='#5f9ea0'>地址</th>" +
                        "<th bgcolor='#5f9ea0'>邮编</th>" +
                        "<th bgcolor='#5f9ea0'>是/否邮寄</th>" +
                        "<th bgcolor='#5f9ea0'>发货时间</th>" +
                        "<th bgcolor='#5f9ea0'>快递公司</th>" +
                        "<th bgcolor='#5f9ea0'>快递单号</th>" +
                        "<th bgcolor='#5f9ea0'>备注</th>" +
                        "</tr>";
            for (var i = 0; i < resp.list.length; i++) {
                var status = "已邮寄",remark = "",checkTime = "";
                if(!resp.list[i].detail.status){
                    status = "未邮寄";
                }
                if(resp.list[i].detail.remark!=undefined){
                    remark = resp.list[i].detail.remark;
                }
                if(resp.list[i].detail.status && resp.list[i].detail.checkTime!=undefined){
                    checkTime = util.convertTime2Str(resp.list[i].detail.checkTime);
                }
                table += "<tr>" +
                    "<td align='center'>" + (i + 1) + "</td>" +
                    "<td align='left'>" + resp.list[i].goodName + "</td>" +
                    "<td align='left'>" + resp.list[i].money + "</td>" +
                    "<td align='center'>" + resp.list[i].detail.name + "</td>" +
                    "<td align='center'>" + resp.list[i].detail.phone + "</td>" +
                    "<td align='left'>" + resp.list[i].detail.address + "</td>" +
                    "<td align='center'>" + resp.list[i].detail.postCode + "</td>" +
                    "<td align='center'>" + status + "</td>" +
                    "<td align='center'>" + checkTime + "</td>" +
                    "<td align='left'>" + resp.list[i].detail.postCompany + "</td>" +
                    "<td align='center'>" + resp.list[i].detail.postNumber + "</td>" +
                    "<td align='left'>" + remark + "</td>" +
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

function subLoadExchangeMailList(){
    vm.startPos(1);
    vm.pageSize(15);
    loadExchangeMailList();
}

var viewModel = function(){
    this.itemList = ko.observableArray();
    this.postCompany = ko.observable();
    this.postNumber = ko.observable();
    this.bonusID = ko.observable();
    this.confirm = confirm;
    this.startPos = ko.observable(1);
    this.pageSize = ko.observable(15);
    this.prevPage = prevPage;
    this.nextPage = nextPage;
    this.loadExchangeMailList = loadExchangeMailList;
};
var vm = new viewModel();
var date = new Date();
$(document).ready(function() {
    ko.applyBindings(vm,document.getElementById("exchangeMailTable"));
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
    $('.selectpicker').selectpicker({
        style: 'btn btn-info'
    });
    $('.btn-group').css("width","100%");
    loadExchangeMailList();
    document.onkeydown = function(event){
        e = event ? event :(window.event ? window.event : null);
        if(e.keyCode==13){
            subLoadExchangeMailList();
            return false;
        }
    }
});