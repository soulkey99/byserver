/**
 * Created by hjy on 2015/11/10 0010.
 */

function loadUserLogList(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startPos = (vm.startPos()-1)*vm.pageSize()+1;
    postObj.pageSize = vm.pageSize();
    postObj.startTime = new Date($("#startTime").val()).getTime();
    postObj.endTime = new Date($("#endTime").val()).getTime();
    postObj.action = $("#action").val();
    postObj.channel = $("#channel").val();
    postObj.platform = $("#platform").val();
    postObj.userType = $("#userType").val();
    postObj.client = $("#client").val();
    postObj.phonenum = $("#phonenum").val();
    postObj.ip = $("#ip").val();
    postObj.imei = $("#imei").val();
    postObj.mac = $("#mac").val();
    util.callServerFunction('adminGetUserLog', postObj, function (data) {
        if (data.statusCode == 900) {
            vm.userLogList.removeAll();
            if (data.list.length > 0) {
                var list = [];
                for (var i = 0; i < data.list.length; i++) {
                    list.push({
                        id: (i + 1),
                        u_id: data.list[i].u_id,
                        phone: data.list[i].phone,
                        nick: data.list[i].nick,
                        action: data.list[i].action,
                        userType: data.list[i].content.userType,
                        api: data.list[i].content.api,
                        platform: data.list[i].content.platform,
                        client: data.list[i].content.client,
                        channel: data.list[i].content.channel,
                        ip: data.list[i].content.ip,
                        imei: data.list[i].content.imei,
                        mac: data.list[i].content.mac,
                        time: util.convertTime2Str(data.list[i].t)
                    });
                }
                vm.userLogList(list);
                $('i').tooltip({
                    "margin-top": "50px"
                });
            } else if (vm.startPos() != 1) {
                vm.startPos(vm.startPos() - 1);
                loadUserLogList();
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
        loadUserLogList();
    }
}

function nextPage(){
    vm.startPos(vm.startPos()+1);
    loadUserLogList();
}

function subLoadUserLogList(){
    vm.startPos(1);
    vm.pageSize(15);
    loadUserLogList();
}

function showAdvancedSearch(){
    vm.advancedSearch(!vm.advancedSearch());
}

var viewModel = function(){
    this.userLogList = ko.observableArray();
    this.startPos = ko.observable(1);
    this.pageSize = ko.observable(15);
    this.prevPage = prevPage;
    this.nextPage = nextPage;
    this.loadUserLogList = loadUserLogList;
    this.subLoadUserLogList = subLoadUserLogList;
    this.advancedSearch = ko.observable(false);
    this.showAdvancedSearch = showAdvancedSearch;
};
var vm = new viewModel();
var date = new Date();
$(document).ready(function(){
    ko.applyBindings(vm,document.getElementById("userLogManage"));
    util.initDateTimePicker("startTime",{defaultDate: new Date(date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + ' 00:00:00')});
    util.initDateTimePicker("endTime",{defaultDate: new Date(date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + ' 23:59:59')});
    $('.selectpicker').selectpicker({
        style: 'btn btn-info'
    });
    $('.btn-group').css("width","100%");
    document.onkeydown=function(event){
        e = event ? event :(window.event ? window.event : null);
        if(e.keyCode==13){
            subLoadUserLogList();
            return false;
        }
    }
    loadUserLogList();
});