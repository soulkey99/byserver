/**
 * Created by hjy on 2015/12/1 0001.
 */

function loadMessageList(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startPos = (vm.startPos()-1)*vm.pageSize()+1;
    postObj.pageSize = vm.pageSize();
    postObj.startTime = new Date($("#startTime").val()).getTime();
    postObj.endTime = new Date($("#endTime").val()).getTime();
    postObj.type = $("#type").val();
    postObj.display = $("#display").val();
    util.callServerFunction('adminGetMsgList', postObj, function (data) {
        if (data.statusCode == 900) {
            vm.messageList.removeAll();
            if (data.list.length > 0) {
                var list = [];
                for (var i = 0; i < data.list.length; i++) {
                    list.push({
                        id: (i + 1),
                        msgid: data.list[i].msgid,
                        time: util.convertTime2Str(data.list[i].time),
                        type: data.list[i].type,
                        from: data.list[i].from,
                        content: data.list[i].detail.content,
                        link: data.list[i].detail.link,
                        topic: data.list[i].detail.topic,
                        detailType: data.list[i].detail.type,
                        display: data.list[i].display
                    });
                }
                vm.messageList(list);
                $('i').tooltip({
                    "margin-top": "50px"
                });
            } else if (vm.startPos() != 1) {
                vm.startPos(vm.startPos() - 1);
                loadMessageList();
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
        loadMessageList();
    }
}

function nextPage(){
    vm.startPos(vm.startPos()+1);
    loadMessageList();
}

function subLoadMessageList(){
    vm.startPos(1);
    vm.pageSize(15);
    loadMessageList();
}

function sendMessage(){
    var msgid = this.msgid;
    $.confirm({
        icon: 'fontawesome-warning-sign',
        title: '提示信息',
        content: "您确定要发送 <span class='label label-info'>"+ this.topic +"</span> 消息吗？",
        confirmButton: "<span class='fontawesome-ok'></span>&nbsp;&nbsp;确定",
        cancelButton: "<span class='fontawesome-remove'></span>&nbsp;&nbsp;取消",
        confirm: function() {
            var postObj = {
                userID: util.getSessionStorage('userID'),
                authSign: util.getSessionStorage('authSign'),
                msgid: msgid,
                display: true
            };
            util.callServerFunction('adminEditMsg', postObj, function (resp) {
                if (resp.statusCode == 900) {
                    util.toast("发送成功！","success","系统提示");
                    loadMessageList();
                }else{
                    util.errorCodeApi(resp.statusCode);
                }
            })
        }
    })
}

function initAddMessage(){
    var html = "<div class='form-group'>"+
        "<div class='form-group'>"+
        "<label>消息主题：</label><input type='text' class='form-control' id='topic'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>消息内容：</label><textarea id='content' rows='8' style='width:100%;border-color: #C7D5E0'></textarea>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>消息链接：</label><input type='text' class='form-control' id='link'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>发送范围：</label>" +
        "<select id='typeAdd' class='form-control valid'>"+
        "<option value='broadcast'>全部广播</option>"+
        "<option value='broadcast_t'>教师端广播</option>"+
        "<option value='broadcast_s'>学生端广播</option>"+
        "</select>"+
        "</div>"+
        "<button class='btn btn-primary' onclick='addMessage()'>提 交</button>";
    dialog = $.dialog({
        icon: "icon icon-plus",
        title: '添加消息',
        content: html
    });
}

function addMessage(){
    if($("#topic").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请填写消息主题！"
        })
    }else if($("#content").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请填写消息内容！"
        })
    }else if($("#link").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请填写消息链接！"
        })
    }else{
        var postObj = {
            userID: util.getSessionStorage('userID'),
            authSign: util.getSessionStorage('authSign'),
            display: false,
            topic: $("#topic").val(),
            content: $("#content").val(),
            link: $("#link").val(),
            type: $("#typeAdd").val()
        };
        util.callServerFunction('adminEditMsg', postObj, function (resp) {
            if (resp.statusCode == 900) {
                util.toast("添加成功！","success","系统提示");
                dialog.close();
                subLoadMessageList();
            }else{
                util.errorCodeApi(resp.statusCode);
            }
        })
    }
}

function initEditMessage(){
    var html = "<input type='hidden' id='msgid' value='"+ this.msgid +"'><div class='form-group'>"+
        "<div class='form-group'>"+
        "<label>消息主题：</label><input type='text' class='form-control' id='topic' value='"+ this.topic +"'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>消息内容：</label><textarea id='content' rows='8' style='width:100%;border-color: #C7D5E0' value='"+ this.content +"'>"+ this.content +"</textarea>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>消息链接：</label><input type='text' class='form-control' id='link' value='"+ this.link +"'>"+
        "</div>"+
        "<button class='btn btn-primary' onclick='editMessage()'>提 交</button>";
    dialog = $.dialog({
        icon: "icon icon-document-edit",
        title: '修改消息',
        content: html
    });
}

function editMessage(){
    if($("#topic").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请填写消息主题！"
        })
    }else if($("#content").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请填写消息内容！"
        })
    }else if($("#link").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请填写消息链接！"
        })
    }else{
        var postObj = {
            userID: util.getSessionStorage('userID'),
            authSign: util.getSessionStorage('authSign'),
            topic: $("#topic").val(),
            content: $("#content").val(),
            link: $("#link").val(),
            msgid: $("#msgid").val()
        };
        util.callServerFunction('adminEditMsg', postObj, function (resp) {
            if (resp.statusCode == 900) {
                util.toast("修改成功！","success","系统提示");
                dialog.close();
                loadMessageList();
            }else{
                util.errorCodeApi(resp.statusCode);
            }
        })
    }
}

function deleteMessage(){
    var msgid = this.msgid;
    $.confirm({
        icon: 'fontawesome-warning-sign',
        title: '提示信息',
        content: "您确定要删除 <span class='label label-info'>"+ this.topic +"</span> 消息吗？",
        confirmButton: "<span class='fontawesome-ok'></span>&nbsp;&nbsp;确定",
        cancelButton: "<span class='fontawesome-remove'></span>&nbsp;&nbsp;取消",
        confirm: function() {
            var postObj = {
                userID: util.getSessionStorage('userID'),
                authSign: util.getSessionStorage('authSign'),
                msgid: msgid,
                display: true
            };
            util.callServerFunction('adminEditMsg', postObj, function (resp) {
                if (resp.statusCode == 900) {
                    util.toast("删除成功！","success","系统提示");
                    loadMessageList();
                }else{
                    util.errorCodeApi(resp.statusCode);
                }
            })
        }
    })
}

var viewModel = function(){
    this.messageList = ko.observableArray();
    this.startPos = ko.observable(1);
    this.pageSize = ko.observable(15);
    this.prevPage = prevPage;
    this.nextPage = nextPage;
    this.loadMessageList = loadMessageList;
    this.subLoadMessageList = subLoadMessageList;
    this.sendMessage = sendMessage;
    this.initEditMessage = initEditMessage;
    this.deleteMessage = deleteMessage;
};
var vm = new viewModel();
var date = new Date();
$(document).ready(function(){
    ko.applyBindings(vm,document.getElementById("messageManage"));
    util.initDateTimePicker("startTime",{defaultDate: new Date(date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + ' 00:00:00')});
    util.initDateTimePicker("endTime",{defaultDate: new Date(date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + ' 23:59:59')});
    $('.selectpicker').selectpicker({
        style: 'btn btn-info'
    });
    $('.btn-group').css("width","100%");
    document.onkeydown=function(event){
        e = event ? event :(window.event ? window.event : null);
        if(e.keyCode==13){
            subLoadMessageList();
            return false;
        }
    }
    subLoadMessageList();
});