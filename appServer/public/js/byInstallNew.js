/**
 * Created by hjy on 2015/11/25 0025.
 */

String.prototype.Trim = function() {
    var m = this.match(/^\s*(\S+(\s+\S+)*)\s*$/);
    return (m == null) ? "" : m[1];
};
String.prototype.isMobile = function() {
    return (/^(13[0-9]|14[0-9]|15[0-9]|17[0-9]|18[0-9])\d{8}$/.test(this.Trim()));
};

function changeImg(sign){
    vm.appType(sign);
    if(sign == "0"){
        $("title").text("Call Call教师－学生端");
        $(".hDiv").animate({left:"0px"});

        $(".logo").attr("src","img/sLogo.png");
        $(".logo").addClass("animated tada");
    }else{
        $("title").text("Call Call教师－教师端");
        $(".hDiv").animate({left:"6.2rem"});

        $(".logo").attr("src","img/tLogo.png");
        $(".logo").addClass("animated tada");
    }
    setTimeout(function(){
        $(".logo").removeClass("animated tada");
    },1000);
}

function querystring(key) {
    var re=new RegExp('(?:\\?|&)'+key+'=(.*?)(?=&|$)','gi');
    var r=[], m;
    while ((m=re.exec(document.location.search)) != null) r.push(m[1]);
    return r;
}

function is_ios(){
    var ua = navigator.userAgent.toLowerCase();
    return (ua.match(/iPhone/i) == "iphone");
}

function actionClick() {
    if(vm.config() == 'school'){
        sendLog("扫描二维码并点击跳转到下载APP页面（学校专用）", {访问系统: phoneSystem});
    }else{
        sendLog("扫描二维码并点击跳转到下载APP页面（普通）", {访问系统: phoneSystem});
    }
    var phoneNum = $("#phoneNum").val();
    if(!(phoneNum.isMobile())){
        $('#msg').show();
        $("#phoneNum").val("");
    }else{
        var option = {
            phonenum: $("#phoneNum").val(),
            shareCode: vm.shareCode(),
            from: vm.appType(),
            role: vm.role(),
            platform: is_ios() ? 'ios' : 'android'
        };
        if(vm.config() == "school"){
            option.school = $("#schoolName").text();
            option.grade = $("#gradeName").text();
            option.class = $("#className").text();
        }
        $.ajax({
            method: "POST",
            url: "/api?m=invite",
            data: option
        }).done(function (msg) {
            if(vm.appType() === "1"){
                //教师端
                if (is_ios()) {
                    window.location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.soulkey.callcallTeacher';
                } else {
                    window.location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.soulkey.callcallTeacher';
                }
            }else{
                //学生端
                if (is_ios()) {
                    window.location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.soulkey.callcall';
                } else {
                    window.location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.soulkey.callcall';
                }
            }
        })
    }
}

function selectSchool(sign){
    $("#sSchool").css("display","none");
    $("#sGrade").css("display","none");
    $("#sClass").css("display","none");
    $(".school").css("borderColor","#a5a5a5");
    $(".gradeDiv").css("borderColor","#a5a5a5");
    $(".classDiv").css("borderColor","#a5a5a5");
    if(sign == "sSchool"){
        $(".school").css("borderColor","white");
    }else if(sign == "sGrade"){
        $(".gradeDiv").css("borderColor","white");
    }else if(sign == "sClass"){
        $(".classDiv").css("borderColor","white");
    }
    $("#"+sign).css("display","");
}

function clickOption(obj,id){
    var m = 6, gradeHtml = "";
    $("#"+id).text($(obj).text());
    if(id == "schoolName"){
        if($.inArray($(obj).text(), xSchool)>=0){
            m = 6;
        }else if($.inArray($(obj).text(), cSchool)>=0){
            m = 4;
        }else if($.inArray($(obj).text(), gSchool)>=0){
            m = 3;
        }
        for(var n=0;n<m;n++){
            gradeHtml += "<div class='gradeOption' onclick=\"clickOption(this,'gradeName')\">"+ numText[n] +"年级</div>";
        }
        $("#sGrade").empty();
        $("#sGrade").append(gradeHtml);
        $(".schoolOption").each(function(){
            $(this).css("backgroundColor","#e6e6e6");
        });
        $(".gradeDiv").click();
    }else if(id == "gradeName"){
        $(".gradeOption").each(function(){
            $(this).css("backgroundColor","#e6e6e6");
        });
        $(".classDiv").click();
    }else if(id == "className"){
        $(".classOption").each(function(){
            $(this).css("backgroundColor","#e6e6e6");
        });
    }
    $(obj).css("backgroundColor","#cfcfcf");

    if($("#schoolName").text() != "点击选择学校" && $("#gradeName").text() != "点击选择年级" && $("#className").text() != "点击选择班级"){
        $(".subBtn").css("visibility","visible");
    }else{
        $(".subBtn").css("visibility","hidden");
    }
}

function showInfo(){
    $("#bg").css("display","");
    $(".selectSchoolDiv").removeClass("hidden");
    $(".selectSchoolDiv").removeClass("animated slideOutDown");
    $(".selectSchoolDiv").addClass("animated slideInUp");
}

function subInfo(){
    $(".selectSchoolDiv").removeClass("animated slideInUp");
    $(".selectSchoolDiv").addClass("animated slideOutDown");
    setTimeout(function(){$(".selectSchoolDiv").addClass("hidden");},1500);
    $("#bg").css("display","none");
    $(".buttonLong3").text("完成并下载客户端");
    $(".buttonLong3").attr("onclick","actionClick();");
}

function setBtnIn(){
    $(".subBtn").css("backgroundColor","#3d8ccc");
}

function setBtnOut(){
    $(".subBtn").css("backgroundColor","#439de2");
}

function sendLog(event, attr) {
    // 发送自定义的统计事件
    analytics.send({
        // 事件名称
        event: event,
        // 事件属性，任意数据
        attr: attr,
        // 该事件持续时间（毫秒）
        duration: 1000
    }, function (result) {
        if (result) {
            console.log('统计数据发送成功！');
        }
    });
}

var xSchool = []
    ,cSchool = []
    ,gSchool = []
    ,numText = ["一","二","三","四","五","六","七","八","九","十","十一","十二","十三","十四","十五"]
    ,schoolHtml = ""
    ,gradeHtml = ""
    ,classHtml = "";
var analytics = AV.analytics({
    // 设置 AppId
    appId: "593tvxmvvbzlb178tszjl1l21ewztqu805768lno6ttk5r82",
    // 设置 AppKey
    appKey: "8w60idssacdpsc0kni8vwb4jgapoy8h8ze1px0ryaxcsj35l",
    // 你当前应用或者想要指定的版本号（自定义）
    version: "2016.3.17",
    // 你当前应用的渠道或者你想指定的渠道（自定义）
    channel: "访问扫描二维码下载APP页面"
});

var viewModel = function(){
    this.role = ko.observable(querystring('role')[0]);
    this.appType = ko.observable(querystring('appType')[0]||0);
    this.shareCode = ko.observable(querystring('shareCode')[0]);
    this.config = ko.observable("default");
};
var u = navigator.userAgent
    ,phoneSystem = "未识别设备";
if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) {//安卓手机
    phoneSystem = "安卓";
} else if (u.indexOf('iPhone') > -1) {//苹果手机
    phoneSystem = "苹果";
}
var vm = new viewModel();
if(vm.shareCode() == "LVfaM"){
    xSchool = ["大东区望花街第一小学","大东区前进街道中心小学","大东区望花小学","大东区望花街第三小学","沈阳大学实验学校（小学部）","大东区二台子小学","大东区东站小学","大东区东新小学","大东区辽沈街第二小学","大东区白塔小学","大东区草仓路小学"
        ,"大东区辽沈街第一小学","大东区杏坛小学教育集团","大东区上园路第一小学","大东区辽沈街第三小学","沈阳市中山私立学校（小学部）","大东区白塔小学","大东区草仓路小学","大东区辽沈街第一小学","大东区杏坛小学教育集团","沈阳市尚品学校（小学部）"
        ,"静美教育集团","大东区珠林路第一小学","大东区大东路第二小学","大东区大东路第三小学","大东区第四小学","大东区和睦路小学","大东区二零五小学","大东区202小学","大东区善邻路第二小学","沈阳市第九十六中学（小学部）"];
    cSchool = ["沈阳大学实验学校（初中部）","沈阳市第一百三十九中学","沈阳市第九十六中学","沈阳市第五十中学","沈阳市第一百一十一中学","沈阳市中山私立学校（初中部）","沈阳市兴东中学","沈阳市博才初级中学","沈阳实验中学","沈阳市尚品学校（初中部）","沈阳市第一零七中学"
        ,"沈阳市振东中学","沈阳市沈东初级中学","沈阳第一百三十六中学"];
    gSchool = ["沈阳市第二十八中学","沈阳市中山私立学校（高中部）","沈阳市第二十六中学","沈阳市第五中学","沈阳市尚品学校（高中部）","沈阳市第三十五中学","沈阳市第一中学","沈阳市第一私立高中"];
}else if(vm.shareCode() == "uM2Mw"){
    xSchool = ["皇姑区弘文小学","沈阳市皇姑区鸭绿江街小学","皇姑区明华小学","金山路小学","沈阳市皇姑区白龙江小学","沈阳市皇姑区雷锋小学","沈阳市皇姑区汾河街小学","沈阳市皇姑区童晖小学","皇姑区三台子第五小学","沈阳市皇姑区珠江五校实验小学"
              ,"沈阳市皇姑区三台子第一小学","沈阳市皇姑区和信朝鲜族小学","沈阳市皇姑区塔湾小学","沈阳市皇姑区明廉路小学","沈阳市皇姑区步云山路小学","皇姑区泰山路小学","沈阳市皇姑区宁山路小学","沈阳市皇姑区陵西小学","沈阳市皇姑区黄河大街小学"
              ,"沈阳市皇姑区淮河街小学校","沈阳市皇姑区新北小学","沈阳市皇姑区向工街第二小学","岐山一校实验小学","沈阳市皇姑区岐山路第二小学","沈阳市皇姑区岐山路第一小学","皇姑区珠江五校","沈阳市皇姑区昆山西路第四小学","皇姑区昆山西路第三小学"
              ,"沈阳市皇姑区昆山西路第二小学","沈阳市皇姑区天山路第一小学","皇姑区和信朝鲜小学","皇姑区明华小学","皇姑区金山路小学","皇姑区万方小学","皇姑区柳条湖小学","皇姑区弘文小学","皇姑区鸭绿江小学","皇姑区三台子第四小学","皇姑区渭河小学"
              ,"皇姑区塔湾小学","皇姑区汾河小学","皇姑区怒江街小学","皇姑区步云山路小学","皇姑区淮河街小学","皇姑区珠江街第五小学","皇姑区陵西小学","皇姑区三台子第五小学","皇姑区三台子第三小学","皇姑区三台子一小","皇姑区明廉路小学","皇姑区向工街第三小学"
              ,"皇姑区向工街第二小学","皇姑区向工街第一小学","皇姑区天山路第一小学","皇姑区昆山路第二小学","皇姑区珠江街第三小学","皇姑区昆山路第四小学","皇姑区昆山路第三小学","皇姑区黄河大街小学","皇姑区泰山路小学","皇姑区岐山路第三小学"
              ,"皇姑区岐山路第二小学","皇姑区岐山路第一小学","皇姑区白龙江小学","皇姑区新北小学","皇姑区北陵大街小学","皇姑区童晖小学","皇姑区宁山路小学"];
    cSchool = ["沈阳市虹桥初级中学","沈阳飞跃实验中学（初中部）","沈阳市第一四七中学","沈阳市第一二二中学","沈阳市第一二〇中学","沈阳市第一一〇中学","沈阳市第九十七中学","沈阳市第八十五中学","沈阳市第四十四中学","沈阳市第四十三中学"
              ,"沈阳市第四十中学","沈阳市第二十四中学","沈阳市第二十一中学","沈阳市第十二中学","沈阳市第十一中学","沈阳市第十中学","沈阳市第一四七中学","沈阳市私立实验学校","沈阳市第一一六中学","沈阳市第一二二中学","沈阳市虹桥中学"
              ,"沈阳市光明中学","沈阳市第八十四中学","沈阳市第八十五中学","沈阳市第九十七中学","沈阳市第一一0中学","沈阳市第三十三中学","沈阳市第一五三中学","沈阳市第一三二中学","沈阳市第四十三中学","沈阳市第十二中学","沈阳市第四十四中学"];
    gSchool = ["沈阳飞跃实验中学（高中部）","辽宁省实验中学分校（高中部）","沈阳市新世际中学","沈阳师范大学附属学校","辽宁省实验中学","沈阳市新北方高中","沈阳市拨萃中学","沈阳市第十六中学","沈阳市第二十四中学","沈阳市第二十一中学"
              ,"沈阳市第十中学","沈阳市第四十中学","沈阳市第一百二十中学","沈阳市第十一中学","辽宁省实验学校（高中部）"];
}else if(vm.shareCode() == "nrkQ3"){
    xSchool = ["沈阳市沈河区中山路小学","沈河区育鹏小学","沈阳市沈河区文化路第二小学","沈阳市沈河区朝阳街第一小学","沈阳市岸英小学","沈阳市沈河区泉园小学","沈阳市沈河区泉园第二小学","沈阳市沈河区方凌小学","沈阳市沈河区大南街第一小学","沈阳市沈河区长青小学","沈阳市沈河区北一经街小学","沈阳农业大学附属中小学"
              ,"沈河区热闹路第二小学","沈河区泉园第二小学","沈河区文化路第二小学","沈河区高官台小学","沈河区喜良小学","沈河区马官桥小学","沈河区东陵小学","沈河区长青小学","沈河区六一学校","沈河区方凌小学","沈河区南塔街小学","沈河区泉园小学","沈河区文萃小学","沈河区万莲小学","沈河区莲花街小学"
              ,"沈河区朝阳街第一小学","沈河区北一经街小学","沈河区文艺路第一小学","沈河区文化路小学","沈河区中山路小学","沈河区教师进修学校附属学校","沈河区小西路第一小学","沈河区大南街第三小学","沈河区二经街第二小学","沈河区大南街第二小学","沈河区大南街第一小学","沈河区文艺路第二小学","沈河区一经街第二小学"];
    cSchool = ["沈阳市第一四五中学","沈阳市第一六五中学","沈阳市回族初级中学","沈阳市第一四九中学","沈阳市第一四三中学","沈阳市第七中学八十二中学校区","沈阳市东部雨田实验学校","沈阳市奉天学校","沈阳农业大学附属中学","沈阳市第八中学","沈阳市满族中学","沈阳市实验学校","沈阳市育源中学","沈阳市第七中学"
              ,"沈阳市第九十中学","沈阳市第八十二中学","沈阳市第七中学东部校区"];
    gSchool = ["沈阳市同泽女子中学","沈阳市同泽高级中学女中部","沈阳市第八十一中学","沈阳市第九中学","沈阳市共青团实验中学","沈阳市第四十七中学","沈阳市第二十七中学","沈阳市同泽高级中学","沈阳市第十七中学"];
}else if(vm.shareCode() == "BAPJe"){
    xSchool = ["沈阳市回族小学","沈河区二经街第三小学","沈阳市和平区振兴街第二小学","沈阳市和平区西塔街第一小学","望湖路小学","沈阳市和平区团结路小学","沈阳铁路实验小学","沈阳市和平区四经街第一小学","沈阳铁路第三小学","沈阳市和平区和平大街第二小学","沈阳铁路第四小学"
              ,"和平区砂山四校","沈阳市和平区青年大街小学","沈阳市和平区南京街第一小学","沈阳市和平区南京街第十小学","沈阳市和平区南京街第三小学","沈阳市和平区满融朝鲜族实验小学","沈阳市和平区马总小学","浑河站小学","和平区河北街第一小学","河北二校","沈阳市和平区西塔朝鲜族小学"
              ,"沈阳市和平区文化路小学","沈阳市和平区和平大街第一小学"];
    cSchool = ["沈阳市第九十五中学","沈阳市第五十八中学","沈阳市南昌初级中学","沈阳市第一二六中学","沈阳市第九十九中学","沈阳市第十九中学","沈阳市铁路英才初级中学","沈阳市第四十五中学","沈阳市光荣中学","沈阳市和平区长白中学","沈阳市敬业初级中学","沈阳铁路第二中学"
              ,"沈阳市朝鲜族第六中学","沈阳市第一六六中学","沈阳市第一三四中学","沈阳市第一零八中学"];
    gSchool = ["沈阳桃源私立高级中学","沈阳铁路实验中学","沈阳市第九十一中学","沈阳市第二十中学","沈阳铁路职工子弟第四中学","沈阳市第三十八中学","沈阳市第一二四中学","沈阳市回民中学","沈阳市桃源私立高级中学","东北中山中学","沈阳市东兴高级中学"];
}else if(vm.shareCode() == "sYw7F"){
    xSchool = ["沈阳市铁西区重工街第四小学","沈阳市铁西区重工街第三小学","沈阳市铁西区肇工街第一小学","沈阳市铁西区肇工街第三小学","沈阳市铁西区曹家小学","沈阳市铁西区应昌街小学","沈阳市铁西区艳粉街第一小学","沈阳市铁西区勋望小学","沈阳市铁西区兴顺街小学","沈阳市铁西区兴工一校"
              ,"铁西区兴工四校","沈阳市铁西区卫工街第一小学","沈阳市铁西区轻工街第二小学","沈阳市铁西区启工街第一小学","沈阳市铁西区启工街第三小学","沈阳市铁西区启工街第二小学","沈阳市铁西区齐贤街第一小学","沈阳市铁西区齐贤街第二小学","沈阳市铁西区南十二路小学","沈阳市铁西区路官街小学"
              ,"沈阳市铁西区凌空街第一小学","沈阳市铁西区滑翔小学","铁西区光明路第二小学","沈阳市铁西区工人村第二小学","高花中心小学","大青中心校张士小学","大潘中心小学","沈阳市铁西区春晖学校","铁西区雏鹰东校","沈阳市铁西区保工街第一小学","沈阳市铁西区保工街第二小学","沈阳市铁西区彰驿学校（小学部）"
              ,"沈阳市铁西区新民屯九年一贯制学校（小学部）","四方台学校（小学部）","沈阳市铁西区宁官实验学校（小学部）","高明实验学校（小学部）","沈阳市铁西区长滩学校（小学部）","于洪区高花镇东狼小学","于洪区彰驿中心小学","沈阳市长滩九年一贯制学校（小学部）","沈阳市雨田实验学校"
              ,"沈阳市第一00中学","铁西区中朝友谊乡漠家学校","沈阳市于洪区大潘镇马贝小学","沈阳市于洪区大潘镇小潘小学","于洪区大潘镇四台子小学","于洪区高花镇张福安小学","于洪区高花镇青苔小学","于洪区高花乡车家小学","铁西区大青中朝友谊乡张士小学","铁西区启工街第三小学","铁西区勋望小学"
              ,"铁西区翟家镇曹家小学","铁西区翟家镇郎家中心小学","铁西区大挨金小学","铁西区齐贤街第二小学","铁西区卫工街第一小学","铁西区凌空街第一小学","铁西区贵和街小学","铁西区重工街第三小学","铁西区应昌街小学","铁西区工人村第二小学","铁西区太阳小学","铁西区齐贤街第一小学"
              ,"铁西区重工街第五小学","铁西区南十二路小学","铁西区保工街第五小学","铁西区肇工街第一小学","铁西区兴华街第二小学","铁西区轻工街第二小学","铁西区保工街第一小学","铁西区重工街第四小学","铁西区滑翔小学","铁西区路官街小学","铁西区兴工街第四小学","铁西区光明路第二小学","铁西区工人村第一小学"
              ,"铁西区翟家镇翟家小学","铁西区肇工街第三小学","铁西区雏鹰小学","铁西区启工街第二小学","铁西区重工街第二小学","铁西区兴工街第一小学","铁西区艳粉街第一小学","铁西区腾飞街第一小学","于洪区大潘镇大潘中心小学","于洪区高花镇高花中心小学","铁西区肇工街第二小学校","铁西区重工街第一小学","铁西区保工街第二小学","铁西区兴顺街小学","铁西区启工街第一小学"];
    cSchool = ["铁西区重工一校","沈阳市雨田实验中学","沈阳市铁西区彰驿学校（初中部）","沈阳市铁西区新民屯九年一贯制学校（初中部）","四方台学校（初中部）","沈阳市铁西区宁官实验学校（初中部）","高明实验学校（初中部）","沈阳市铁西区长滩学校（初中部）","沈阳市铁西区翟家初级中学","高花中学","沈阳市第180中学"
              ,"沈阳市第一六二中学","沈阳市杏坛中学西校区（原沈阳市第一五七中学）","沈阳市第一○○中学","沈阳市于洪区高花初级中学","于洪区彰驿初级中学","铁西区翟家初级中学","铁西区大青实验学校","沈阳兴华实验学校","沈阳市第二十二中学（初中部）","沈阳市长滩九年一贯制学校（初中部）","辽中县新民屯学校"
              ,"铁西区宁官实验学校","沈阳市第一五八中学","沈阳市第一0三中学","沈阳市杏坛中学","辽中县四方台初级中学","沈阳市培英中学","铁西区第一六二中学","沈阳市高明实验学校","沈阳市第一六0中学","沈阳市第一七二中学","沈阳市第一七三中学","沈阳市第七十九中学","沈阳市第一八0中学","沈阳市第一五七中学"];
    gSchool = ["沈阳市第四中学","沈阳市崇文中学","沈阳市广全中学","沈阳市私立洪庆中学","沈阳市第五十三中学","沈阳市第十五中学","沈阳市第二十二中学（高中部）","沈阳市第三十六中学","沈阳市第八十八中学","沈阳市第三十一中学","沈阳市第五十四中学","沈阳市第一二七中学"];
}else if(vm.shareCode() == "KXfPT"){
    xSchool = ["浑南新区英达小学","新屯中心小学","浑南新区王滨希望学校","浑南新区实验学校（小学部）","浑南新区深井子小学","浑南新区满堂中心小学","浑南新区嘉华学校（小学部）","浑南新区第一小学","浑南新区第二小学","浑南新区第三小学","浑南新区第四小学","浑南新区第五小学","浑南新区第六小学"
              ,"浑南新区第二初级中学附属小学","浑南新区第三初级中学附属小学","浑南新区浑河站中心小学","浑南新区高坎小学"];
    cSchool = ["沈阳市志成中学（初中部）","浑南新区英达中学","浑南新区实验学校（初中部）","浑南新区嘉华学校（初中部）","浑南新区第一初级中学","浑南新区第二初级中学","浑南新区高坎中学"];
    gSchool = ["沈阳市志成中学（高中部）","沈阳市东旭高级中学"];
}
var allSchool = xSchool.concat(cSchool,gSchool);
for(var i=0;i<allSchool.length;i++){
    schoolHtml += "<div class='schoolOption' onclick=\"clickOption(this,'schoolName')\">"+ allSchool[i] +"</div>";
}
for(var j=0;j<15;j++){
    classHtml += "<div class='classOption' onclick=\"clickOption(this,'className')\">"+ numText[j] +"班</div>";
}
$(document).ready(function() {
    $("#sSchool").append(schoolHtml);
    $("#sClass").append(classHtml);
    ko.applyBindings(vm,document.getElementById("vmBody"));
    $.post("/api?m=getShareCodeConfig",{
        shareCode: vm.shareCode()
    },function (msg) {
        vm.role(msg.role);
        if(msg.config == 'school'){
            sendLog("访问扫描二维码下载APP页面（学校专用）", {访问系统: phoneSystem});
            vm.config(msg.config);
        }else{
            sendLog("访问扫描二维码下载APP页面（普通）", {访问系统: phoneSystem});
        }
        if (msg.config == "noflow") {
            $('#flow').hide();
        }else if(msg.config == 'flow'){
            $('#flow').hide();
        }else {
            $('#flow').hide();
        }
    },"json");

    setInterval(function(){
        $(".starS1").addClass("animated rubberBand");
        $('.starS1').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
            $(".starS1").removeClass("animated rubberBand");
        });
    },5000);

    setInterval(function(){
        $(".starB").addClass("animated rubberBand");
        $('.starB').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
            $(".starB").removeClass("animated rubberBand");
        });
    },3000);

    setInterval(function(){
        $(".starS2").addClass("animated rubberBand");
        $('.starS2').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
            $(".starS2").removeClass("animated rubberBand");
        });
    },4000);

    $("#vmBody,#bg").on("touchmove",function(e){
        e.preventDefault();
    });
});