/**
 * Created by hjy on 2015/9/24.
 */

//重置
function subLoadPlanManageList(){
    vm.startPos(1);
    vm.pageSize(15);
    loadPlanManageList();
}

//获取推广人员列表
function loadPlanManageList(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    //postObj.startTime = new Date($("#startTime").val()).getTime();
    //postObj.endTime = new Date($("#endTime").val()).getTime();
    postObj.startPos = (vm.startPos()-1)*vm.pageSize()+1;
    postObj.pageSize = vm.pageSize();
    postObj.phonenum = $("#tPhone").val();
    util.callServerFunction('adminGetPromoters',postObj, function(data){
        if(data.statusCode == 900){
            vm.planManageList.removeAll();
            if(data.promoterList.length > 0) {
                var list = [];
                for (var i = 0; i < data.promoterList.length; i++) {
                    list.push({
                        id: (i+1),
                        u_id: data.promoterList[i].u_id,
                        phone: data.promoterList[i].phone,
                        nick: data.promoterList[i].nick,
                        shareCode: data.promoterList[i].shareCode,
                        invited: data.promoterList[i].invited,
                        registered: data.promoterList[i].registered,
                        promoter: data.promoterList[i].promoter
                    });
                }
                vm.planManageList(list);
                $('i').tooltip({
                    "margin-top": "50px"
                });
            }else if(vm.startPos()!=1) {
                vm.startPos(vm.startPos() - 1);
                loadPlanManageList();
                $.dialog({
                    icon: 'icon icon-warning',
                    title: '提示信息',
                    content: "您已经在最后一页了！"
                })
            }
        }else{
            errorCodeApi(data.statusCode);
        }
    });
}

//查看推广效果
function showDetail(){
    $.dialog({
        icon: "icon icon-document-edit",
        title: "推广效果",
        columnClass: 'col-lg-12 col-md-12 col-sm-12 col-xs-12',
        content: "<div style='width:100%'>"+
                    "<form class='form-horizontal' role='form'>"+
                    "<div class='form-group'>"+
                    "<div class='col-lg-3'>"+
                    "<label class='control-label'>开始时间</label>"+
                    "<input id='startTime' class='form-control' type='text'>"+
                    "<div style='height:10px;'></div>"+
                    "</div>"+
                    "<div class='col-lg-3'>"+
                    "<label class='control-label'>结束时间</label>"+
                    "<input id='endTime' class='form-control' type='text'>"+
                    "<div style='height:10px;'></div>"+
                    "</div>"+
                    "<div class='col-lg-3'>"+
                    "<label class='control-label'>邀请码</label>"+
                    "<input id='shareCode' class='form-control' type='text' value='"+this.shareCode+"'>"+
                    "<div style='height:10px;'></div>"+
                    "</div>"+
                    "<div class='col-lg-1'>"+
                    "<label class='control-label'>操作</label><br/>"+
                    "<input type='button' value='检 索' class='btn btn-rounded' style='margin-right:30px' onclick='subDetail()'>"+
                    "</div>"+
                    "</div>"+
                    "</form>"+
                    "</div>"+
                    "<div style='margin-bottom:10px;'><span class='label label-info' id='num1'></span>&nbsp;&nbsp;<span class='label label-success' id='num2'></span></div>"+
                    "<div><table class='table table-bordered table-striped cf'>"+
                    "<thead class='cf'>"+
                    "<tr>"+
                    "<th class='numeric'>序号</th>"+
                    "<th>手机号</th>"+
                    "<th>是/否激活</th>"+
                    "<th>邀请时间</th>"+
                    "</tr>"+
                    "</thead>"+
                    "<tbody id='detailTbody'>"+
                    "</tbody>"+
                    "<tfoot></tfoot>"+
                    "</table></div>"
    });
    util.initDateTimePicker("startTime",{defaultDate: new Date(date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + ' 00:00:00')});
    util.initDateTimePicker("endTime",{defaultDate: new Date(date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + ' 23:59:59')});
    subDetail();
}

//查看推广详情
function subDetail(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startTime = new Date($("#startTime").val()).getTime();
    postObj.endTime = new Date($("#endTime").val()).getTime();
    postObj.shareCode = $("#shareCode").val();
    util.callServerFunction('adminGetPromoterDetail',postObj, function(data){
        if(data.statusCode == 900){
            var html = "";
            $("#num1").text("邀请数量："+data.invited);
            $("#num2").text("激活数量："+data.registered);
            for (var i = 0; i < data.list.length; i++) {
                html += "<tr>"+
                    "<td align='center'>"+(i+1)+"</td>"+
                    "<td align='center'>"+data.list[i].phone+"</td>";
                if(data.list.length){
                    html += "<td align='center'>是</td>";
                }else{
                    html += "<td align='center'>否</td>";
                }
                html += "<td align='center'>"+util.convertTime2Str(data.list[i].time)+"</td></tr>";
            }
            $("#detailTbody").empty();
            $("#detailTbody").append(html);
        }else{
            errorCodeApi(data.statusCode);
        }
    });
}

var dialog;
function cancelPlan(){
    var nick = this.nick;
    var u_id = this.u_id;
    var phonenum = this.phone;
    dialog = $.confirm({
        icon: 'icon icon-warning',
        title: '提示信息',
        content:"确定要取消 <span class='label label-info'>"+ nick +"</span> 的推广员身份吗？",
        confirmButton: "<span class='fontawesome-ok'></span>&nbsp;&nbsp;确定",
        cancelButton: "<span class='fontawesome-remove'></span>&nbsp;&nbsp;取消",
        confirm:function(){
            var postObj = {};
            postObj.userID = util.getSessionStorage("userID");
            postObj.authSign = util.getSessionStorage("authSign");
            postObj.u_id = u_id;
            postObj.phonenum = phonenum;
            postObj.action = "unset";
            util.callServerFunction('adminSetPromoter',postObj, function(data){
                if(data.statusCode == 900){
                    util.toast("操作成功！","success","系统提示");
                    dialog.close();
                    loadPlanManageList();
                }else{
                    errorCodeApi(data.statusCode);
                }
            });
        }
    });
}

function setPlan(){
    var nick = this.nick;
    var u_id = this.u_id;
    var phonenum = this.phone;
    dialog = $.confirm({
        icon: 'icon icon-warning',
        title: '提示信息',
        content:"确定要设置 '"+ nick +"' 为推广员身份吗？",
        confirmButton: "<span class='fontawesome-ok'></span>&nbsp;&nbsp;确定",
        cancelButton: "<span class='fontawesome-remove'></span>&nbsp;&nbsp;取消",
        confirm:function(){
            var postObj = {};
            postObj.userID = util.getSessionStorage("userID");
            postObj.authSign = util.getSessionStorage("authSign");
            postObj.u_id = u_id;
            postObj.phonenum = phonenum;
            util.callServerFunction('adminSetPromoter',postObj, function(data){
                if(data.statusCode == 900){
                    util.toast("操作成功！","success","系统提示");
                    dialog.close();
                    loadPlanManageList();
                }else{
                    errorCodeApi(data.statusCode);
                }
            });
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
        loadPlanManageList();
    }
}

function nextPage(){
    vm.startPos(vm.startPos()+1);
    loadPlanManageList();
}

function resetPlanManageList(){
    vm.startPos(1);
    vm.pageSize(15);
    $("#tPhone").val("");
    loadPlanManageList();
}

var viewModel = function(){
    this.planManageList = ko.observableArray();
    this.loadPlanManageList = loadPlanManageList;
    this.cancelPlan = cancelPlan;
    this.showDetail = showDetail;
    this.startPos = ko.observable(1);
    this.pageSize = ko.observable(15);
    this.prevPage = prevPage;
    this.nextPage = nextPage;
};
var vm = new viewModel();
var date = new Date();
$(document).ready(function(){
    ko.applyBindings(vm,document.getElementById("planManager"));
    loadPlanManageList();
    document.onkeydown = function(event){
        e = event ? event :(window.event ? window.event : null);
        if(e.keyCode==13){
            subLoadPlanManageList();
            return false;
        }
    }
});