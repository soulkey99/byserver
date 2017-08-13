/**
 * Created by hjy on 2015/9/19 0019.
 */

/*
    获取答疑教师列表
 */
function loadQATeacherList(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startPos = (vm.startPos()-1)*vm.pageSize()+1;
    postObj.pageSize = vm.pageSize();
    util.callServerFunction('adminQACenterTeacherList',postObj, function(data){
        if(data.statusCode == 900){
            vm.qaTeacherList.removeAll();
            if(data.list.length > 0) {
                var teacherList = [];
                for (var i = 0; i < data.list.length; i++) {
                    var type = "";
                    if(data.list[i].type == "teacher"){
                        type = "教师";
                    }
                    teacherList.push({
                        id: (i+1),
                        phoneNum: data.list[i].phonenum,
                        type: type,
                        smsCode: data.list[i].smscode,
                        status: data.list[i].status,
                        name: data.list[i].name,
                        desc: data.list[i].desc
                    });
                }
                vm.qaTeacherList(teacherList);
                $('i').tooltip({
                    "margin-top": "50px"
                });
            }else if(vm.startPos()!=1){
                vm.startPos(vm.startPos()-1);
                loadQATeacherList();
                $.dialog({
                    icon: 'icon icon-warning',
                    title: '提示信息',
                    content:"您已经在最后一页了！"
                })
            }
        }else{
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
        loadQATeacherList();
    }
}

function nextPage(){
    vm.startPos(vm.startPos()+1);
    loadQATeacherList();
}

/*
    添加答疑教师
 */
function addTeacherInfo(){
    vm.action = "create";
    var html = "<div class='form-group'>"+
        "<label>姓名：</label><input type='text' class='form-control' id='name'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>联系电话：</label><input type='text' class='form-control' id='phoneNum'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>固定验证码：</label><input type='text' class='form-control' id='smsCode'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label style='vertical-align:top'>描述：</label><textarea style='width:100%;border-color: #C7D5E0' rows='10' id='desc'></textarea>"+
        "</div>"+
        "<button class='btn btn-primary' onclick='confirm()'>提交</button>";
    vm.dialog = $.dialog({
        icon: "icon icon-document-edit",
        title: '添加教师信息',
        content: html
    });
}

/*
    编辑答疑教师
 */
function editTeacherInfo(){
    vm.action = "";
    var html = "<div class='form-group'>"+
        "<label>姓名：</label><input type='text' class='form-control' id='name' value='"+this.name+"'>"+
        "</div>"+
        "<input type='hidden' class='form-control' id='phoneNum' value='"+this.phoneNum+"'>"+
        "<div class='form-group'>"+
        "<label>固定验证码：</label><input type='text' class='form-control' id='smsCode' value='"+this.smsCode+"'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label style='vertical-align:top'>描述：</label><textarea style='width:100%;border-color: #C7D5E0' rows='10' id='desc'>"+this.desc+"</textarea>"+
        "</div>"+
        "<button class='btn btn-primary' onclick='confirm()'>提 交</button>";
    vm.dialog = $.dialog({
        icon: "icon icon-document-edit",
        title: '修改教师信息',
        content: html
    });
}

/*
    删除答疑教师
 */
function delTeacherInfo(){
    var phoneNum = this.phoneNum;
    vm.dialog = $.confirm({
        icon: 'fontawesome-warning-sign',
        title: '提示信息',
        content: "确定要删除 '"+this.name+"' 教师吗？",
        confirmButton: "<span class='fontawesome-ok'></span>&nbsp;&nbsp;确定",
        cancelButton: "<span class='fontawesome-remove'></span>&nbsp;&nbsp;取消",
        confirm:function(){
            var postObj = {};
            postObj.userID = util.getSessionStorage("userID");
            postObj.authSign = util.getSessionStorage("authSign");
            postObj.delete = "true";
            postObj.phonenum = phoneNum;
            util.callServerFunction('adminQACenterModifyTeacher',postObj, function(data){
                if(data.statusCode == 900){
                    vm.dialog.close();
                    util.toast("删除成功！","success","系统提示");
                    loadQATeacherList();
                }else{
                    vm.dialog.close();
                    errorCodeApi(data.statusCode);
                }
            });
        }
    })
}

/*
    提交修改
 */
function confirm(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.action = vm.action;
    postObj.name = $("#name").val();
    postObj.phonenum = $("#phoneNum").val();
    postObj.smscode = $("#smsCode").val();
    postObj.desc = $("#desc").val();
    util.callServerFunction('adminQACenterModifyTeacher',postObj, function(data){
        if(data.statusCode == 900){
            vm.dialog.close();
            util.toast("操作成功！","success","系统提示");
            loadQATeacherList();
        }else{
            vm.dialog.close();
            errorCodeApi(data.statusCode);
        }
    });
}

var viewModel = function(){
    this.qaTeacherList = ko.observableArray();
    this.addTeacherInfo = addTeacherInfo;
    this.editTeacherInfo = editTeacherInfo;
    this.delTeacherInfo = delTeacherInfo;
    this.prevPage = prevPage;
    this.nextPage = nextPage;
    this.confirm = confirm;
    this.startPos = ko.observable(1);
    this.pageSize = ko.observable(15);
    this.action = "";
    this.dialog;
}
var vm = new viewModel();
$(document).ready(function(){
    ko.applyBindings(vm,document.getElementById("qaTeacher"));
    loadQATeacherList();
});