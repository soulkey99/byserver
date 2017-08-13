/**
 * Created by hjy on 2016/4/6 0006.
 */

/**
 * Created by hjy on 2015/9/19.
 */

function prevPageTeacherManager(){
    if(vm.startPosAllTeacherManager()==1){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"您已经在第一页了！"
        })
    }else{
        vm.startPosAllTeacherManager(vm.startPosAllTeacherManager()-1);
        loadTeacherList();
    }
}

function nextPageTeacherManager(){
    vm.startPosAllTeacherManager(vm.startPosAllTeacherManager()+1);
    loadTeacherList();
}

function subLoadTeacherList(){
    vm.startPosAllTeacherManager(1);
    vm.pageSizeAllTeacherManager(15);
    loadTeacherList();
}

//获取教师列表
function loadTeacherList(){
    var senior_type = new Array();
    $("input[name='verifyType']").each(function() {
        if ($(this).prop("checked") == true) {
            senior_type.push($(this).val());
        }
    });
    senior_type = senior_type.join(",");

    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startPos = (vm.startPosAllTeacherManager()-1)*vm.pageSizeAllTeacherManager()+1;
    postObj.pageSize = vm.pageSizeAllTeacherManager();
    postObj.senior_type = senior_type;
    postObj.t_nick = $("#t_nick").val();
    postObj.t_phone = $("#t_phone").val();
    postObj.startTime = new Date($("#startTime").val()).getTime();
    postObj.endTime = new Date($("#endTime").val()).getTime();
    postObj.sort = vm.sort();
    //var dateTest = new Date("Year","Month","Day","Hour","Minutes","Seconds");
    util.callServerFunction('adminGetTeacherListToVerify', postObj, function(data){
        if(data.statusCode == 900){
            vm.teacherToVerify.removeAll();
            if(data.teacherList.length > 0) {
                var teacherList = [];
                for (var i = 0; i < data.teacherList.length; i++) {
                    teacherList.push({
                        id: (i+1),
                        t_id: data.teacherList[i].t_id,
                        t_nick: data.teacherList[i].nick,
                        t_name: data.teacherList[i].t_name,
                        phone: data.teacherList[i].phone,
                        id_no: data.teacherList[i].id_no,
                        gender: data.teacherList[i].gender,
                        school: data.teacherList[i].school,
                        id_pic: data.teacherList[i].id_pic,
                        certificate_pic: data.teacherList[i].certificate_pic,
                        //admin_reason: data.teacherList[i].userInfo.teacher_info.admin_reason,
                        verify_desc: data.teacherList[i].verify_desc,
                        verify_type: data.teacherList[i].verify_type,
                        create_time: util.convertTime2Str(data.teacherList[i].create_time),
                        grades: data.teacherList[i].grades,
                        teach_years: data.teacherList[i].teach_years,
                        province: data.teacherList[i].address.province,
                        city: data.teacherList[i].address.city,
                        school: data.teacherList[i].school,
                        teach_feature: data.teacherList[i].teach_feature,
                        honors: data.teacherList[i].honors,
                        honor_pics: data.teacherList[i].honor_pics,
                        senior_grades: data.teacherList[i].senior_grades,
                        senior_pre_grades: data.teacherList[i].senior_pre_grades,
                        senior_type: data.teacherList[i].senior_type
                    });
                }
                vm.teacherToVerify(teacherList);
            }else if(vm.startPosAllTeacherManager()!=1){
                vm.startPosAllTeacherManager(vm.startPosAllTeacherManager()-1);
                loadTeacherList();
                $.dialog({
                    icon: 'icon icon-warning',
                    title: '提示信息',
                    content:"您已经在最后一页了！"
                })
            }
            $('i').tooltip({
                "margin-top": "50px"
            });
        }else {
            errorCodeApi(data.statusCode);
        }
    })
}

var dialog;
function showDetail(){   //显示教师详情
    var seniorPreGradesHtml = "<table style='margin-bottom: 5px'><tr><td><label class='checkbox-inline' style='padding-left: 0px !important;'><span class='label label-info inline'>小学</span></label></td>" +
        "<td><label class='checkbox-inline' style='margin-left: 10px'><input type='checkbox' name='小学' value='数学'>数学</label>"+
        "<label class='checkbox-inline'><input type='checkbox' name='小学' value='语文'>语文</label>"+
        "<label class='checkbox-inline'><input type='checkbox' name='小学' value='英语'>英语</label></td></tr></table>"+
        "<table style='margin-bottom: 5px'><tr style='vertical-align: top'><td><label class='checkbox-inline' style='padding-left: 0px !important;'><span class='label label-info inline'>初中</span></label></td>" +
        "<td><label class='checkbox-inline' style='margin-left: 10px'><input type='checkbox' name='初中' value='数学'>数学</label>"+
        "<label class='checkbox-inline'><input type='checkbox' name='初中' value='语文'>语文</label>"+
        "<label class='checkbox-inline'><input type='checkbox' name='初中' value='英语'>英语</label>"+
        "<label class='checkbox-inline'><input type='checkbox' name='初中' value='物理'>物理</label>"+
        "<label class='checkbox-inline'><input type='checkbox' name='初中' value='化学'>化学</label>" +
        "<label class='checkbox-inline'><input type='checkbox' name='初中' value='生物'>生物</label>" +
        "<label class='checkbox-inline'><input type='checkbox' name='初中' value='政治'>政治</label>" +
        "<label class='checkbox-inline'><input type='checkbox' name='初中' value='历史'>历史</label>" +
        "<label class='checkbox-inline'><input type='checkbox' name='初中' value='地理'>地理</label>" +
        "</td></tr></table>"+
        "<table style='margin-bottom: 5px'><tr style='vertical-align: top'><td><label class='checkbox-inline' style='padding-left: 0px !important;'><span class='label label-info inline'>高中</span></label></td>" +
        "<td><label class='checkbox-inline' style='margin-left: 10px'><input type='checkbox' name='高中' value='数学'>数学</label>"+
        "<label class='checkbox-inline'><input type='checkbox' name='高中' value='语文'>语文</label>"+
        "<label class='checkbox-inline'><input type='checkbox' name='高中' value='英语'>英语</label>"+
        "<label class='checkbox-inline'><input type='checkbox' name='高中' value='物理'>物理</label>"+
        "<label class='checkbox-inline'><input type='checkbox' name='高中' value='化学'>化学</label>" +
        "<label class='checkbox-inline'><input type='checkbox' name='高中' value='生物'>生物</label>" +
        "<label class='checkbox-inline'><input type='checkbox' name='高中' value='政治'>政治</label>" +
        "<label class='checkbox-inline'><input type='checkbox' name='高中' value='历史'>历史</label>" +
        "<label class='checkbox-inline'><input type='checkbox' name='高中' value='地理'>地理</label>" +
        "</td></tr></table>";
    var seniorGrades = "";
    for(var j=0;j<this.senior_grades.length;j++){
        seniorGrades += "<table style='margin-bottom: 5px'><tr><td><label class='checkbox-inline' style='padding-left: 0px !important;'><span class='label label-info inline'>"+ this.senior_grades[j].grade +"</span></label></td><td>";
        for(var k=0;k<this.senior_grades[j].subjects.length;k++){
            seniorGrades += "<span style='margin-left: 10px'>"+ this.senior_grades[j].subjects[k].subject +"</span>";
        }
        seniorGrades += "</td></tr></table>";
    }
    var honor_pics = "";
    for(var j=0;j<this.honor_pics.length;j++){
        honor_pics += "<img src='"+ this.honor_pics[j] +"' style='width: 20%;margin-right: 10px;cursor: pointer' onclick=\"showSrcImg('"+ this.honor_pics[j] +"')\">";
    }
    vm.detail_t_id(this.t_id);
    vm.detail_name(this.t_name);
    vm.detail_phone(this.phone);
    vm.detail_gender(this.gender);
    //vm.detail_school(this.school);
    vm.detail_id_no(this.id_no);
    vm.detail_verify_desc(this.verify_desc);
    vm.detail_senior_grades(this.senior_grades);
    if(this.id_pic.indexOf("http")<0 && this.id_pic!=""){
        vm.detail_id_pic(util.changeUrl(this.id_pic));
    }else{
        vm.detail_id_pic(this.id_pic);
    }
    if(this.certificate_pic.indexOf("http")<0 && this.certificate_pic!=""){
        vm.detail_id_pic(util.changeUrl(this.certificate_pic));
    }else{
        vm.detail_id_pic(this.certificate_pic);
    }
    var html = "<table class='table col-lg-12 col-md-12 col-sm-12 col-xs-12'>"+
        "<tbody>"+
        "<tr>"+
        "<td class='col-lg-3 col-md-4 col-sm-5 col-xs-6'><i class='fa entypo-user'></i> 姓名：</td>"+
        "<td class='subject'>"+this.t_name+"</td>"+
        "</tr>"+
        "<tr>"+
        "<td><i class='fa entypo-cc-by'></i> 性别：</td>"+
        "<td class='subject'>"+this.gender+"</td>"+
        "</tr>"+
        "<tr>"+
        "<td><i class='fa entypo-mobile'></i> 手机号：</td>"+
        "<td class='subject'>"+this.phone+"</td>"+
        "</tr>"+
        "<tr>"+
        "<td><i class='fa entypo-vcard'></i> 身份证号：</td>"+
        "<td class='subject'>"+this.id_no+"</td>"+
        "</tr>"+
        "<tr>"+
        "<td><i class='fa entypo-hourglass'></i> 在职教龄：</td>"+
        "<td class='subject'>"+this.teach_years+"</td>"+
        "</tr>"+
        "<tr>"+
        "<td><i class='fa entypo-location'></i> 职教省市：</td>"+
        "<td class='subject'>"+this.province+"省"+this.city+"市</td>"+
        "</tr>"+
        "<tr>"+
        "<td><i class='fa entypo-book'></i> 职教学校：</td>"+
        "<td class='subject'>"+this.school+"</td>"+
        "</tr>"+
        "<tr>"+
        "<td><i class='fa entypo-thumbs-up'></i> 教学特点：</td>"+
        "<td class='subject'>"+this.teach_feature+"</td>"+
        "</tr>"+
        "<tr>"+
        "<td><i class='fa entypo-graduation-cap'></i> 荣誉资质或职称：</td>"+
        "<td class='subject'>" +
        "<input id='tag' type='text' class='form-control tags' value='"+ this.honors.join(",") +"'>"+
        "</tr>"+
        "<tr>"+
        "<td><i class='fa entypo-picture'></i> 荣誉资质或职称原件照片：</td>"+
        "<td class='subject'>"+honor_pics+"</td>"+
        "</tr>"+
        "<tr>"+
        "<td><i class='fa entypo-clock'></i> 已开通付费科目：</td>"+
        "<td class='subject'>"+seniorGrades+"</td>"+
        "</tr>"+
        "<tr>"+
        "<td><i class='fa entypo-back-in-time'></i> 申请开通付费科目：</td>"+
        "<td class='subject'>"+seniorPreGradesHtml+"</td>"+
        "</tr>"+
        "</td></tr><tr>"+
        "<td><i class='fa entypo-mail'></i> 是/否短信提醒：</td>"+
        "<td class='subject'>" +
        "<label><input type='checkbox' id='sendMessage' onchange='checkPhone()'>短信提醒</label>" +
        "</td>"+
        "</tr>"+
        "<tr>"+
        "<td><i class='fa entypo-info-circled'></i> 管理员意见（短信提醒内容）：</td>"+
        "<td class='subject'><textarea style='width:100%;border-color: #C7D5E0' id='reason' rows='3'></textarea></td>"+
        "</tr>"+
        "<tr>"+
        "<td><i class='fa entypo-attach'></i> 是否通过：</td>"+
        "<td class='subject'>" +
        "<button type='button' title='通过' class='btn btn-rounded' onclick='teacher_granted()'><i class='icon icon-checkmark'></i> 通过</button>&nbsp;&nbsp;&nbsp;&nbsp;" +
        "<button type='button' title='不通过' class='btn btn-rounded' onclick='teacher_rejected()'><i class='icon icon-cross'></i> 不通过</button>" +
        "</td>"+
        "</tr>"+
        "</tbody>"+
        "<table>";
    dialog = $.dialog({
        icon: "icon icon-document",
        title: '教师详情',
        content: html
    });
    $('#tag').tagsInput({
        width: 'auto',
        defaultText: '添加资质'
    });
    for(var j=0;j<this.senior_pre_grades.length;j++){
        for(var k=0;k<this.senior_pre_grades[j].subjects.length;k++){
            $("input:checkbox[name='"+ this.senior_pre_grades[j].grade +"'][value='"+ this.senior_pre_grades[j].subjects[k].subject +"']").prop('checked',true);
        }
    }
}

//验证通过
function teacher_granted(){
    var grades = new Array(),subjects = new Array(),gradeQ = ['小学','初中','高中'];
    for(var i=0;i<gradeQ.length;i++){
        subjects = new Array();
        $("input:checkbox[name='"+ gradeQ[i] +"']").each(function(index,element){
            if($(element).prop("checked")){
                subjects.push({
                    subject: $(element).val()
                });
            }
        });
        if(subjects.length>0){
            var option = {
                grade: gradeQ[i],
                subjects: subjects
            }
            if(vm.detail_senior_grades().length<=0){
                vm.detail_senior_grades().push(option);
            }else{
                var sign = 0;
                for(var j=0;j<vm.detail_senior_grades().length;j++){
                    if(vm.detail_senior_grades()[j].grade == gradeQ[i]){
                        vm.detail_senior_grades()[j].subjects = subjects.concat(vm.detail_senior_grades()[j].subjects);
                        sign = 1;
                    }
                }
                if(sign == 0){
                    vm.detail_senior_grades().push(option);
                }
            }
        }
    }
    var temp = grades.concat(vm.detail_senior_grades());
    if($("#sendMessage").get(0).checked){
        sendMessage("teacher_pass","");
    }
    var t_id = vm.detail_t_id();
    if(!t_id){
        return;
    }
    var postObj = {
        userID: util.getSessionStorage("userID"),
        authSign: util.getSessionStorage("authSign"),
        t_id: t_id,
        senior_type: "verified",
        senior_grades: JSON.stringify(temp),
        senior_pre_grades: JSON.stringify([]),
        admin_reason: $("#reason").val(),
        honors: $("input[id^='tag']").val()
    };
    util.callServerFunction("adminModifyTeacher", postObj, function(data){
        if(data.statusCode == 900){
            util.toast("操作成功！","success","系统提示");
            dialog.close();
            loadTeacherList();
        }else{
            errorCodeApi(data.statusCode);
        }
    });
}

//验证不通过
function teacher_rejected() {
    if($("#reason").val()==""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请填写管理员意见（短信提醒内容）！"
        })
    }else{
        if($("#sendMessage").get(0).checked) {
            sendMessage("teacher_reject", $("#reason").val());
        }
        var postObj = {
            userID: util.getSessionStorage("userID"),
            authSign: util.getSessionStorage("authSign"),
            t_id: vm.detail_t_id(),
            senior_type: "fail",
            senior_pre_grades: JSON.stringify([]),
            admin_reason: $("#reason").val(),
        };
        util.callServerFunction("adminModifyTeacher", postObj, function (data) {
            if(data.statusCode == 900){
                util.toast("操作成功！","success","系统提示");
                dialog.close();
                loadTeacherList();
            }else{
                errorCodeApi(data.statusCode);
            }
        });
    }
}

function checkPhone(){
    if(vm.detail_phone() == ""){
        $.alert({
            title: "系统提示",
            content: "用户<span class='label label-info'>"+ vm.detail_name() +"</span>未填写手机号码，暂时无法发送短信",
            confirmButton: "我知道了"
        });
        $("#sendMessage").prop("checked",false);
    }
}

//显示原图
function showSrcImg(src){
    $.dialog({
        icon: "icon icon-document-edit",
        title: '原图',
        content: "<div align='center'><button class='btn btn-success' onclick=\"util.rotateImg('testImg', 'left')\"><span class='entypo-ccw'></span>&nbsp;&nbsp;左转</button>&nbsp;&nbsp;"+
        "<button class='btn btn-success' onclick=\"util.rotateImg('testImg', 'right')\">右转&nbsp;&nbsp;<span class='entypo-cw'></span></button></div>" +
        "<br><img style='width:100%;max-width:100%;height:auto' src='"+src+"' id='testImg'>",
        columnClass: 'col-lg-12 col-md-6 col-sm-3 col-xs-2'
    });
}

//发送提醒短信
function sendMessage(template,reason){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.phonenum = vm.detail_phone();
    postObj.template = template;
    postObj.result = reason;
    util.callServerFunction('adminSendSMS', postObj, function (data) {
        if (data.statusCode == 900) {
        } else {
            errorCodeApi(data.statusCode);
        }
    });
}

function changeSort(){
    if(vm.sort()=="desc"){
        vm.sort("asc");
    }else{
        vm.sort("desc");
    }
    subLoadTeacherList();
}

function initEditTeacher(){
    var id_pic = "",certificate_pic = "",gradesTemp = new Array();
    if(this.id_pic != ""){
        id_pic = util.changeUrl(this.id_pic);
    }
    if(this.certificate_pic != ""){
        certificate_pic = util.changeUrl(this.certificate_pic);
    }
    for(var i=0;i<this.grades.length;i++){
        gradesTemp.push(this.grades[i]);
    }
    vm.grades(gradesTemp);
    vm.idTemp("");
    vm.certificateTemp("");
    vm.oldIdSrc(this.id_pic);
    vm.oldcertificateSrc(this.certificate_pic);
    var html = "<div id='editGrade'><input type='hidden' class='form-control' id='t_id' value='"+ this.t_id +"'><div class='form-group'>"+
        "<label>姓名：</label><input type='text' class='form-control' id='name' value='"+ this.t_name +"'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>答疑学科：</label>" +
        "<button type='button' class='btn btn-primary' data-bind='click: initAddGrade'><span class='entypo-plus'></span>&nbsp;&nbsp;添加年级学科</button>" +
        "<div data-bind='foreach: grades'>" +
        "<div class='btn-group' style='margin-right: 5px;margin-top: 10px'>"+
        "<button type='button' class='btn btn-info' data-bind='click:initEditGrade'><span class='entypo-book' title='年级'></span>&nbsp;&nbsp;<span data-bind='text: grade'></span></button>"+
        "<button type='button' class='btn btn-warning' data-bind='click:deleteGrade'><span class='entypo-trash' title='删除年级'></span></button>"+
        "</div>"+
        "</div>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>教师认证自述：</label><input type='text' class='form-control' id='verify_desc' value='"+ this.verify_desc +"'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>认证状态：</label>" +
        "<select id='verify_type' class='form-control valid'>"+
        "<option value=''>-请选择-</option>"+
        "<option value='notVerified'>初始状态</option>"+
        "<option value='verified'>验证通过</option>"+
        "<option value='fail'>验证失败</option>"+
        "<option value='waitingVerify'>等待验证</option>"+
        "</select>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>身份证：</label>" +
        "<input type='file' id='id_pic' style='display: none'/>"+
        "<button type='button' class='btn btn-rounded' onclick='selectIdImg()'><span class='entypo-export'></span>&nbsp;&nbsp;选择身份证照片</button>&nbsp;&nbsp;"+
        "<img id='idTemp' style='width: 100%;height: auto;margin-top: 5px' src='"+ id_pic +"' alt='未上传'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>资格证：</label>" +
        "<input type='file' id='certificate_pic' style='display: none'/>"+
        "<button type='button' class='btn btn-rounded' onclick='selectCertificateImg()'><span class='entypo-export'></span>&nbsp;&nbsp;选择资格证照片</button>&nbsp;&nbsp;"+
        "<img id='certificateTemp' style='width: 100%;height: auto;margin-top: 5px' src='"+ certificate_pic +"' alt='未上传'>"+
        "</div>"+
        "<button class='btn btn-primary' onclick='uploadTeacherInfo()'>提交修改</button></div>";
    parentDialog = $.dialog({
        icon: "icon icon-document-edit",
        title: '修改教师信息',
        content: html
    });
    $("#id_pic").change(function() {
        var file = this.files[0];
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            // 通过 reader.result 来访问生成的 DataURL
            var url = reader.result;
            vm.idTemp(url);
            $("#idTemp").attr('src',url);
        };
    });
    $("#certificate_pic").change(function() {
        var file = this.files[0];
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            // 通过 reader.result 来访问生成的 DataURL
            var url = reader.result;
            vm.certificateTemp(url);
            $("#certificateTemp").attr('src',url);
        };
    });
    $("#verify_type").val(this.verify_type);
    ko.applyBindings(vm,document.getElementById("editGrade"));
}

function selectIdImg(){
    $("#id_pic").click();
}

function selectCertificateImg(){
    $("#certificate_pic").click();
}

function uploadTeacherInfo(){
    if($("#name").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请填写教师姓名！"
        })
    }else if($("#verify_desc").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请填写教师认证自述！"
        })
    }else if($("#verify_type").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择认证状态！"
        })
    }else if($("#idTemp").attr("src") == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请上传身份证照片！"
        })
    }else if($("#certificateTemp").attr("src") == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请上传资格证照片！"
        })
    }else{
        if (vm.idTemp() != "") {
            var dataurl = vm.idTemp();
            var blob = util.dataURLtoBlob(dataurl);
            var fd = new FormData();
            fd.append("upload", blob, "image.png");
            xhr.open('POST', '/upload', true);
            xhr.onreadystatechange = uploadId;
            xhr.send(fd);
        } else {
            uploadId();
        }
    }
}

function uploadId(){
    if (vm.idTemp() != "") {
        if (xhr.readyState == 4 && xhr.status === 200) {//readyState表示文档加载进度,4表示完毕
            vm.oldIdSrc(JSON.parse(xhr.response).filePath);
            if (vm.certificateTemp() != "") {
                var dataurl = vm.certificateTemp();
                var blob = util.dataURLtoBlob(dataurl);
                var fd = new FormData();
                fd.append("upload", blob, "image.png");
                xhr.open('POST', '/upload', true);
                xhr.onreadystatechange = uploadCertificate;
                xhr.send(fd);
            } else {
                uploadCertificate();
            }
        }
    }else{
        if (vm.certificateTemp() != "") {
            var dataurl = vm.certificateTemp();
            var blob = util.dataURLtoBlob(dataurl);
            var fd = new FormData();
            fd.append("upload", blob, "image.png");
            xhr.open('POST', '/upload', true);
            xhr.onreadystatechange = uploadCertificate;
            xhr.send(fd);
        } else {
            uploadCertificate();
        }
    }
}

function uploadCertificate(){
    if (vm.certificateTemp() != "") {
        if (xhr.readyState == 4 && xhr.status === 200) {//readyState表示文档加载进度,4表示完毕
            vm.oldcertificateSrc(JSON.parse(xhr.response).filePath);
            var postObj = {
                t_id: $("#t_id").val(),
                userID: util.getSessionStorage('userID'),
                authSign: util.getSessionStorage('authSign'),
                id_pic: vm.oldIdSrc(),
                certificate_pic: vm.oldcertificateSrc(),
                verify_desc: $("#verify_desc").val(),
                verify_type: $("#verify_type").val(),
                name: $("#name").val(),
                grades: JSON.stringify(vm.grades())
            };
            util.callServerFunction('adminModifyTeacher', postObj, function (resp) {
                if (resp.statusCode == 900) {
                    util.toast("修改成功", "success", "系统提示");
                    parentDialog.close();
                    loadTeacherList();
                } else {
                    errorCodeApi(resp.statusCode);
                }
            });
        }
    }else{
        var postObj = {
            t_id: $("#t_id").val(),
            userID: util.getSessionStorage('userID'),
            authSign: util.getSessionStorage('authSign'),
            id_pic: vm.oldIdSrc(),
            certificate_pic: vm.oldcertificateSrc(),
            verify_desc: $("#verify_desc").val(),
            verify_type: $("#verify_type").val(),
            name: $("#name").val(),
            grades: JSON.stringify(vm.grades())
        };
        util.callServerFunction('adminModifyTeacher', postObj, function (resp) {
            if (resp.statusCode == 900) {
                util.toast("修改成功", "success", "系统提示");
                parentDialog.close();
                loadTeacherList();
            } else {
                errorCodeApi(resp.statusCode);
            }
        });
    }
}

function initAddGrade(){
    var html = "<div class='form-group'>"+
        "<label>年级：</label>" +
        "<select id='grade' class='form-control valid'>"+
        "<option value=''>-请选择-</option>"+
        "<option value='小学'>小学</option>"+
        "<option value='初中'>初中</option>"+
        "<option value='高中'>高中</option>"+
        "</select>"+
        "</div>"+
        "<div class='form-group'>" +
        "<label class='checkbox-inline'><input type='checkbox' name='subject' value='数学'><span class='label'>数学</span></label>"+
        "<label class='checkbox-inline'><input type='checkbox' name='subject' value='语文'><span class='label'>语文</span></label>"+
        "<label class='checkbox-inline'><input type='checkbox' name='subject' value='英语'><span class='label'>英语</span></label>"+
        "<label class='checkbox-inline'><input type='checkbox' name='subject' value='物理'><span class='label'>物理</span></label>"+
        "<label class='checkbox-inline'><input type='checkbox' name='subject' value='化学'><span class='label'>化学</span></label>"+
        "</div>"+
        "<button class='btn btn-primary' onclick=\"subGrade('add',0)\">提 交</button><div>";
    dialog = $.dialog({
        icon: "icon icon-plus",
        title: '添加答疑年级学科',
        content: html
    });
}

function initEditGrade(){
    var html = "<div class='form-group'>"+
        "<label>年级：</label>" +
        "<select id='grade' class='form-control valid'>"+
        "<option value=''>-请选择-</option>"+
        "<option value='小学'>小学</option>"+
        "<option value='初中'>初中</option>"+
        "<option value='高中'>高中</option>"+
        "</select>"+
        "</div>"+
        "<div class='form-group'>" +
        "<label class='checkbox-inline'><input type='checkbox' name='subject' value='数学'><span class='label'>数学</span></label>"+
        "<label class='checkbox-inline'><input type='checkbox' name='subject' value='语文'><span class='label'>语文</span></label>"+
        "<label class='checkbox-inline'><input type='checkbox' name='subject' value='英语'><span class='label'>英语</span></label>"+
        "<label class='checkbox-inline'><input type='checkbox' name='subject' value='物理'><span class='label'>物理</span></label>"+
        "<label class='checkbox-inline'><input type='checkbox' name='subject' value='化学'><span class='label'>化学</span></label>"+
        "</div>"+
        "<button class='btn btn-primary' onclick=\"subGrade('edit',"+ vm.grades.indexOf(this) +")\">提 交</button><div>";
    dialog = $.dialog({
        icon: "icon icon-document-edit",
        title: '修改答疑年级学科',
        content: html
    });
    $("#grade").val(this.grade);
    $.each(this.subjects,function(index,value){
        $("input:checkbox[value='"+ value.subject +"']").prop("checked",true);
    });
}

function deleteGrade(){
    var index = vm.grades.indexOf(this);
    dialog = $.confirm({
        icon: 'fontawesome-warning-sign',
        title: '删除选项',
        content: "确定要删除此年级学科吗！",
        confirmButton: "<span class='fontawesome-ok'></span>&nbsp;&nbsp;确定",
        cancelButton: "<span class='fontawesome-remove'></span>&nbsp;&nbsp;取消",
        confirm: function(){
            vm.grades.splice(index,1);
            util.toast("删除年级学科成功！","success","提示信息");
        }
    });
}

function subGrade(sign,index){
    if($("#grade").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择年级！"
        })
    }else if(checkSelectSubject()){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择学科！"
        })
    }else{
        var subjects = new Array();
        $("input:checkbox[name='subject']").each(function(index,element){
            if($(element).prop("checked")){
                subjects.push({
                    subject: $(element).val()
                });
            }
        });
        var option = {
            grade: $("#grade").val(),
            subjects: subjects
        }
        if(sign == "add"){
            vm.grades.push(option);
        }else if(sign == "edit"){
            vm.grades.splice(index,1,option);
        }
        dialog.close();
    }
}

function checkSelectSubject(){
    var temp = true;
    $("input:checkbox[name='subject']").each(function(index,element){
        if($(element).prop("checked")){
            temp = false;
        }
    });
    return temp;
}

function editGradesQ(){
    var grades = new Array(),subjects = new Array(),gradeQ = ['小学','初中','高中'];
    for(var i=0;i<gradeQ.length;i++){
        subjects = new Array();
        $("input:checkbox[name='"+ gradeQ[i] +"']").each(function(index,element){
            if($(element).prop("checked")){
                subjects.push({
                    subject: $(element).val()
                });
            }
        });
        if(subjects.length>0){
            var option = {
                grade: gradeQ[i],
                subjects: subjects
            }
            grades.push(option);
        }
    }
    var postObj = {
        t_id: vm.detail_t_id(),
        userID: util.getSessionStorage('userID'),
        authSign: util.getSessionStorage('authSign'),
        grades: JSON.stringify(grades)
    };
    util.callServerFunction('adminModifyTeacher', postObj, function (resp) {
        if (resp.statusCode == 900) {
        } else {
            errorCodeApi(resp.statusCode);
        }
    });
}

//显示原图
function showSrcImg(src){
    $.dialog({
        icon: "icon icon-document-edit",
        title: '原图',
        content: "<div align='center'><button class='btn btn-success' onclick=\"util.rotateImg('testImg', 'left')\"><span class='entypo-ccw'></span>&nbsp;&nbsp;左转</button>&nbsp;&nbsp;"+
        "<button class='btn btn-success' onclick=\"util.rotateImg('testImg', 'right')\">右转&nbsp;&nbsp;<span class='entypo-cw'></span></button></div>" +
        "<br><img style='width:100%;max-width:100%;height:auto' src='"+src+"' id='testImg'>",
        columnClass: 'col-lg-12 col-md-6 col-sm-3 col-xs-2'
    });
}

var viewModel = function () {
    this.teacherToVerify = ko.observableArray();
    //teacher detail
    this.detail_t_id = ko.observable("");
    this.detail_name = ko.observable("");
    this.detail_phone = ko.observable("");
    this.detail_gender = ko.observable("");
    this.detail_id_no = ko.observable("");
    //this.detail_school = ko.observable("");
    this.detail_id_pic = ko.observable("");
    this.detail_certificate_pic = ko.observable("");
    this.detail_verify_desc = ko.observable("");
    this.detail_admin_reason = ko.observable("");
    this.detail_senior_grades = ko.observableArray();
    //教师详情页绑定点击事件
    this.teacher_granted = teacher_granted;
    this.teacher_rejected = teacher_rejected;
    this.showDetail = showDetail;
    this.initEditTeacher = initEditTeacher;
    this.startPosAllTeacherManager = ko.observable(1);
    this.pageSizeAllTeacherManager = ko.observable(15);
    this.sort = ko.observable("desc");
    //编辑教师信息
    this.idTemp = ko.observable("");
    this.certificateTemp = ko.observable("");
    this.oldIdSrc = ko.observable("");
    this.oldcertificateSrc = ko.observable("");
    this.uploadTeacherInfo = uploadTeacherInfo;
    //编辑年级学科
    this.grades = ko.observableArray();
    this.gradesNew = ko.observableArray();
    this.initAddGrade = initAddGrade;
    this.initEditGrade = initEditGrade;
    this.deleteGrade = deleteGrade;
};
var vm = new viewModel();
var date = new Date();
var dialog = "";
var xhr = new XMLHttpRequest();
$(document).ready(function(){
    ko.applyBindings(vm,document.getElementById("collectTeacherManagerTable"));
    util.initDateTimePicker("startTime",{defaultDate: new Date(date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + ' 00:00:00')});
    util.initDateTimePicker("endTime",{defaultDate: new Date(date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + ' 23:59:59')});
    $('.selectpicker').selectpicker({
        style: 'btn btn-info'
    });
    $('.btn-group').css("width","100%");
    document.onkeydown=function(event){
        e = event ? event :(window.event ? window.event : null);
        if(e.keyCode==13){
            subLoadTeacherList();
            return false;
        }
    }
    loadTeacherList();
});