/**
 * Created by hjy on 2015/11/30 0030.
 */

function loadUserInfo(){
    var postObj = {
        userID: util.getSessionStorage("userID"),
        authSign: util.getSessionStorage("authSign")
    }
    util.callServerFunction('pubGetUserInfo', postObj, function (data) {
        if (data.statusCode == 900) {
            var year = "",month = "",day = "";
            if(data.userInfo.birthday != ""){
                var birthdayArry = data.userInfo.birthday.split("-");
                year = birthdayArry[0];
                month = birthdayArry[1];
                day = birthdayArry[2];
            }
            $("input:radio[value='"+ data.userInfo.gender +"']").prop("checked",true);
            vm.intro(data.intro);
            vm.name(data.userInfo.name);
            vm.phone(data.userInfo.phone);
            vm.id_no(data.userInfo.id_no);
            vm.age(data.userInfo.age);
            vm.year(year);
            vm.month(month);
            vm.day(day);
            vm.country(data.userInfo.address.country);
            vm.province(data.userInfo.address.province);
            vm.city(data.userInfo.address.city);
            vm.region(data.userInfo.address.region);
            vm.address(data.userInfo.address.address);
            vm.avatar(data.userInfo.avatar);
            vm.id_pic(data.userInfo.verify_info.id_pic);
            vm.certificate_pic(data.userInfo.verify_info.certificate_pic);
            vm.verify_desc(data.userInfo.verify_info.verify_desc);
            new PCAS("province","city","region",data.userInfo.address.province,data.userInfo.address.city,data.userInfo.address.region);
        } else {
            errorCodeApi(data.statusCode);
        }
    });
}

function selectImg(){
    $("#"+vm.objTemp()).click();
}

function changeImgConfirm(obj){
    vm.objTemp(obj);
    if(obj == "avatar"){
        selectImg();
    }else{
        dialog = util.confirm("系统提示","如果重新上传照片，您的账号将会转为待审核状态",selectImg,"l");
    }
}

function saveUserInfo(){
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
        if (xhr.readyState == 4) {//readyState表示文档加载进度,4表示完毕
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
        if (xhr.readyState == 4) {//readyState表示文档加载进度,4表示完毕
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
        if (xhr.readyState == 4) {//readyState表示文档加载进度,4表示完毕
            vm.certificate_picTemp(JSON.parse(xhr.response).filePath);
            var postObj = {
                userID: util.getSessionStorage("userID"),
                authSign: util.getSessionStorage("authSign"),
                name: vm.name(),
                phone: vm.phone(),
                gender: $("input:radio[name='gender']:checked").val(),
                id_no: vm.name(),
                age: vm.age(),
                birthday: vm.year() + "-" + vm.month() + "-" + vm.day(),
                country: "中国",
                province: vm.province(),
                city: vm.city(),
                region: vm.region(),
                address: vm.address(),
                avatar: vm.avatarTemp(),
                id_pic: vm.id_picTemp(),
                certificate_pic: vm.certificate_picTemp(),
                intro: vm.intro(),
                verify_desc: vm.verify_desc()
            };
            util.callServerFunction('pubChangeUserInfo', postObj, function (data) {
                if (data.statusCode == 900) {
                    util.toast("修改成功", "success", "系统提示");
                } else {
                    errorCodeApi(data.statusCode);
                }
            });
        }
    }else{
        vm.certificate_picTemp($("#certificate_picImg").attr("src"));
        var postObj = {
            userID: util.getSessionStorage("userID"),
            authSign: util.getSessionStorage("authSign"),
            name: vm.name(),
            phone: vm.phone(),
            gender: $("input:radio[name='gender']:checked").val(),
            id_no: vm.name(),
            age: vm.age(),
            birthday: vm.year() + "-" + vm.month() + "-" + vm.day(),
            country: "中国",
            province: vm.province(),
            city: vm.city(),
            region: vm.region(),
            address: vm.address(),
            avatar: vm.avatarTemp(),
            id_pic: vm.id_picTemp(),
            certificate_pic: vm.certificate_picTemp(),
            intro: vm.intro(),
            verify_desc: vm.verify_desc()
        };
        util.callServerFunction('pubChangeUserInfo', postObj, function (data) {
            if (data.statusCode == 900) {
                util.toast("修改成功", "success", "系统提示");
            } else {
                errorCodeApi(data.statusCode);
            }
        });
    }
    tabImproveUserInfo();
}

var viewModel = function(){
    this.avatarTemp = ko.observable("");
    this.id_picTemp = ko.observable("");
    this.certificate_picTemp = ko.observable("");
    this.objTemp = ko.observable("");

    this.intro = ko.observable("");
    this.name = ko.observable("");
    this.gender = ko.observable("");
    this.phone = ko.observable("");
    this.id_no = ko.observable("");
    this.age = ko.observable("");
    this.year = ko.observable("");
    this.month = ko.observable("");
    this.day = ko.observable("");
    this.country = ko.observable("");
    this.province = ko.observable("");
    this.city = ko.observable("");
    this.region = ko.observable("");
    this.address = ko.observable("");
    this.avatar = ko.observable("");
    this.id_pic = ko.observable("");
    this.certificate_pic = ko.observable("");
    this.verify_desc = ko.observable("");
}

var vm = new viewModel();
var xhr = new XMLHttpRequest();
$(function(){
    var yearHtml = "<option value=''>年</option>"
        ,monthHtml = "<option value=''>月</option>"
        ,dayHtml = "<option value=''>日</option>";
    for(var i = 2015;i >= 1896; i--){
        yearHtml += "<option value='"+ i +"'>"+ i +"年</option>";
    }
    for(var j = 1;j <= 12; j++){
        monthHtml += "<option value='"+ j +"'>"+ j +"月</option>";
    }
    for(var k = 1;k <= 31; k++){
        dayHtml += "<option value='"+ k +"'>"+ k +"日</option>";
    }
    $("#year").append(yearHtml);
    $("#month").append(monthHtml);
    $("#day").append(dayHtml);

    $("#avatar").change(function(){
        var file = this.files[0];
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            // 通过 reader.result 来访问生成的 DataURL
            var url = reader.result;
            vm.avatarTemp(url);
            $("#avatarImg").attr("src",url);
        };
    });
    $("#id_pic").change(function(){
        var file = this.files[0];
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            // 通过 reader.result 来访问生成的 DataURL
            var url = reader.result;
            vm.id_picTemp(url);
            $("#id_picImg").attr("src",url);
        };
    });
    $("#certificate_pic").change(function(){
        var file = this.files[0];
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            // 通过 reader.result 来访问生成的 DataURL
            var url = reader.result;
            vm.certificate_picTemp(url);
            $("#certificate_picImg").attr("src",url);
        };
    });

    ko.applyBindings(vm,document.getElementById("improveUserInfo"));
    loadUserInfo();
});