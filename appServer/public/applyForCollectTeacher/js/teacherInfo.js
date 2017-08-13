/**
 * Created by hjy on 2016/3/29 0029.
 */

function getTeacherInfo(){
    var postObj = {};
    postObj.userID = userID;
    postObj.authSign = authSign;
    util.callServerFunction('getUserInfo&random='+parseInt(Math.random()*10000), postObj, function(data) {
        if (data.statusCode == 900) {
            vm.tYear(data.info.teacher_info.senior_info.teach_years);
            vm.tProvince(data.info.address.province);
            vm.tCity(data.info.address.city);
            vm.tSchool(data.info.school);
            vm.tTypical(data.info.teacher_info.senior_info.teach_feature);
            for(var i=0;i<data.info.teacher_info.senior_info.honor_pics.length;i++) {
                vm.tQuality.push({
                    src: data.info.teacher_info.senior_info.honor_pics[i],
                    srcS: data.info.teacher_info.senior_info.honor_pics[i].replace(/(oss.soulkey99.com)/,"callcall-server.img-cn-beijing.aliyuncs.com"),
                    status: "success"
                });
            }
        }
    });
}

function changeBgColor(obj){
    $(".selectY").each(function(){
        $(this).css("backgroundColor","#89b6d3");
    });
    $(obj).css("backgroundColor","#449de2");
    vm.tYear($(obj).find("input").val());
}

function changeBtn(obj,sign){
    if(sign == "in"){
        $(obj).css("backgroundColor","#3d8dcb");
    }else if(sign == "out"){
        $(obj).css("backgroundColor","#449de2");
    }
}

function addImgPhotos(){
    hideAddImg();
    if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) {//安卓手机
        javascript:callcall.jsCallback('setPhotos', {});
    } else if (u.indexOf('iPhone') > -1) {//苹果手机
        window.location = "/setPhotos";
    }
}

function addImgAlbums(){
    hideAddImg();
    if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) {//安卓手机
        javascript:callcall.jsCallback('setAlbums', {});
    } else if (u.indexOf('iPhone') > -1) {//苹果手机
        window.location = "/setAlbums";
    }
}

function showAddImg(){
    $(".addImgBg").removeClass("animated fadeOut");
    $(".addImgBg").css("visibility","visible");
    $(".addImgBg").addClass("animated fadeIn");
    $(".addImgDiv").removeClass("animated fadeOut");
    $(".addImgDiv").css("visibility","visible");
    $(".addImgDiv").addClass("animated fadeIn");
}

function hideAddImg(){
    $(".addImgBg").addClass("animated fadeOut");
    $(".addImgDiv").addClass("animated fadeOut");
    $(".addImgBg").css("visibility","hidden");
    $(".addImgDiv").css("visibility","hidden");
}

function addImgUrlLoading(){
    vm.tQuality.push({src: "images/loading.gif", srcS: "", status: "loading"});
}

function addImgUrl(imgUrl){
    var temp = vm.tQuality();
    for(var i=0;i<temp.length;i++){
        if(temp[i].status == "loading"){
            if(imgUrl!=""){
                var option = {
                    src: imgUrl,
                    srcS: imgUrl.replace(/(oss.soulkey99.com)/,"callcall-server.img-cn-beijing.aliyuncs.com"),
                    status: "success"
                };
                temp.splice(i,1,option);
                vm.tQuality(temp);
            }else{
                temp.shift(temp[i]);
                vm.tQuality(temp);
            }
            break;
        }
    }
}

function deleteImg(){
    vm.tQuality.remove(this);
}

function formateSubjects(){
    var senior_pre_grades = new Array()
        ,xSubjects = new Array()
        ,cSubjects = new Array()
        ,gSubjects = new Array();
    for(var g=0;g<subjects.length;g++){
        if(subjects[g].indexOf("小学")>=0){
            xSubjects.push({subject: subjects[g].replace("小学","")});
        }else if(subjects[g].indexOf("初中")>=0){
            cSubjects.push({subject: subjects[g].replace("初中","")});
        }else if(subjects[g].indexOf("高中")>=0){
            gSubjects.push({subject: subjects[g].replace("高中","")});
        }
    }
    if(xSubjects.length>0){
        var option = {
            grade: "小学",
            subjects: xSubjects
        }
        senior_pre_grades.push(option);
    }
    if(cSubjects.length>0){
        var option = {
            grade: "初中",
            subjects: cSubjects
        }
        senior_pre_grades.push(option);
    }
    if(gSubjects.length>0){
        var option = {
            grade: "高中",
            subjects: gSubjects
        }
        senior_pre_grades.push(option);
    }
    vm.subjects(JSON.stringify(senior_pre_grades));
}

function subTeacherInfo(){
    var postObj = {};
    postObj.userID = userID;
    postObj.authSign = authSign;
    postObj.province = vm.tProvince();
    postObj.city = vm.tCity();
    postObj.school = vm.tSchool();
    postObj.teach_feature = vm.tTypical();
    postObj.teach_years = vm.tYear();
    var honor_pics = new Array();
    for(var i=0;i<vm.tQuality().length;i++){
        honor_pics.push(vm.tQuality()[i].src);
    }
    postObj.honor_pics = honor_pics.join(",");
    postObj.senior_pre_grades = vm.subjects();
    util.callServerFunction('changeSeniorInfo&random='+parseInt(Math.random()*10000), postObj, function(data) {
        if (data.statusCode == 900) {
            if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) {//安卓手机
                javascript:callcall.jsCallback('subTeacherInfoSuccess', {});
            }else if(u.indexOf('iPhone') > -1) {//苹果手机
                window.location = "/subTeacherInfoSuccess";
            }
        }else {
            alert(data.message);
        }
    });
}

function showEx(sign){
    if(sign==1){
        vm.tTypical("");
        $("#tTypical").attr("placeholder","教学过程深入浅出，条理清楚，层层剖析，环环相扣，论证严密。精于多种教学技巧，用思维的逻辑力量吸引学生的注意力，用理智控制整个教学过程。");
    }else if(sign==2){
        vm.tTypical("");
        $("#tTypical").attr("placeholder","教学过程亲切自然、朴素无华。与学生在平等、协作、和谐的气氛下，进行双向互动交流，将学生对知识的渴求和探索融于简朴、真实的情景之中。");
    }else if(sign==3){
        vm.tTypical("");
        $("#tTypical").attr("placeholder","教学过程情绪饱满，生动形象，机智诙谐。恰如其分的幽默，让学生在心情舒畅与快乐中获得知识与人生的启迪，促使学生心领神会，主动思考。");
    }
}

var viewModel = function() {
    this.rechargeValue = ko.observable("");
    this.subjects = ko.observable("");
    this.tYear = ko.observable("");
    this.tProvince = ko.observable("");
    this.tCity = ko.observable("");
    this.tSchool = ko.observable("");
    this.tQuality = ko.observableArray();
    this.tTypical = ko.observable("");
    this.deleteImg = deleteImg;
};
var vm = new viewModel()
var u = navigator.userAgent;
var userID = util.getSessionStorage("userID");
var authSign = util.getSessionStorage("authSign");
var subjects = util.getSessionStorage("subjects").split(",");
$(document).ready(function(){
    FastClick.attach(document.body);
    ko.applyBindings(vm);
    getTeacherInfo();
    formateSubjects();
    $(".footer").css("height",$(window).height()*0.09 + "px");
    $(".footer").css("lineHeight",$(window).height()*0.09 + "px");
    $(".addImgBg").css("height",$(window).height() + "px");
    $("body").css("visibility","visible");
    $("body").addClass("animated fadeIn");
    setTimeout(function(){
        $("body").removeClass("animated fadeIn");
    },1000);
});