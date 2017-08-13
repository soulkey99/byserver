/**
 * Created by hjy on 2015/11/27 0027.
 */

function loadPubList(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startPos = (vm.startPos()-1)*vm.pageSize()+1;
    postObj.pageSize = vm.pageSize();
    postObj.startTime = new Date($("#startTime").val()).getTime();
    postObj.endTime = new Date($("#endTime").val()).getTime();
    postObj.nick = $("#pubNick").val();
    postObj.email = $("#email").val();
    postObj.status = $("#pubStatus").val();
    postObj.verify_type = $("#pub_verify_type").val();
    util.callServerFunction('adminGetPubList', postObj, function (data) {
        if (data.statusCode == 900) {
            vm.pubList.removeAll();
            if (data.list.length > 0) {
                var list = [];
                for (var i = 0; i < data.list.length; i++) {
                    list.push({
                        id: (i + 1),
                        u_id: data.list[i].u_id,
                        email: data.list[i].email,
                        nick: data.list[i].nick,
                        pubID: data.list[i].pubID,
                        status: data.list[i].status,
                        verify_type: data.list[i].verify_type,
                        create_time: util.convertTime2Str(data.list[i].create_time)
                    });
                }
                vm.pubList(list);
                $('i').tooltip({
                    "margin-top": "50px"
                });
            } else if (vm.startPos() != 1) {
                vm.startPos(vm.startPos() - 1);
                loadPubList();
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
        loadPubList();
    }
}

function nextPage(){
    vm.startPos(vm.startPos()+1);
    loadPubList();
}

function subLoadPubList(){
    vm.startPos(1);
    vm.pageSize(15);
    loadPubList();
}

function initEditPub(){
    vm.avatarTemp("");
    vm.id_picTemp("");
    vm.certificate_picTemp("");
    var u_id = this.u_id;
    var postObj = {
        userID: util.getSessionStorage("userID"),
        authSign:util.getSessionStorage("authSign"),
        u_id: this.u_id
    };
    util.callServerFunction('adminGetPubDetail', postObj, function (data) {
        if (data.statusCode == 900) {
            var html = "<input type='hidden' id='u_id' value='" + u_id + "'>" +
                "<div class='form-group'>" +
                "<label>电子邮件：</label><input type='text' class='form-control' id='emailEdit' value='" + data.detail.email + "'>" +
                "</div>" +
                "<div class='form-group'>" +
                "<label>公众号名称：</label><input type='text' class='form-control' id='nickEdit' value='" + data.detail.nick + "'>" +
                "</div>" +
                "<div class='form-group'>" +
                "<label>状态：</label>" +
                "<select id='statusEdit' class='form-control valid'>" +
                "<option value='active'>已激活</option>" +
                "<option value='inactive'>未激活</option>" +
                "</select>" +
                "</div>" +
                "<div class='form-group'>" +
                "<label>姓名：</label><input type='text' class='form-control' id='name' value='" + data.detail.userInfo.name + "'>" +
                "</div>" +
                "<div class='form-group'>" +
                "<label>性别：</label>" +
                "<label><input type='radio' name='gender' value='男'>男</label>&nbsp;&nbsp;&nbsp;&nbsp;" +
                "<label><input type='radio' name='gender' value='女'>女</label></div>" +
                "<div class='form-group'>" +
                "<label>身份证号：</label><input type='text' class='form-control' id='id_no' value='" + data.detail.userInfo.id_no + "'>" +
                "</div>" +
                "<div class='form-group'>" +
                "<label>年龄：</label><input type='text' class='form-control' id='age' value='" + data.detail.userInfo.age + "'>" +
                "</div>" +
                "<div class='form-group'>" +
                "<label>出生日期：</label><input type='text' class='form-control' id='birthday' value='" + data.detail.userInfo.birthday + "'>" +
                "</div>" +
                "<div class='form-group'>" +
                "<label>国家：</label><input type='text' class='form-control' id='country' value='" + data.detail.userInfo.address.country + "'>" +
                "</div>" +
                "<div class='form-group'>" +
                "<label>省份：</label><input type='text' class='form-control' id='province' value='" + data.detail.userInfo.address.province + "'>" +
                "</div>" +
                "<div class='form-group'>" +
                "<label>城市：</label><input type='text' class='form-control' id='city' value='" + data.detail.userInfo.address.city + "'>" +
                "</div>" +
                "<div class='form-group'>" +
                "<label>地区：</label><input type='text' class='form-control' id='region' value='" + data.detail.userInfo.address.region + "'>" +
                "</div>" +
                "<div class='form-group'>" +
                "<label>详细地址：</label><input type='text' class='form-control' id='address' value='" + data.detail.userInfo.address.address + "'>" +
                "</div>" +
                "<div class='form-group'>" +
                "<label>自我简介：</label><textarea id='intro' value='"+ data.detail.intro +"' rows='5' style='width:100%;border-color: #C7D5E0'>"+ data.detail.intro +"</textarea>" +
                "</div>" +
                "<div class='form-group'>" +
                "<label>认证说明：</label><textarea id='verify_desc' value='"+ data.detail.userInfo.verify_info.verify_desc +"' rows='5' style='width:100%;border-color: #C7D5E0'>"+ data.detail.userInfo.verify_info.verify_desc +"</textarea>" +
                "</div>" +
                "<div class='form-group'>" +
                "<label>认证状态：</label>" +
                "<select id='verify_type' class='form-control valid'>" +
                "<option value='notVerified'>初始状态</option>"+
                "<option value='verified'>验证通过</option>"+
                "<option value='fail'>验证失败</option>"+
                "<option value='waitingVerify'>等待验证</option>"+
                "</select>" +
                "</div>" +
                "<div class='form-group'>" +
                "<label>管理员意见：</label><textarea id='admin_reason' value='"+ data.detail.userInfo.verify_info.admin_reason +"' rows='5' style='width:100%;border-color: #C7D5E0'>"+ data.detail.userInfo.verify_info.admin_reason +"</textarea>" +
                "</div>" +
                "<div class='form-group'>" +
                "<input type='file' id='avatar' style='display: none'/>" +
                "<label>头像：<button type='button' class='btn btn-rounded' onclick=\"selectFile('avatar')\"><span class='entypo-export'></span>&nbsp;&nbsp;选择文件</button>&nbsp;&nbsp;</label>" +
                "<img id='avatarImg' style='width: 50%;height: auto;margin-top: 5px' src='" + data.detail.userInfo.avatar + "'>" +
                "</div>" +
                "<div class='form-group'>" +
                "<input type='file' id='id_pic' style='display: none'/>" +
                "<label>身份证图片：<button type='button' class='btn btn-rounded' onclick=\"selectFile('id_pic')\"><span class='entypo-export'></span>&nbsp;&nbsp;选择文件</button>&nbsp;&nbsp;</label>" +
                "<img id='id_picImg' style='width: 100%;height: auto;margin-top: 5px' src='" + data.detail.userInfo.verify_info.id_pic + "'>" +
                "</div>" +
                "<div class='form-group'>" +
                "<input type='file' id='certificate_pic' style='display: none'/>" +
                "<label>资格证图片：<button type='button' class='btn btn-rounded' onclick=\"selectFile('certificate_pic')\"><span class='entypo-export'></span>&nbsp;&nbsp;选择文件</button>&nbsp;&nbsp;</label>" +
                "<img id='certificate_picImg' style='width: 100%;height: auto;margin-top: 5px' src='" + data.detail.userInfo.verify_info.certificate_pic + "'>" +
                "</div>" +
                "<button class='btn btn-primary' onclick='editPub()'>提 交</button>";
            dialog = $.dialog({
                icon: "icon icon-document-edit",
                title: '修改公众号',
                content: html
            });
            $("#avatar").change(function () {
                var file = this.files[0];
                var reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function () {
                    // 通过 reader.result 来访问生成的 DataURL
                    var url = reader.result;
                    vm.avatarTemp(url);
                    $("#avatarImg").attr('src', url);
                };
            });
            $("#id_pic").change(function () {
                var file = this.files[0];
                var reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function () {
                    // 通过 reader.result 来访问生成的 DataURL
                    var url = reader.result;
                    vm.id_picTemp(url);
                    $("#id_picImg").attr('src', url);
                };
            });
            $("#certificate_pic").change(function () {
                var file = this.files[0];
                var reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function () {
                    // 通过 reader.result 来访问生成的 DataURL
                    var url = reader.result;
                    vm.certificate_picTemp(url);
                    $("#certificate_picImg").attr('src', url);
                };
            });
            $("input:radio[name='gender'][value='"+ data.detail.userInfo.gender +"']").prop("checked",true);
            $("#statusEdit").val(data.detail.status);
            $("#verify_type").val(data.detail.userInfo.verify_info.verify_type);
        } else {
            errorCodeApi(data.statusCode);
        }
    });
}

function selectFile(obj){
    $("#"+obj).click();
}

function editPub(){
    if(vm.avatarTemp() != ""){
        var dataurl = vm.avatarTemp();
        var blob = util.dataURLtoBlob(dataurl);
        var fd = new FormData();
        fd.append("upload", blob, "image.png");
        xhr.open('POST', '/upload', true);
        xhr.onreadystatechange = uploadAvatar;
        xhr.send(fd);
    }else{
        uploadAvatar();
    }
}

function uploadAvatar(){
    if(vm.avatarTemp() != "") {
        if (xhr.readyState == 4 && xhr.status === 200) {//readyState表示文档加载进度,4表示完毕
            vm.avatarTemp(JSON.parse(xhr.response).filePath);
            if (vm.id_picTemp() != "") {
                var dataurl = vm.id_picTemp();
                var blob = util.dataURLtoBlob(dataurl);
                var fd = new FormData();
                fd.append("upload", blob, "image.png");
                xhr.open('POST', '/upload', true);
                xhr.onreadystatechange = uploadId_pic;
                xhr.send(fd);
            } else {
                uploadId_pic();
            }
        }
    }else{
        vm.avatarTemp($("#avatarImg").attr("src"));
        if (vm.id_picTemp() != "") {
            var dataurl = vm.id_picTemp();
            var blob = util.dataURLtoBlob(dataurl);
            var fd = new FormData();
            fd.append("upload", blob, "image.png");
            xhr.open('POST', '/upload', true);
            xhr.onreadystatechange = uploadId_pic;
            xhr.send(fd);
        } else {
            uploadId_pic();
        }
    }
}

function uploadId_pic(){
    if(vm.id_picTemp() != "") {
        if (xhr.readyState == 4 && xhr.status === 200) {//readyState表示文档加载进度,4表示完毕
            vm.id_picTemp(JSON.parse(xhr.response).filePath);
            if (vm.certificate_picTemp() != "") {
                var dataurl = vm.certificate_picTemp();
                var blob = util.dataURLtoBlob(dataurl);
                var fd = new FormData();
                fd.append("upload", blob, "image.png");
                xhr.open('POST', '/upload', true);
                xhr.onreadystatechange = uploadCertificate_pic;
                xhr.send(fd);
            } else {
                uploadCertificate_pic();
            }
        }
    }else{
        vm.id_picTemp($("#id_picImg").attr("src"));
        if (vm.certificate_picTemp() != "") {
            var dataurl = vm.certificate_picTemp();
            var blob = util.dataURLtoBlob(dataurl);
            var fd = new FormData();
            fd.append("upload", blob, "image.png");
            xhr.open('POST', '/upload', true);
            xhr.onreadystatechange = uploadCertificate_pic;
            xhr.send(fd);
        } else {
            uploadCertificate_pic();
        }
    }
}

function uploadCertificate_pic(){
    if(vm.certificate_picTemp() != "") {
        if (xhr.readyState == 4 && xhr.status === 200) {//readyState表示文档加载进度,4表示完毕
            vm.certificate_picTemp(JSON.parse(xhr.response).filePath);
            var postObj = {
                userID: util.getSessionStorage("userID"),
                authSign:util.getSessionStorage("authSign"),
                u_id: $("#u_id").val(),
                email: $("#emailEdit").val(),
                nick: $("#nickEdit").val(),
                status: $("#statusEdit").val(),
                name: $("#name").val(),
                gender: $("input:radio[name='gender']:checked").val(),
                id_no: $("#id_no").val(),
                age: $("#age").val(),
                birthday: $("#birthday").val(),
                country: $("#country").val(),
                province: $("#province").val(),
                city: $("#city").val(),
                region: $("#region").val(),
                address: $("#address").val(),
                avatar: vm.avatarTemp(),
                verify_desc: $("#verify_desc").val(),
                id_pic: vm.id_picTemp(),
                certificate_pic: vm.certificate_picTemp(),
                verify_type: $("#verify_type").val(),
                admin_reason: $("#admin_reason").val(),
                intro: $("#intro").val()
            };
            util.callServerFunction('adminModifyPub', postObj, function (data) {
                if (data.statusCode == 900) {
                    util.toast("修改成功", "success", "系统提示");
                    dialog.close();
                    loadPubList();
                } else {
                    errorCodeApi(data.statusCode);
                }
            });
        }
    }else{
        vm.certificate_picTemp($("#certificate_picImg").attr("src"));
        var postObj = {
            userID: util.getSessionStorage("userID"),
            authSign:util.getSessionStorage("authSign"),
            u_id: $("#u_id").val(),
            email: $("#emailEdit").val(),
            nick: $("#nickEdit").val(),
            status: $("#statusEdit").val(),
            name: $("#name").val(),
            gender: $("input:radio[name='gender']:checked").val(),
            id_no: $("#id_no").val(),
            age: $("#age").val(),
            birthday: $("#birthday").val(),
            country: $("#country").val(),
            province: $("#province").val(),
            city: $("#city").val(),
            region: $("#region").val(),
            address: $("#address").val(),
            avatar: vm.avatarTemp(),
            verify_desc: $("#verify_desc").val(),
            id_pic: vm.id_picTemp(),
            certificate_pic: vm.certificate_picTemp(),
            verify_type: $("#verify_type").val(),
            admin_reason: $("#admin_reason").val(),
            intro: $("#intro").val()
        };
        util.callServerFunction('adminModifyPub', postObj, function (data) {
            if (data.statusCode == 900) {
                util.toast("修改成功", "success", "系统提示");
                dialog.close();
                loadPubList();
            } else {
                errorCodeApi(data.statusCode);
            }
        });
    }
}

function showDetail(){
    var postObj = {
        userID: util.getSessionStorage("userID"),
        authSign:util.getSessionStorage("authSign"),
        u_id: this.u_id
    },u_id = this.u_id;
    util.callServerFunction('adminGetPubDetail', postObj, function (data) {
        if (data.statusCode == 900) {
            var status = "未激活",verify_type = "";
            if(data.detail.status == "active"){
                status = "已激活";
            }
            if(data.detail.userInfo.verify_info.verify_type == "notVerified"){
                verify_type = "初始状态"
            }else if(data.detail.userInfo.verify_info.verify_type == "verified"){
                verify_type = "验证通过"
            }else if(data.detail.userInfo.verify_info.verify_type == "fail"){
                verify_type = "验证失败"
            }else if(data.detail.userInfo.verify_info.verify_type == "waitingVerify"){
                verify_type = "等待验证"
            }
            var html = "<input type='hidden' id='u_id' value='" + u_id + "'><table class='table col-lg-12 col-md-12 col-sm-12 col-xs-12'>"+
                "<tbody>"+
                "<tr>"+
                "<td class='col-lg-3 col-md-4 col-sm-5 col-xs-6'>电子邮件：</td>"+
                "<td class='subject'>"+ data.detail.email +"</td>"+
                "</tr>"+
                "<tr>"+
                "<td>公众号名称：</td>"+
                "<td class='subject'>"+ data.detail.nick +"</td>"+
                "</tr>"+
                "<tr>"+
                "<td>状态：</td>"+
                "<td class='subject'>"+ status +"</td>"+
                "</tr>"+
                "<tr>"+
                "<td>姓名：</td>"+
                "<td class='subject'>"+ data.detail.userInfo.name +"</td>"+
                "</tr>"+
                "<tr>"+
                "<td>性别：</td>"+
                "<td class='subject'>"+ data.detail.userInfo.gender +"</td>"+
                "</tr>"+
                "<tr>"+
                "<td>身份证号：</td>"+
                "<td class='subject'>"+ data.detail.userInfo.id_no +"</td>"+
                "</tr>"+
                "<tr>"+
                "<td>年龄：</td>"+
                "<td class='subject'>"+ data.detail.userInfo.age +"</td>"+
                "</tr>"+
                "<tr>"+
                "<td>出生日期：</td>"+
                "<td class='subject'>"+ data.detail.userInfo.birthday +"</td>"+
                "</tr>"+
                "<tr>"+
                "<td>国家：</td>"+
                "<td class='subject'>"+ data.detail.userInfo.address.country +"</td>"+
                "</tr>"+
                "<tr>"+
                "<td>省份：</td>"+
                "<td class='subject'>"+ data.detail.userInfo.address.province +"</td>"+
                "</tr>"+
                "<tr>"+
                "<td>城市：</td>"+
                "<td class='subject'>"+ data.detail.userInfo.address.city +"</td>"+
                "</tr>"+
                "<tr>"+
                "<td>地区：</td>"+
                "<td class='subject'>"+ data.detail.userInfo.address.region +"</td>"+
                "</tr>"+
                "<tr>"+
                "<td>详细地址：</td>"+
                "<td class='subject'>"+ data.detail.userInfo.address.address +"</td>"+
                "</tr>"+
                "<tr>"+
                "<td>自我简介：</td>"+
                "<td class='subject'>"+ data.detail.intro +"</td>"+
                "</tr>"+
                "<tr>"+
                "<td>认证说明：</td>"+
                "<td class='subject'>"+ data.detail.userInfo.verify_info.verify_desc +"</td>"+
                "</tr>"+
                "<tr>"+
                "<td>认证状态：</td>"+
                "<td class='subject'>"+ verify_type +"</td>"+
                "</tr>"+
                "<tr>"+
                "<td>管理员意见：</td>"+
                "<td class='subject'>"+ data.detail.userInfo.verify_info.admin_reason +"</td>"+
                "</tr>"+
                "<tr>"+
                "<td>头像：</td>"+
                "<td class='subject'><img style='width:50%;height:auto;' src='"+ data.detail.userInfo.avatar +"'></td>"+
                "</tr>"+
                "<tr>"+
                "<td>身份证图片：</td>"+
                "<td class='subject'><img style='width:100%;height:auto;' src='"+ data.detail.userInfo.verify_info.id_pic +"'></td>"+
                "</tr>"+
                "<tr>"+
                "<td>资格证图片：</td>"+
                "<td class='subject'><img style='width:100%;height:auto;' src='"+ data.detail.userInfo.verify_info.certificate_pic +"'></td>"+
                "</tr>";
            if(data.detail.userInfo.verify_info.verify_type == "waitingVerify"){
                html += "<tr>"+
                "<td><i class='fa entypo-info-circled'></i> 管理员意见：</td>"+
                "<td class='subject'><textarea style='width:100%;border-color: #C7D5E0' id='admin_reason' rows='3'></textarea></td>"+
                "</tr>"+
                "<tr>"+
                "<td><i class='fa entypo-attach'></i> 是否通过：</td>"+
                "<td class='subject'>" +
                "<button type='button' title='通过' class='btn btn-rounded' onclick='verifyPub(true)'><i class='icon icon-checkmark'></i> 通过</button>&nbsp;&nbsp;&nbsp;&nbsp;" +
                "<button type='button' title='不通过' class='btn btn-rounded' onclick='verifyPub(false)'><i class='icon icon-cross'></i> 不通过</button>" +
                "</td>"+
                "</tr>";
            }
                html += "</tbody><table>";
            dialog = $.dialog({
                icon: "icon icon-document",
                title: '公众号详情',
                content: html
            });
        } else {
            errorCodeApi(data.statusCode);
        }
    });
}

function verifyPub(sign){
    var postObj = {
        userID: util.getSessionStorage("userID"),
        authSign:util.getSessionStorage("authSign"),
        u_id: $("#u_id").val(),
        verify: sign,
        admin_reason: $("#admin_reason").val()
    };
    util.callServerFunction('adminVerifyPub', postObj, function (data) {
        if (data.statusCode == 900) {
            util.toast("操作成功", "success", "系统提示");
            dialog.close();
            loadPubList();
        } else {
            errorCodeApi(data.statusCode);
        }
    });
}

var viewModel = function(){
    this.pubList = ko.observableArray();
    this.startPos = ko.observable(1);
    this.pageSize = ko.observable(15);
    this.prevPage = prevPage;
    this.nextPage = nextPage;
    this.loadPubList = loadPubList;
    this.subLoadPubList = subLoadPubList;
    this.initEditPub = initEditPub;
    this.showDetail = showDetail;
    this.avatarTemp = ko.observable("");
    this.id_picTemp = ko.observable("");
    this.certificate_picTemp = ko.observable("");
};
var vm = new viewModel();
var date = new Date();
var xhr = new XMLHttpRequest();
var dialog = "";
$(document).ready(function(){
    ko.applyBindings(vm,document.getElementById("pubManage"));
    util.initDateTimePicker("startTime",{defaultDate: new Date(date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + ' 00:00:00')});
    util.initDateTimePicker("endTime",{defaultDate: new Date(date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + " 23:59:59")});
    $('.selectpicker').selectpicker({
        style: 'btn btn-info'
    });
    $('.btn-group').css("width","100%");
    document.onkeydown=function(event){
        e = event ? event :(window.event ? window.event : null);
        if(e.keyCode==13){
            subLoadPubList();
            return false;
        }
    }
    loadPubList();
});