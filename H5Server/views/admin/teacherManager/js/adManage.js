/**
 * Created by hjy on 2015/11/19 0019.
 */

function loadAdList(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startPos = (vm.startPos()-1)*vm.pageSize()+1;
    postObj.pageSize = vm.pageSize();
    postObj.getType = $("#getType").val();
    if($("#time").val()!=""){
        postObj.time = new Date($("#time").val()).getTime();
    }
    postObj.platform = $("#platform").val();
    postObj.userType = $("#userType").val();
    postObj.valid = $("#valid").val();
    postObj.type = $("#type").val();
    util.callServerFunction('adminGetADList', postObj, function (data) {
        if (data.statusCode == 900) {
            vm.adList.removeAll();
            if (data.list.length > 0) {
                var list = [];
                for (var i = 0; i < data.list.length; i++) {
                    list.push({
                        id: (i + 1),
                        ad_id: data.list[i].ad_id,
                        content: data.list[i].content,
                        link: data.list[i].content.link,
                        pic: data.list[i].content.pic,
                        text: data.list[i].content.text,
                        desc: data.list[i].desc,
                        end: util.convertTime2Str(data.list[i].end),
                        platform: data.list[i].platform,
                        seq: data.list[i].seq,
                        start: util.convertTime2Str(data.list[i].start),
                        type: data.list[i].type,
                        typeText: data.list[i].type,
                        userType: data.list[i].userType,
                        valid: data.list[i].valid,
                        resolution: data.list[i].resolution
                    });
                }
                vm.adList(list);
                $('i').tooltip({
                    "margin-top": "50px"
                });
                $("[data-toggle='popover']").popover();
            } else if (vm.startPos() != 1) {
                vm.startPos(vm.startPos() - 1);
                loadAdList();
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
        loadAdList();
    }
}

function nextPage(){
    vm.startPos(vm.startPos()+1);
    loadAdList();
}

function subLoadAdList(){
    vm.startPos(1);
    vm.pageSize(15);
    loadAdList();
}

function initAddAd(){
    vm.oldSrc("");
    vm.ad_id("");
    vm.tempSrc("");
    var html = "<div class='form-group'>"+
        "<input type='hidden' class='form-control' id='shopID'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>有效时间：</label>" +
        "<input id='startTime' class='form-control' type='text'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>失效时间：</label>" +
        "<input id='endTime' class='form-control' type='text'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>广告类型：</label>" +
        "<select id='typeAdd' class='form-control valid' onchange='changeTypeApp()'>"+
        "<option value=''>-请选择-</option>"+
        "<option value='splash'>闪屏页</option>"+
        "<option value='banner'>首页banner位</option>"+
        "<option value='waiting'>等待接单页广告位</option>"+
        "<option value='homePop'>首页弹出广告位(展示)</option>"+
        "<option value='homePopHide'>首页弹出广告位(隐藏)</option>"+
        "</select>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>广告描述：</label><input type='text' class='form-control' id='desc'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>广告链接：</label><input type='text' class='form-control' id='link'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>广告文字：</label><input type='text' class='form-control' id='text'>"+
        "</div>"+
        "<div class='form-group' id='platformCheckBox'>"+
        "<label>平台：</label><br/>" +
        "<label class='checkbox-inline'><input type='checkbox' name='platformCB' value='android'>安卓Android</label>" +
        "<label class='checkbox-inline'><input type='checkbox' name='platformCB' value='ios'>苹果IOS</label>" +
        "</div>"+
        "<div class='form-group hidden' id='platformRadio'>"+
        "<label>平台：</label><br/>" +
        "<label class='checkbox-inline'><input type='radio' name='platformR' value='android' onchange='changePlatform()'>安卓Android</label>" +
        "<label class='checkbox-inline'><input type='radio' name='platformR' value='ios' onchange='changePlatform()'>苹果IOS</label>" +
        "</div>"+
        "<div class='form-group hidden' id='resolution'>"+
        "<label>分辨率：</label><br/>" +
        "<label class='checkbox-inline'><input type='radio' name='resolution' value='iphone4'>iphone4s及以下</label>" +
        "<label class='checkbox-inline'><input type='radio' name='resolution' value='iphone5'>iphone5及以上</label>" +
        "</div>"+
        "<div class='form-group'>"+
        "<label>客户端类型：</label><br/>" +
        "<label class='checkbox-inline'><input type='checkbox' name='userType' value='teacher'>教师端</label>" +
        "<label class='checkbox-inline'><input type='checkbox' name='userType' value='student'>学生端</label>" +
        "</div>"+
        "<div class='form-group'>"+
        "<label>广告图片：</label>" +
        "<input type='file' class='form-control' id='pic' style='display: none'>" +
        "<button type='button' class='btn btn-rounded' onclick='selectImg()'><span class='entypo-export'></span>&nbsp;&nbsp;选择文件</button>"+
        "<img id='adImg' style='width: 100%;height: auto;margin-top: 5px' src='' alt='请上传广告图片'/>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>是/否有效：</label>" +
        "<select id='userTypeAdd' class='form-control valid'>"+
        "<option value=''>-请选择-</option>"+
        "<option value='true'>有效</option>"+
        "<option value='false'>无效</option>"+
        "</select>"+
        "</div>"+
        "<button class='btn btn-primary' onclick='uploadAd()'>确 定</button>";
    dialog = $.dialog({
        icon: "icon icon-plus",
        title: '新增广告',
        content: html
    });
    util.initDateTimePicker("startTime",{defaultDate: new Date(date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + " 00:00:00")});
    util.initDateTimePicker("endTime",{defaultDate: new Date(date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + " 23:59:59")});
    $("#pic").change(function() {
        var file = this.files[0];
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            // 通过 reader.result 来访问生成的 DataURL
            var url = reader.result;
            vm.tempSrc(url);
            $("#adImg").attr('src',url);
        };
    });
}

function changeTypeApp(){
    if($("#typeAdd").val() == "splash"){
        $("#platformCheckBox,#resolution").addClass("hidden");
        $("#platformRadio").removeClass("hidden");
    }else{
        $("#platformCheckBox").removeClass("hidden");
        $("#platformRadio,#resolution").addClass("hidden");
    }
}

function changePlatform(){
    if($("input:radio[value='ios']").prop("checked")){
        $("#resolution").removeClass("hidden");
    }else{
        $("#resolution").addClass("hidden");
    }
}

function selectImg(){
    $("#pic").click();
}

function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}

function uploadAd(){
    var platform = "",platformList = [],userType = "",userTypeList = [],resolution = "";
    $(":checkbox[name='platformCB']").each(function(){
        if($(this).prop("checked")) {
            platformList.push($(this).val());
        }
    });
    $(":checkbox[name='userType']").each(function(){
        if($(this).prop("checked")){
            userTypeList.push($(this).val());
        }
    });
    if($("#typeAdd").val() == "splash"){
        platform = $(":radio[name='platformR']:checked").val();
        resolution = $(":radio[name='resolution']:checked").val();
    }else{
        platform = platformList.join(",");
    }
    userType = userTypeList.join(",");
    if($("#startTime").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择有效时间！"
        })
    }else if($("#endTime").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择失效时间！"
        })
    }else if($("#typeAdd").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择广告类型！"
        })
    }else if(platform == "" || platform == undefined){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择平台！"
        })
    }else if($("#typeAdd").val() == "splash" &&  platform == "ios" && (resolution == "" || resolution == undefined)){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择分辨率！"
        })
    }else if(userType == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择客户端类型！"
        })
    }else if($("#adImg").attr("src") == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择广告图片！"
        })
    }else if($("#userTypeAdd").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择是/否有效！"
        })
    }else{
        if (vm.tempSrc() != "") {
            var dataurl = vm.tempSrc();
            var blob = dataURLtoBlob(dataurl);
            var fd = new FormData();
            fd.append("upload", blob, "image.png");
            xhr.open('POST', '/upload', true);
            xhr.onreadystatechange = callback;
            xhr.send(fd);
        } else {
            callback();
        }
    }
}

function callback(){
    var platform = "",platformList = [],userType = "",userTypeList = [],resolution = "";
    $(":checkbox[name='platformCB']").each(function(){
        if($(this).prop("checked")) {
            platformList.push($(this).val());
        }
    });
    $(":checkbox[name='userType']").each(function(){
        if($(this).prop("checked")){
            userTypeList.push($(this).val());
        }
    });
    if($("#typeAdd").val() == "splash"){
        platform = $(":radio[name='platformR']:checked").val();
        resolution = $(":radio[name='resolution']:checked").val();
    }else{
        platform = platformList.join(",");
    }
    userType = userTypeList.join(",");
    if(vm.tempSrc() != ""){
        if(xhr.readyState == 4 && xhr.status === 200){//readyState表示文档加载进度,4表示完毕
            var imgsrc = JSON.parse(xhr.response).filePath;
            var postObj = {
                ad_id: vm.ad_id(),
                userID: util.getSessionStorage('userID'),
                authSign: util.getSessionStorage('authSign'),
                startTime: new Date($("#startTime").val()).getTime(),
                endTime: new Date($("#endTime").val()).getTime(),
                valid: $("#userTypeAdd").val(),
                text: $("#text").val(),
                link: $("#link").val(),
                desc: $("#desc").val(),
                type: $("#typeAdd").val(),
                platform: platform,
                userType: userType,
                pic: imgsrc,
                resolution: resolution
            };
            util.callServerFunction('adminEditAD', postObj, function (resp) {
                if (resp.statusCode == 900) {
                    util.toast("操作成功", "success", "系统提示");
                    dialog.close();
                    if(vm.ad_id() == ""){
                        subLoadAdList();
                    }else{
                        loadAdList();
                    }
                } else {
                    errorCodeApi(resp.statusCode);
                }
            });
        }
    }else{
        var imgsrc = vm.oldSrc();
        var postObj = {
            ad_id: vm.ad_id(),
            userID: util.getSessionStorage('userID'),
            authSign: util.getSessionStorage('authSign'),
            startTime: new Date($("#startTime").val()).getTime(),
            endTime: new Date($("#endTime").val()).getTime(),
            valid: $("#userTypeAdd").val(),
            text: $("#text").val(),
            link: $("#link").val(),
            desc: $("#desc").val(),
            type: $("#typeAdd").val(),
            platform: platform,
            userType: userType,
            pic: imgsrc,
            resolution: resolution
        };
        util.callServerFunction('adminEditAD', postObj, function (resp) {
            if (resp.statusCode == 900) {
                util.toast("操作成功", "success", "系统提示");
                dialog.close();
                if(vm.ad_id() == ""){
                    subLoadAdList();
                }else{
                    loadAdList();
                }
            } else {
                errorCodeApi(resp.statusCode);
            }
        });
    }
}

function initEditAd(){
    vm.oldSrc(this.pic);
    vm.ad_id(this.ad_id);
    vm.tempSrc("");
    var html = "<div class='form-group'>"+
        "<input type='hidden' class='form-control' id='shopID'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>有效时间：</label>" +
        "<input id='startTime' class='form-control' type='text' value='"+ this.start +"'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>失效时间：</label>" +
        "<input id='endTime' class='form-control' type='text' value='"+ this.end +"'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>广告类型：</label>" +
        "<select id='typeAdd' class='form-control valid' onchange='changeTypeApp()'>"+
        "<option value=''>-请选择-</option>"+
        "<option value='splash'>闪屏页</option>"+
        "<option value='banner'>首页banner位</option>"+
        "<option value='waiting'>等待接单页广告位</option>"+
        "<option value='homePop'>首页弹出广告位(展示)</option>"+
        "<option value='homePopHide'>首页弹出广告位(隐藏)</option>"+
        "</select>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>广告描述：</label><input type='text' class='form-control' id='desc' value='"+ this.desc +"'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>广告链接：</label><input type='text' class='form-control' id='link' value='"+ this.link +"'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>广告文字：</label><input type='text' class='form-control' id='text' value='"+ this.text +"'>"+
        "</div>"+
        "<div class='form-group' id='platformCheckBox'>"+
        "<label>平台：</label><br/>" +
        "<label class='checkbox-inline'><input type='checkbox' name='platformCB' value='android'>安卓Android</label>" +
        "<label class='checkbox-inline'><input type='checkbox' name='platformCB' value='ios'>苹果IOS</label>" +
        "</div>"+
        "<div class='form-group hidden' id='platformRadio'>"+
        "<label>平台：</label><br/>" +
        "<label class='checkbox-inline'><input type='radio' name='platformR' value='android' onchange='changePlatform()'>安卓Android</label>" +
        "<label class='checkbox-inline'><input type='radio' name='platformR' value='ios' onchange='changePlatform()'>苹果IOS</label>" +
        "</div>"+
        "<div class='form-group hidden' id='resolution'>"+
        "<label>分辨率：</label><br/>" +
        "<label class='checkbox-inline'><input type='radio' name='resolution' value='iphone4'>iphone4s及以下</label>" +
        "<label class='checkbox-inline'><input type='radio' name='resolution' value='iphone5'>iphone5及以上</label>" +
        "</div>"+
        "<div class='form-group'>"+
        "<label>客户端类型：</label><br>" +
        "<label class='checkbox-inline'><input type='checkbox' name='userType' value='teacher'>教师端</label>" +
        "<label class='checkbox-inline'><input type='checkbox' name='userType' value='student'>学生端</label>" +
        "</div>"+
        "<div class='form-group'>"+
        "<label>广告图片：</label>" +
        "<input type='file' class='form-control' id='pic' style='display: none'>" +
        "<button type='button' class='btn btn-rounded' onclick='selectImg()'><span class='entypo-export'></span>&nbsp;&nbsp;选择文件</button>"+
        "<img id='adImg' style='width: 100%;height: auto;margin-top: 5px' src='"+ this.pic +"' alt='请上传广告图片'>"+
        "</div>"+
        "<button class='btn btn-primary' onclick='uploadAd()'>确 定</button>";
    dialog = $.dialog({
        icon: "icon icon-document-edit",
        title: '修改广告',
        content: html
    });
    util.initDateTimePicker("startTime",{});
    util.initDateTimePicker("endTime",{});
    $("#pic").change(function() {
        var file = this.files[0];
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            // 通过 reader.result 来访问生成的 DataURL
            var url = reader.result;
            vm.tempSrc(url);
            $("#adImg").attr('src',url);
        };
    });
    $("#typeAdd").val(this.type);
    if(this.type == "splash"){
        $("#platformCheckBox").addClass("hidden");
        $("#platformRadio").removeClass("hidden");
        if(this.platform[0] == "ios"){
            $("#resolution").removeClass("hidden");
            $("input:radio[value='"+ this.resolution +"']").prop("checked",true);
        }
        $.each(this.platform,function(index,value){
            $(":radio[value='"+value+"']").prop("checked",true);
        })
    }else{
        $.each(this.platform,function(index,value){
            $(":checkbox[value='"+value+"']").prop("checked",true);
        })
    }
    $.each(this.userType,function(index,value){
        $(":checkbox[value='"+value+"']").prop("checked",true);
    })

}

function setValid(){
    var postObj = {
        userID: util.getSessionStorage('userID'),
        authSign: util.getSessionStorage('authSign'),
        ad_id: this.ad_id,
        valid: !this.valid
    };
    util.callServerFunction('adminEditAD', postObj, function (data) {
        if(data.statusCode == 900){
            util.toast("操作成功！","success","系统提示");
            loadAdList();
        }else{
            errorCodeApi(data.statusCode);
        }
    })
}

function previewAd(){
    var html = "<input type='hidden' class='form-control' id='shopID'>"+
        "<div class='form-group col-lg-3'>"+
        "<label>广告预览时间点：</label>" +
        "<input id='timePreview' class='form-control' type='text'>"+
        "</div>"+
        "<div class='form-group col-lg-2'>"+
        "<label>平台：</label>" +
        "<select id='platformPreview' class='form-control valid'>"+
        "<option value=''>全部</option>"+
        "<option value='android'>安卓</option>"+
        "<option value='ios'>苹果IOS</option>"+
        "</select>"+
        "</div>"+
        "<div class='form-group col-lg-2'>"+
        "<label>客户端类型：</label>" +
        "<select id='userTypePreview' class='form-control valid'>"+
        "<option value=''>全部</option>"+
        "<option value='teacher'>教师端</option>"+
        "<option value='student'>学生端</option>"+
        "</select>"+
        "</div>"+
        "<div class='form-group col-lg-2'>"+
        "<label>是/否有效：</label>" +
        "<select id='validPreview' class='form-control valid'>"+
        "<option value=''>全部</option>"+
        "<option value='true'>有效</option>"+
        "<option value='false'>无效</option>"+
        "</select>"+
        "</div>" +
        "<div class='form-group col-lg-3'>"+
        "<label>操作：</label><br>" +
        "<button class='btn btn-primary' onclick='searchPreviewAd()'>检 索</button>" +
        "</div>" +
        "<div class='col-lg-3' align='center'>" +
        "<span class='label label-success'>闪屏页</span>" +
        "<hr><div id='splash'></div><br>" +
        "</div>"+
        "<div class='col-lg-3' align='center'>" +
        "<span class='label label-success'>首页banner位</span>" +
        "<hr><div id='banner'></div><br>" +
        "</div>"+
        "<div class='col-lg-3' align='center'>" +
        "<span class='label label-success'>等待接单页广告位</span>" +
        "<hr><div id='waiting'></div><br>" +
        "</div>"+
        "<div class='col-lg-3' align='center'>" +
        "<span class='label label-success'>首页弹出广告位</span>" +
        "<hr><div id='homePop'></div><br>" +
        "</div>";
    $.dialog({
        columnClass: "col-lg-12",
        icon: "icon icon-mobile-portrait",
        title: '广告预览',
        content: html
    });
    util.initDateTimePicker("timePreview",{defaultDate: new Date(date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + " 00:00:00")});
}

function searchPreviewAd(){
    var postObj = {
        userID: util.getSessionStorage('userID'),
        authSign: util.getSessionStorage('authSign'),
        time: new Date($("#timePreview").val()).getTime(),
        platform: $("#platformPreview").val(),
        userType: $("#userTypePreview").val(),
        valid: $("#validPreview").val(),
        getType: "preview"
    };
    util.callServerFunction('adminGetADList', postObj, function (data) {
        if(data.statusCode == 900){
            $.each(data.list,function(k,v){
                if(k != "needPop"){
                    var wh = "";
                    if(k == "splash"){
                        wh = "width:248px;height:330px";
                    }else if(k == "banner"){
                        wh = "width:248px;height:132px";
                    }else if(k == "waiting"){
                        wh = "width:248px;height:330px";
                    }else if(k == "homePop"){
                        wh = "width:248px;height:330px";
                    }
                    var html = "暂无广告";
                    if (v.length > 0) {
                        html = "<div id='jssor_"+ k +"' style='position: relative; margin: 0 auto; top: 0px; left: 0px; overflow: hidden; visibility: hidden;"+ wh +"'>" +
                            "<div data-u='loading' style='position: absolute; top: 0px; left: 0px;'>" +
                            "<div style='filter: alpha(opacity=70); opacity: 0.7; position: absolute; display: block; top: 0px; left: 0px; width: 100%; height: 100%;'></div>" +
                            "<div style='position:absolute;display:block;background:url('../../../img/loading.gif') no-repeat center center;top:0px;left:0px;width:100%;height:100%;'></div>" +
                            "</div>" +
                            "<div data-u='slides' style='cursor: default; position: relative; top: 0px; left: 0px;overflow: hidden;"+ wh +"'>";
                        for (var i = 0; i < v.length; i++) {
                            html += "<div data-p='112.50' style='display: none;'>" +
                                "<img data-u='image' src='" + v[i].pic + "' onclick=\"toLink('" + v[i].link + "')\">" +
                                "<div data-u='caption' data-t='4' style='position: absolute; top: 30px; left: 600px; width: 200px; height: 20px; background-color: rgba(235,81,0,0.5); font-size: 15px; color: #ffffff; line-height: 20px; text-align: center;'>" + v[i].text + "</div>"+
                                "</div>";
                        }
                        html += "</div>" +
                            "<div data-u='navigator' class='jssorb01' style='bottom:16px;right:10px;'>" +
                            "<div data-u='prototype' style='width:12px;height:12px;'></div>" +
                            "</div>" +
                            "<span data-u='arrowleft' class='jssora02l' style='top:123px;left:8px;width:55px;height:55px;z-index:99' data-autocenter='2'></span>" +
                            "<span data-u='arrowright' class='jssora02r' style='top:123px;right:8px;width:55px;height:55px;z-index:99' data-autocenter='2'></span>" +
                            "</div>";
                    }
                    $("#"+k).html(html);
                    if (v.length > 0) {
                        initJssor("jssor_" + k);
                    }
                }
            })
        }else{
            errorCodeApi(data.statusCode);
        }
    })
}

function toLink(link){
    window.open(link);
}

function initJssor(object){
    var jssor_1_SlideoTransitions = [
        [{b:0.0,d:600.0,y:-290.0,e:{y:27.0}}],
        [{b:0.0,d:600.0,x:410.0,e:{x:27.0}}],
        [{b:-1.0,d:1.0,o:-1.0},{b:0.0,d:600.0,o:1.0,r:0.0,e:{o:5.0}}],
        [{b:-1.0,d:1.0,c:{x:175.0,t:-175.0}},{b:0.0,d:800.0,c:{x:-175.0,t:175.0},e:{c:{x:7.0,t:7.0}}}],
        [{b:-1.0,d:1.0,o:-1.0},{b:0.0,d:1000.0,x:-570.0,o:1.0,e:{x:6.0}}],
        [{b:-1.0,d:1.0,o:-1.0,r:-180.0},{b:0.0,d:800.0,o:1.0,r:180.0,c:{x:0.0,t:0.0},e:{r:7.0,c:{x:7.0,t:7.0}}}],
        [{b:0.0,d:1000.0,y:80.0,c:{x:0.0,t:0.0},e:{y:24.0,c:{x:7.0,t:7.0}}},{b:1000.0,d:1100.0,x:570.0,y:170.0,o:-1.0,r:30.0,sX:9.0,sY:9.0,e:{x:2.0,y:6.0,r:1.0,sX:5.0,sY:5.0}}],
        [{b:0.0,d:1000.0,y:185.0},{b:1000.0,d:500.0,o:-1.0},{b:1500.0,d:500.0,o:1.0},{b:2000.0,d:1500.0,r:360.0},{b:3500.0,d:1000.0,rX:30.0},{b:4500.0,d:500.0,rX:-30.0},{b:5000.0,d:1000.0,rY:30.0},{b:6000.0,d:500.0,rY:-30.0},{b:6500.0,d:500.0,sX:1.0},{b:7000.0,d:500.0,sX:-1.0},{b:7500.0,d:500.0,sY:1.0},{b:8000.0,d:500.0,sY:-1.0},{b:8500.0,d:500.0,kX:30.0},{b:9000.0,d:500.0,kX:-30.0},{b:9500.0,d:500.0,kY:30.0},{b:10000.0,d:500.0,kY:-30.0},{b:10500.0,d:500.0,c:{x:87.50,t:-87.50}},{b:11000.0,d:500.0,c:{x:-87.50,t:87.50}}],
        [{b:2000.0,d:600.0,rY:30.0}],
        [{b:0.0,d:500.0,x:-105.0},{b:500.0,d:500.0,x:230.0},{b:1000.0,d:500.0,y:-120.0},{b:1500.0,d:500.0,x:-70.0,y:120.0},{b:2600.0,d:500.0,y:-80.0},{b:3100.0,d:900.0,y:160.0,e:{y:24.0}}],
        [{b:0.0,d:1000.0,o:-0.4,rX:2.0,rY:1.0},{b:1000.0,d:1000.0,rY:1.0},{b:2000.0,d:1000.0,rX:-1.0},{b:3000.0,d:1000.0,rY:-1.0},{b:4000.0,d:1000.0,o:0.19999999999999996,rX:-1.0,rY:-1.0}]
    ];

    var jssor_1_options = {
        $AutoPlay: true,
        $CaptionSliderOptions: {
            $Class: $JssorCaptionSlideo$,
            $Transitions: jssor_1_SlideoTransitions,
            $Breaks: [
                [{d:3000,b:1000}]
            ]
        },
        $ArrowNavigatorOptions: {
            $Class: $JssorArrowNavigator$
        },
        $BulletNavigatorOptions: {
            $Class: $JssorBulletNavigator$
        }
    };

    var jssor_1_slider = new $JssorSlider$(object, jssor_1_options);

    //responsive code begin
    //you can remove responsive code if you don't want the slider scales while window resizes
    function ScaleSlider() {
        var refSize = jssor_1_slider.$Elmt.parentNode.clientWidth;
        if (refSize) {
            refSize = Math.min(refSize, 1920);
            jssor_1_slider.$ScaleWidth(refSize);
        }
        else {
            window.setTimeout(ScaleSlider, 30);
        }
    }
    ScaleSlider();
    $Jssor$.$AddEvent(window, "load", ScaleSlider);
    $Jssor$.$AddEvent(window, "resize", $Jssor$.$WindowResizeFilter(window, ScaleSlider));
    $Jssor$.$AddEvent(window, "orientationchange", ScaleSlider);
    //responsive code end
}

function showSrcImg(){
    $.dialog({
        icon: "icon icon-document-edit",
        title: '原图',
        content: "<div align='center'><button class='btn btn-success' onclick=\"util.rotateImg('testImg', 'left')\"><span class='entypo-ccw'></span>&nbsp;&nbsp;左转</button>&nbsp;&nbsp;"+
        "<button class='btn btn-success' onclick=\"util.rotateImg('testImg', 'right')\">右转&nbsp;&nbsp;<span class='entypo-cw'></span></button></div>" +
        "<br><img style='width:100%;max-width:100%;height:auto' src='"+ this.pic +"' id='testImg'>",
        columnClass: 'col-lg-12 col-md-6 col-sm-3 col-xs-2'
    });
}

var viewModel = function(){
    this.adList = ko.observableArray();
    this.startPos = ko.observable(1);
    this.pageSize = ko.observable(15);
    this.prevPage = prevPage;
    this.nextPage = nextPage;
    this.loadAdList = loadAdList;
    this.subLoadAdList = subLoadAdList;
    this.initEditAd = initEditAd;
    this.initAddAd = initAddAd;
    this.uploadAd = uploadAd;
    this.previewAd = previewAd;
    this.tempSrc = ko.observable("");
    this.ad_id = ko.observable("");
    this.oldSrc = ko.observable("");
    this.showSrcImg = showSrcImg;
};
var vm = new viewModel();
var date = new Date();
var xhr = new XMLHttpRequest();
var dialog = "";
$(document).ready(function(){
    ko.applyBindings(vm,document.getElementById("adManage"));
    util.initDateTimePicker("time",{});
    $('.selectpicker').selectpicker({
        style: 'btn btn-info'
    });
    $('.btn-group').css("width","100%");
    document.onkeydown=function(event){
        e = event ? event :(window.event ? window.event : null);
        if(e.keyCode==13){
            subLoadAdList();
            return false;
        }
    }
    loadAdList();
});