/**
 * Created by hjy on 2015/11/10 0010.
 */

function loadUserFeedbackList(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startPos = (vm.startPos()-1)*vm.pageSize()+1;
    postObj.pageSize = vm.pageSize();
    util.callServerFunction('adminGetFeedbackList', postObj, function (data) {
        if (data.statusCode == 900) {
            vm.userFeedbackList.removeAll();
            if (data.list.length > 0) {
                var list = [];
                for (var i = 0; i < data.list.length; i++) {
                    var contentHtml = "";
                    if(data.list[i].type == "text"){
                        contentHtml = "<span>" + data.list[i].content + "</span>";
                    }else if(data.list[i].type == "image"){ //clickBubble
                        contentHtml = "<div style='width: 5%;height: auto;cursor: pointer' onclick=\"showSrcImg('"+ util.changeUrl(data.list[i].content) +"')\"><img style='width: 100%;height: auto' src='" + util.changeUrl(data.list[i].content) + "'></div>";
                    }else if(data.list[i].type == "voice"){
                        contentHtml = "<audio src='http://123.57.16.157:8062/redirectAmr?url=" + data.list[i].content + "' controls='controls'></audio>";
                    }
                    list.push({
                        id: (i + 1),
                        u_id: data.list[i].userID,
                        phone: data.list[i].phone,
                        nick: data.list[i].nick,
                        userType: data.list[i].userType,
                        content: data.list[i].content,
                        contentHtml: contentHtml,
                        email: data.list[i].email,
                        qq: data.list[i].qq,
                        platform: data.list[i].platform,
                        os_version: data.list[i].os_version,
                        client_version: data.list[i].client_version,
                        stars: data.list[i].stars,
                        channel: data.list[i].channel,
                        time: util.convertTime2Str(data.list[i].time),
                        type: data.list[i].type,
                        read: data.list[i].read
                    });
                }
                vm.userFeedbackList(list);
                $('i').tooltip({
                    "margin-top": "50px"
                });
            } else if (vm.startPos() != 1) {
                vm.startPos(vm.startPos() - 1);
                loadUserFeedbackList();
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
        loadUserFeedbackList();
    }
}

function nextPage(){
    vm.startPos(vm.startPos()+1);
    loadUserFeedbackList();
}

function setBgColorIn(obj){
    $(obj).css("backgroundColor","rgba(0,0,0,0.05)")
}

function setBgColorOut(obj){
    $(obj).css("backgroundColor","rgba(0,0,0,0)")
}

function showDetail(){
    vm.u_id(this.u_id);
    var u_nick = this.nick;
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startPos = 1;
    postObj.pageSize = 10000;
    postObj.u_id = this.u_id;
    util.callServerFunction('adminGetFeedbackList', postObj, function (data) {
        if (data.statusCode == 900) {
            var html = "<div class='form-group'><label>回复类型：</label>" +
                "<select id='replyType' class='form-control valid' value='undefined' onchange='changeReplyType()'>" +
                    "<option value='text' selected=''>文本</option>" +
                    "<option value='image'>图片</option>" +
                "</select>" +
            "</div>" +
            "<div class='form-group' id='replyTextDiv'><label>回复内容：</label><textarea id='replyText' style='width: 100%;border-color: #C7D5E0' rows='5'></textarea></div>" +
            "<div class='form-group'  id='replyImageDiv' style='display: none'>" +
                "<label><button type='button' class='btn btn-rounded' onclick='selectReplyImg()'><span class='entypo-export'></span>&nbsp;&nbsp;选择回复图片</button></label>" +
                "<input type='file' id='replyImage' style='display: none' onchange=''>" +
                "<img id='replyImg' style='width: 100%;height: auto' src='' alt='未上传回复图片'>" +
            "</div>" +
            "<div style='border-bottom: 1px #C7D5E0 solid;padding-bottom: 10px'><button class='btn btn-primary' onclick='subReply()'>提交回复</button></div>";
            for (var i = 0; i < data.list.length; i++) {
                html += "<div style='margin-top: 10px;margin-bottom: 10px'>";
                if(data.list[i].direction == "u2a"){
                    html += "<div align='left' style='border-left: 2px solid #65C3DF;padding-left: 5px'>"+ u_nick + "-" + util.convertTime2Str(data.list[i].time) + "</div>";
                }else{
                    html += "<div align='left' style='border-left: 2px solid #A8BDCF;padding-left: 5px'>"+ data.list[i].nick + "-" + util.convertTime2Str(data.list[i].time) + "</div>";
                }
                if(data.list[i].type == "text"){
                    html += "<div style='margin-left: 20px;margin-top: 10px'>" + data.list[i].content + "</div>";
                }else if(data.list[i].type == "image"){
                    html += "<div style='margin-left: 20px;width: 50%;height: auto;margin-top: 10px;cursor: pointer' onclick=\"showSrcImg('"+ util.changeUrl(data.list[i].content) +"')\"><img style='width: 100%;height: auto' src='" + util.changeUrl(data.list[i].content) + "'></div>";
                }else if(data.list[i].type == "voice"){
                    html += "<div style='margin-left: 20px;margin-top: 10px'><audio src='http://123.57.16.157:8062/redirectAmr?url=" + data.list[i].content + "' controls='controls'></audio></div>";
                }
                html += "</div>";
            }
            dialog = $.dialog({
                icon: "icon entypo-back-in-time",
                title: '历史反馈',
                content: html
            });
            $("#replyImage").change(function() {
                var file = this.files[0];
                var reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function () {
                    // 通过 reader.result 来访问生成的 DataURL
                    $("#replyImg").attr('src',reader.result);
                };
            });
        } else {
            errorCodeApi(data.statusCode);
        }
    });
}

function showSrcImg(src){
    $.dialog({
        icon: "icon icon-document-edit",
        title: '原图',
        content: "<div align='center'><button class='btn btn-success' onclick=\"util.rotateImg('testImg', 'left')\"><span class='entypo-ccw'></span>&nbsp;&nbsp;左转</button>&nbsp;&nbsp;"+
        "<button class='btn btn-success' onclick=\"util.rotateImg('testImg', 'right')\">右转&nbsp;&nbsp;<span class='entypo-cw'></span></button></div>" +
        "<br><img style='width:100%;max-width:100%;height:auto' src='"+src+"' id='testImg'>",
        columnClass: 'col-lg-12 col-md-10 col-sm-8 col-xs-6'
    });
}

function changeReplyType(){
    if($("#replyType").val() == "text"){
        $("#replyTextDiv").show();
        $("#replyImageDiv").hide();
    }else{
        $("#replyImageDiv").show();
        $("#replyTextDiv").hide();
    }
}

function selectReplyImg(){
    $("#replyImage").click();
}

function subReply(){
    if($("#replyType").val() == "text" && $("#replyText").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请填写回复内容！"
        })
    }else if($("#replyType").val() == "image" && $("#replyImg").attr("src") == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择回复图片！"
        })
    }else{
        if($("#replyType").val() == "text"){
            submitReply();
        }else{
            var blob = util.dataURLtoBlob($("#replyImg").attr("src"));
            var fd = new FormData();
            fd.append("upload", blob, "image.png");
            xhr.open('POST', '/upload', true);
            xhr.onreadystatechange = submitReply;
            xhr.send(fd);
        }
    }
}

function submitReply(){
    if($("#replyType").val() == "text"){
        var postObj = {
            userID: util.getSessionStorage('userID'),
            authSign: util.getSessionStorage('authSign'),
            u_id: vm.u_id(),
            type: $("#replyType").val(),
            content: $("#replyText").val()
        };
        util.callServerFunction('adminReplyFeedback', postObj, function (resp) {
            if (resp.statusCode == 900) {
                util.toast("回复成功", "success", "系统提示");
                vm.u_id("");
                dialog.close();
            } else {
                errorCodeApi(resp.statusCode);
            }
        });
    }else{
        if(xhr.readyState == 4 && xhr.status === 200){//readyState表示文档加载进度,4表示完毕
            var orientation = "horizontal";
            if($("#replyImg").width() < $("#replyImg").height()){
                orientation = "portrait"
            }
            var postObj = {
                userID: util.getSessionStorage('userID'),
                authSign: util.getSessionStorage('authSign'),
                u_id: vm.u_id(),
                type: $("#replyType").val(),
                content: JSON.parse(xhr.response).filePath,
                orientation: orientation
            };
            util.callServerFunction('adminReplyFeedback', postObj, function(resp){
                if (resp.statusCode == 900) {
                    util.toast("回复成功", "success", "系统提示");
                    vm.u_id("");
                    dialog.close();
                } else {
                    errorCodeApi(resp.statusCode);
                }
            });
        }
    }
    loadUserFeedbackList();
}

function convenientReply(){
    vm.u_id(this.u_id);
    var html = "<div class='form-group'><label>回复类型：</label>" +
        "<select id='replyType' class='form-control valid' value='undefined' onchange='changeReplyType()'>" +
        "<option value='text' selected=''>文本</option>" +
        "<option value='image'>图片</option>" +
        "</select>" +
        "</div>" +
        "<div class='form-group' id='replyTextDiv'><label>回复内容：</label><textarea id='replyText' style='width: 100%;border-color: #C7D5E0' rows='5'></textarea></div>" +
        "<div class='form-group'  id='replyImageDiv' style='display: none'>" +
        "<label><button type='button' class='btn btn-rounded' onclick='selectReplyImg()'><span class='entypo-export'></span>&nbsp;&nbsp;选择回复图片</button></label>" +
        "<input type='file' id='replyImage' style='display: none' onchange=''>" +
        "<img id='replyImg' style='width: 100%;height: auto' src='' alt='未上传回复图片'>" +
        "</div>" +
        "<div style='border-bottom: 1px #C7D5E0 solid;padding-bottom: 10px'><button class='btn btn-primary' onclick='subReply()'>提交回复</button></div>";
    dialog = $.dialog({
        icon: "icon entypo-back-in-time",
        title: '快速回复',
        content: html
    });
    $("#replyImage").change(function(){
        var file = this.files[0];
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            // 通过 reader.result 来访问生成的 DataURL
            $("#replyImg").attr('src',reader.result);
        };
    });
}

var viewModel = function(){
    this.userFeedbackList = ko.observableArray();
    this.startPos = ko.observable(1);
    this.pageSize = ko.observable(15);
    this.prevPage = prevPage;
    this.nextPage = nextPage;
    this.loadUserFeedbackList = loadUserFeedbackList;
    this.showDetail = showDetail;
    this.u_id = ko.observable("");
    this.convenientReply = convenientReply;
};
var xhr = new XMLHttpRequest();
var vm = new viewModel();

$(document).ready(function(){
    ko.applyBindings(vm,document.getElementById("userFeedbackManage"));
    loadUserFeedbackList();
    //window.setInterval(loadUserFeedbackList,5000);
});