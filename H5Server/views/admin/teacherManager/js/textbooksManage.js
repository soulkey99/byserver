/**
 * Created by hjy on 2016/5/10 0010.
 */

function loadTextbooks(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startPos = (vm.startPos()-1)*vm.pageSize()+1;
    postObj.pageSize = vm.pageSize();
    postObj.stage = $("#stageQ").val();
    postObj.grade = $("#gradeQ").val();
    postObj.subject = $("#subjectQ").val();
    postObj.city = $("#cityQ").val();
    util.callServerFunction('adminGetStudyVersionList', postObj, function (data) {
        if (data.statusCode == 900) {
            var list = new Array();
            for(var i=0;i<data.list.length;i++){
                data.list[i].id = (i+1);
                list.push(data.list[i]);
            }
            vm.textbooks(list);
        } else {
            alert(data.message);
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
        loadTextbooks();
    }
}

function nextPage(){
    vm.startPos(vm.startPos()+1);
    loadTextbooks();
}

function subLoadTextbooks(){
    vm.startPos(1);
    vm.pageSize(15);
    loadTextbooks();
}

function initAddTextbook(){
    vm.textbookImg("");
    var html = "<div>" +
        "<div class='form-group'><label>类型：</label>" +
        "<select id='typeA' class='form-control valid'>" +
        "<option value='book'>教材</option>" +
        "<option value='exercise'>练习册</option>" +
        "</select>" +
        "</div>" +
        "<div class='form-group'><label>学段：</label>" +
        "<select id='stageA' class='form-control valid'>" +
        "<option value=''>-请选择-</option>" +
        "<option value='小学'>小学</option>" +
        "<option value='初中'>初中</option>" +
        "<option value='高中'>高中</option>" +
        "</select>" +
        "</div>" +
        "<div class='form-group'><label>年级：</label>" +
        "<select id='gradeA' class='form-control valid'>" +
        "<option value=''>-请选择-</option>" +
        "<option value='一年级上'>一年级上</option>" +
        "<option value='一年级下'>一年级下</option>" +
        "<option value='二年级上'>二年级上</option>" +
        "<option value='二年级下'>二年级下</option>" +
        "<option value='三年级上'>三年级上</option>" +
        "<option value='三年级下'>三年级下</option>" +
        "<option value='四年级上'>四年级上</option>" +
        "<option value='四年级下'>四年级下</option>" +
        "<option value='五年级上'>五年级上</option>" +
        "<option value='五年级下'>五年级下</option>" +
        "<option value='六年级上'>六年级上</option>" +
        "<option value='六年级下'>六年级下</option>" +
        "<option value='七年级上'>七年级上</option>" +
        "<option value='七年级下'>七年级下</option>" +
        "<option value='七年级下'>七年级下</option>" +
        "<option value='八年级上'>八年级上</option>" +
        "<option value='八年级下'>八年级下</option>" +
        "<option value='九年级上'>九年级上</option>" +
        "<option value='九年级下'>九年级下</option>" +
        "</select>" +
        "</div>" +
        "<div class='form-group'><label>学科：</label>" +
        "<select id='subjectA' class='form-control valid'>" +
        "<option value=''>-请选择-</option>" +
        "<option value='语文'>语文</option>" +
        "<option value='数学'>数学</option>" +
        "<option value='英语'>英语</option>" +
        "<option value='物理'>物理</option>" +
        "<option value='化学'>化学</option>" +
        "<option value='生物'>生物</option>" +
        "<option value='政治'>政治</option>" +
        "<option value='地理'>地理</option>" +
        "<option value='历史'>历史</option>" +
        "</select>" +
        "</div>" +
        "<div class='form-group'><label>城市：</label><input type='text' class='form-control' id='cityA' value=''></div>" +
        "<div class='form-group'><label>练习册名称：</label><input type='text' class='form-control' id='titleA' value=''></div>" +
        "<div class='form-group'><label>教材版本名称：</label><input type='text' class='form-control' id='versionA' value=''></div>" +
        "<div class='form-group'>"+
        "<label>教材封面：</label>" +
        "<input type='file' class='form-control' id='pic' style='display: none'>" +
        "<button type='button' class='btn btn-rounded' onclick='selectImg()'><span class='entypo-export'></span>&nbsp;&nbsp;选择文件</button>"+
        "<img id='textbookImg' style='width: 100%;height: auto;margin-top: 5px' src='' alt='请上传教材封面'/>"+
        "</div>"+
        "<div class='form-group'><label>简介：</label><textarea id='introA' style='width: 100%;height: 100px;border-color: #C7D5E0' value=''></textarea></div>" +
        "<div class='form-group'><label>备注：</label><textarea id='remarkA' style='width: 100%;height: 100px;border-color: #C7D5E0' value=''></textarea></div>" +
        "<button class='btn btn-primary' onclick=\"subAddTextbook()\">提 交</button>" +
        "</div>";
    dialog = $.dialog({
        icon: "icon icon-plus",
        title: "添加教材",
        content: html
    });
    $("#pic").change(function() {
        var file = this.files[0];
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            // 通过 reader.result 来访问生成的 DataURL
            var url = reader.result;
            vm.textbookImg(url);
            $("#textbookImg").attr('src',url);
        };
    });
    $("#cityA").kuCity();
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

function subAddTextbook(){
    if($("#stageA").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择学段！"
        })
    }else if($("#gradeA").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择年级！"
        })
    }else if($("#subjectA").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择科目！"
        })
    }else if($("#cityA").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择教材城市！"
        })
    }else if($("#versionA").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请填写教材版本名称！"
        })
    }else if(vm.textbookImg() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请上传教材封面！"
        })
    }else{
        var dataurl = vm.textbookImg();
        var blob = dataURLtoBlob(dataurl);
        var fd = new FormData();
        fd.append("upload", blob, "image.png");
        xhr.open('POST', '/upload', true);
        xhr.onreadystatechange = addTextbook;
        xhr.send(fd);
    }
}

function addTextbook(){
    if(xhr.readyState == 4 && xhr.status === 200){//readyState表示文档加载进度,4表示完毕
        var postObj = {
            userID: util.getSessionStorage('userID'),
            authSign: util.getSessionStorage('authSign'),
            stage: $("#stageA").val(),
            grade: $("#gradeA").val(),
            subject: $("#subjectA").val(),
            city: $("#cityA").val(),
            version: $("#versionA").val(),
            cover: JSON.parse(xhr.response).filePath,
            remark: $("#remarkA").val(),
            type: $("#typeA").val(),
            title: $("#titleA").val(),
            intro: $("#introA").val()
        };
        util.callServerFunction('adminEditStudyVersion', postObj, function (resp) {
            if (resp.statusCode == 900) {
                util.toast("添加教材成功", "success", "系统提示");
                dialog.close();
                subLoadTextbooks();
            } else {
                errorCodeApi(resp.statusCode);
            }
        });
    }
}

function initEditTextbook(){
    vm.textbookInfo(this);
    vm.textbookImg("");
    vm.ver_id(this.ver_id);
    var html = "<div id='textbookDiv' class='row'>"+
                    "<div class='col-lg-5 col-md-5 col-sm-5 col-xs-5' style='border-right: 1px #CCCCCC solid'>" +
                        "<div><img id='textbookImg' style='width: 100%' src='"+ this.cover +"'></div>" +
                        "<div><h4 class='text-left'>教材目录</h4><hr style='margin:0'></div>" +
                        "<div style='overflow-x: scroll'><ul id='textBookTree' class='ztree'></ul></div>" +
                    "</div>"+
                    "<div class='col-lg-7 col-md-7 col-sm-7 col-xs-7'>" +
                        "<div class='blog-side-nest'>" +
                            "<h4 id='doName' class='text-left'>编辑教材信息</h4>" +
                            "<hr style='margin:0'>" +
                            "<div id='editInfo' style='margin-top: 5px'></div>" +
                        "</div>" +
                    "</div>"+
                "</div>";
    dialog = $.dialog({
        icon: "icon icon-document-edit",
        title: "编辑教材",
        content: html,
        columnClass: "col-lg-8 col-lg-offset-2"
    });
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.ver_id = vm.ver_id();
    util.callServerFunction('adminGetStudyCatalog', postObj, function (data) {
        if (data.statusCode == 900) {
            setTextbookInfo();
            var setting = {
                view: {
                    addHoverDom: addHoverDom,
                    removeHoverDom: removeHoverDom,
                    selectedMulti: false
                },
                edit: {
                    drag: {
                        isCopy: false,
                        isMove: false
                    },
                    enable: true,
                    editNameSelectAll: true,
                    showRemoveBtn: showRemoveBtn,
                    showRenameBtn: true,
                    removeTitle: "删除",
                    renameTitle: "编辑",
                    title: "添加"
                },
                check: {
                    enable: false
                },
                data: {
                    simpleData: {
                        enable: true
                    }
                },
                callback: {
                    beforeDrag: beforeDrag,
                    beforeEditName: beforeEditName,
                    beforeRemove: beforeRemove,
                    beforeRename: beforeRename,
                    onRemove: onRemove,
                    onRename: onRename
                }
            };
            var zNodes =[{ id:vm.textbookInfo().ver_id, pId:0, name:vm.textbookInfo().subject, open:true, type:"textbook"}];
            for(var i=0;i<data.list.length;i++){
                zNodes.push({ id:data.list[i].cha_id, pId:vm.textbookInfo().ver_id, name:data.list[i].title, open:false, type:"chapter", seq:data.list[i].seq, remark:data.list[i].remark});
                for(var j=0;j<data.list[i].sections.length;j++){
                    zNodes.push({ id:data.list[i].sections[j].sec_id, pId:data.list[i].cha_id, name:data.list[i].sections[j].title, open:false, type:"paragraph", seq:data.list[i].sections[j].seq, remark:data.list[i].sections[j].remark});
                }
            }
            $.fn.zTree.init($("#textBookTree"), setting, zNodes);
        } else {
            alert(data.message);
            errorCodeApi(data.statusCode);
        }
    });
}
/*
    zTree start
 */
    function beforeDrag(treeId, treeNodes) {
        return false;
    }
    function beforeEditName(treeId, treeNode) {
        vm.treeNode(treeNode);
        var zTree = $.fn.zTree.getZTreeObj("textBookTree");
        zTree.selectNode(treeNode);
        if(treeNode.type == "textbook"){
            $("#doName").text("编辑教材信息");
            setTextbookInfo();
        }else if(treeNode.type == "chapter"){
            $("#doName").text("编辑章信息");
            setChapterInfo("edit");
            $("#title").val(treeNode.name);
            $("#seq").val(treeNode.seq);
            $("#remark").val(treeNode.remark);
        }else if(treeNode.type == "paragraph"){
            $("#doName").text("编辑节信息");
            setParagraphInfo("edit");
            getParagraphQuestion(treeNode.id);
            $("#title").val(treeNode.name);
            $("#seq").val(treeNode.seq);
            $("#remark").val(treeNode.remark);
        }
        return false;
    }
    function beforeRemove(treeId, treeNode) {
        var zTree = $.fn.zTree.getZTreeObj("textBookTree");
        zTree.selectNode(treeNode);
        vm.treeNode(treeNode);
        $("#editInfo").empty();
        if(treeNode.type == "chapter"){
            $("#doName").text("删除章信息");
            dialog = $.confirm({
                icon: 'icon icon-warning',
                title: '提示信息',
                content:"确定要删除 '"+ treeNode.name +"' 吗？",
                confirmButton: "<span class='fontawesome-ok'></span>&nbsp;&nbsp;确定",
                cancelButton: "<span class='fontawesome-remove'></span>&nbsp;&nbsp;取消",
                confirm: function(){
                    subChapter("delete");
                    temp = true;
                }
            });
        }else if(treeNode.type == "paragraph"){
            $("#doName").text("删除节信息");
            dialog = $.confirm({
                icon: 'icon icon-warning',
                title: '提示信息',
                content:"确定要删除 '"+ treeNode.name +"' 吗？",
                confirmButton: "<span class='fontawesome-ok'></span>&nbsp;&nbsp;确定",
                cancelButton: "<span class='fontawesome-remove'></span>&nbsp;&nbsp;取消",
                confirm: function(){
                    subParagraph("delete");
                }
            });
        }
        return false;
    }
    function onRemove(e, treeId, treeNode) {

    }
    function beforeRename(treeId, treeNode, newName, isCancel) {
        if (newName.length == 0) {
            alert("节点名称不能为空.");
            var zTree = $.fn.zTree.getZTreeObj("textBookTree");
            setTimeout(function(){zTree.editName(treeNode)}, 10);
            return false;
        }
        return true;
    }
    function onRename(e, treeId, treeNode, isCancel) {

    }
    var newCount = 1;
    function addHoverDom(treeId, treeNode) {
        vm.treeNode(treeNode);
        var sObj = $("#" + treeNode.tId + "_span");
        if (treeNode.editNameFlag || $("#addBtn_"+treeNode.tId).length>0) return;
        var addStr = "<span class='button add' id='addBtn_" + treeNode.tId
            + "' title='add node' onfocus='this.blur();'></span>";
        sObj.after(addStr);
        var btn = $("#addBtn_"+treeNode.tId);
        if (btn) btn.bind("click", function(){
            var zTree = $.fn.zTree.getZTreeObj("textBookTree");
            zTree.selectNode(treeNode);
            if(treeNode.type == "textbook"){
                $("#doName").text("添加章信息");
                setChapterInfo("add");
            }else if(treeNode.type == "chapter"){
                vm.paragraphQuestions([]);
                $("#doName").text("添加节信息");
                setParagraphInfo("add");
            }
            //var zTree = $.fn.zTree.getZTreeObj("textBookTree");
            //zTree.addNodes(treeNode, {id:(100 + newCount), pId:treeNode.id, name:"new node" + (newCount++)});
            return false;
        });
    }
    function removeHoverDom(treeId, treeNode) {
        $("#addBtn_"+treeNode.tId).unbind().remove();
    }
    function showRemoveBtn(treeId, treeNode) {
        return !(treeNode.type == "textbook");
    }
/*
    zTree end
 */

function setTextbookInfo(){
    $("#editInfo").empty();
    $("#editInfo").append("<div class='form-group'><label>类型：</label>" +
        "<select id='type' class='form-control valid'>" +
        "<option value='book'>教材</option>" +
        "<option value='exercise'>练习册</option>" +
        "</select>" +
        "</div>" +
        "<div class='form-group'><label>学段：</label>" +
        "<select id='stageE' class='form-control valid'>" +
        "<option value=''>-请选择-</option>" +
        "<option value='小学'>小学</option>" +
        "<option value='初中'>初中</option>" +
        "<option value='高中'>高中</option>" +
        "</select>" +
        "</div>" +
        "<div class='form-group'><label>年级：</label>" +
        "<select id='gradeE' class='form-control valid'>" +
        "<option value=''>-请选择-</option>" +
        "<option value='一年级上'>一年级上</option>" +
        "<option value='一年级下'>一年级下</option>" +
        "<option value='二年级上'>二年级上</option>" +
        "<option value='二年级下'>二年级下</option>" +
        "<option value='三年级上'>三年级上</option>" +
        "<option value='三年级下'>三年级下</option>" +
        "<option value='四年级上'>四年级上</option>" +
        "<option value='四年级下'>四年级下</option>" +
        "<option value='五年级上'>五年级上</option>" +
        "<option value='五年级下'>五年级下</option>" +
        "<option value='六年级上'>六年级上</option>" +
        "<option value='六年级下'>六年级下</option>" +
        "<option value='七年级上'>七年级上</option>" +
        "<option value='七年级下'>七年级下</option>" +
        "<option value='七年级下'>七年级下</option>" +
        "<option value='八年级上'>八年级上</option>" +
        "<option value='八年级下'>八年级下</option>" +
        "<option value='九年级上'>九年级上</option>" +
        "<option value='九年级下'>九年级下</option>" +
        "</select>" +
        "</div>" +
        "<div class='form-group'><label>学科：</label>" +
        "<select id='subjectE' class='form-control valid'>" +
        "<option value=''>-请选择-</option>" +
        "<option value='语文'>语文</option>" +
        "<option value='数学'>数学</option>" +
        "<option value='英语'>英语</option>" +
        "<option value='物理'>物理</option>" +
        "<option value='化学'>化学</option>" +
        "<option value='生物'>生物</option>" +
        "<option value='政治'>政治</option>" +
        "<option value='地理'>地理</option>" +
        "<option value='历史'>历史</option>" +
        "</select>" +
        "</div>" +
        "<div class='form-group'><label>城市：</label><input type='text' class='form-control' id='cityE' value=''></div>" +
        "<div class='form-group'><label>练习册名称：</label><input type='text' class='form-control' id='bookTitle' value=''></div>" +
        "<div class='form-group'><label>教材版本名称：</label><input type='text' class='form-control' id='versionE' value=''></div>" +
        "<div class='form-group'>"+
        "<label>教材封面：</label>" +
        "<input type='file' class='form-control' id='pic' style='display: none'>" +
        "<button type='button' class='btn btn-rounded' onclick='selectImg()'><span class='entypo-export'></span>&nbsp;&nbsp;选择文件</button>"+
        "</div>"+
        "<div class='form-group'><label>简介：</label><textarea id='intro' style='width: 100%;height: 100px;border-color: #C7D5E0' value=''></textarea></div>" +
        "<div class='form-group'><label>备注：</label><textarea id='remarkE' style='width: 100%;height: 100px;border-color: #C7D5E0' value=''></textarea></div>" +
        "<button class='btn btn-primary' onclick=\"subEditTextbook()\">提 交</button>");
    $("#pic").change(function() {
        var file = this.files[0];
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            // 通过 reader.result 来访问生成的 DataURL
            var url = reader.result;
            vm.textbookImg(url);
            $("#textbookImg").attr('src',url);
        };
    });
    $("#cityE").kuCity();
    $("#stageE").val(vm.textbookInfo().stage);
    $("#gradeE").val(vm.textbookInfo().grade);
    $("#subjectE").val(vm.textbookInfo().subject);
    $("#cityE").val(vm.textbookInfo().city);
    $("#versionE").val(vm.textbookInfo().version);
    $("#remarkE").val(vm.textbookInfo().remark);
    $("#type").val(vm.textbookInfo().type);
    $("#bookTitle").val(vm.textbookInfo().title);
    $("#intro").val(vm.textbookInfo().intro);
}

function setChapterInfo(sign) {
    $("#editInfo").empty();
    $("#editInfo").append("<div class='form-group'><label>标题：</label><input type='text' class='form-control' id='title' value=''></div>" +
        "<div class='form-group'><label>顺序：</label><input type='text' class='form-control' id='seq' value=''></div>" +
        "<div class='form-group'><label>备注：</label><textarea id='remark' style='width: 100%;height: 100px;border-color: #C7D5E0' value=''></textarea></div>" +
        "<button class='btn btn-primary' onclick=\"subChapter('"+ sign +"')\">提 交</button>");
}

function subChapter(sign){
    if($("#title").val() == "" && sign != "delete"){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请填写标题！"
        })
    }else if($("#seq").val() == "" && sign != "delete"){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请填写顺序！"
        })
    }else{
        var postObj = {};
        if(sign == "add"){
            postObj = {
                userID: util.getSessionStorage('userID'),
                authSign: util.getSessionStorage('authSign'),
                title: $("#title").val(),
                seq: $("#seq").val(),
                remark: $("#remark").val(),
                ver_id: vm.ver_id()
            };
        }else if(sign == "edit"){
            postObj = {
                userID: util.getSessionStorage('userID'),
                authSign: util.getSessionStorage('authSign'),
                title: $("#title").val(),
                seq: $("#seq").val(),
                remark: $("#remark").val(),
                cha_id: vm.treeNode().id
            };
        }else if(sign == "delete"){
            postObj = {
                userID: util.getSessionStorage('userID'),
                authSign: util.getSessionStorage('authSign'),
                cha_id: vm.treeNode().id,
                action: "remove"
            };
        }
        util.callServerFunction('adminEditStudyChapter', postObj, function (resp) {
            if (resp.statusCode == 900) {
                var zTree = $.fn.zTree.getZTreeObj("textBookTree");
                if(sign == "add"){
                    util.toast("添加章成功", "success", "系统提示");
                    zTree.addNodes(vm.treeNode(), {id:resp.info.cha_id, pId:vm.textbookInfo().ver_id, name:$("#title").val(), open:false, type:"chapter", seq:resp.info.seq, remark:resp.info.remark});
                }else if(sign == "edit"){
                    util.toast("编辑章成功", "success", "系统提示");
                    vm.treeNode().name = $("#title").val();
                    vm.treeNode().seq = resp.info.seq;
                    vm.treeNode().remark = resp.info.remark;
                    zTree.updateNode(vm.treeNode());
                }else if(sign == "delete"){
                    util.toast("删除章成功", "success", "系统提示");
                    zTree.removeNode(vm.treeNode());
                }
                vm.ver_id("");
                vm.treeNode("");
            } else {
                errorCodeApi(resp.statusCode);
            }
        });
    }
}

function setParagraphInfo(sign) {
    ko.cleanNode(document.getElementById("editInfo"));
    $("#editInfo").empty();
    $("#editInfo").append("<div class='form-group'><label>标题：</label><input type='text' class='form-control' id='title' value=''></div>" +
        "<div class='form-group'><label>顺序：</label><input type='text' class='form-control' id='seq' value=''></div>" +
        "<div class='form-group'><label>备注：</label><textarea id='remark' style='width: 100%;height: 100px;border-color: #C7D5E0' value=''></textarea></div>" +
        "<div class='form-group'>"+
            "<label>相关问题：<a href='javascript:void(0)' onclick='initAddQuestion()'>添加问题</a></label>" +
            "<div style='height: 200px;max-height: 200px;overflow-y: scroll;overflow-x: hidden' data-bind='foreach: paragraphQuestions'>" +
                "<div style='padding: 10px 5px 10px 5px'>" +
                    "<div style='width: 90%;float: left;'><span data-bind='text: $index()+1'></span>.&nbsp;&nbsp;<span data-bind='text: content'></span></div>" +
                    "<div style='width: 10%;float: left;text-align: center'><a href='javascript:void(0)' data-bind='click: delQuestion'><span class='fontawesome-trash'></span>删除</a></div>" +
                "</div>" +
            "</div>" +
        "</div>"+
        "<button class='btn btn-primary' onclick=\"subParagraph('"+ sign +"')\">提 交</button>");
    ko.applyBindings(vm,document.getElementById("editInfo"));
}

function subParagraph(sign){
    if($("#title").val() == "" && sign != "delete"){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请填写标题！"
        })
    }else if($("#seq").val() == "" && sign != "delete"){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请填写顺序！"
        })
    }else{
        var postObj = {};
        if(sign == "add"){
            var q_id = [];
            for(var i=0;i<vm.paragraphQuestions().length;i++){
                q_id.push(vm.paragraphQuestions()[i].q_id);
            }
            postObj = {
                userID: util.getSessionStorage('userID'),
                authSign: util.getSessionStorage('authSign'),
                title: $("#title").val(),
                seq: $("#seq").val(),
                remark: $("#remark").val(),
                cha_id: vm.treeNode().id,
                q_id: q_id.join(",")
            };
        }else if(sign == "edit"){
            var q_id = [];
            for(var i=0;i<vm.paragraphQuestions().length;i++){
                q_id.push(vm.paragraphQuestions()[i].q_id);
            }
            postObj = {
                userID: util.getSessionStorage('userID'),
                authSign: util.getSessionStorage('authSign'),
                title: $("#title").val(),
                seq: $("#seq").val(),
                remark: $("#remark").val(),
                sec_id: vm.treeNode().id,
                q_id: q_id.join(",")
            };
        }else if(sign == "delete"){
            postObj = {
                userID: util.getSessionStorage('userID'),
                authSign: util.getSessionStorage('authSign'),
                sec_id: vm.treeNode().id,
                action: "remove"
            };
        }
        util.callServerFunction('adminEditStudySection', postObj, function (resp) {
            if (resp.statusCode == 900) {
                var zTree = $.fn.zTree.getZTreeObj("textBookTree");
                if(sign == "add"){
                    util.toast("添加节成功", "success", "系统提示");
                    zTree.addNodes(vm.treeNode(), {id:resp.info.sec_id, pId:vm.treeNode().id, name:$("#title").val(), open:false, type:"paragraph", seq:resp.info.seq, remark:resp.info.remark});
                }else if(sign == "edit"){
                    util.toast("编辑节成功", "success", "系统提示");
                    vm.treeNode().name = $("#title").val();
                    vm.treeNode().seq = resp.info.seq;
                    vm.treeNode().remark = resp.info.remark;
                    zTree.updateNode(vm.treeNode());
                }else if(sign == "delete"){
                    util.toast("删除节成功", "success", "系统提示");
                    zTree.removeNode(vm.treeNode());
                }
                vm.treeNode("");
            } else {
                alert(resp.message);
                errorCodeApi(resp.statusCode);
            }
        });
    }
}

function subEditTextbook(){
    if($("#stageA").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择学段！"
        })
    }else if($("#gradeA").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择年级！"
        })
    }else if($("#subjectA").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择科目！"
        })
    }else if($("#cityA").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择教材城市！"
        })
    }else if($("#versionA").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请填写教材版本名称！"
        })
    }else if(vm.textbookImg() == "" && $("#textbookImg").attr("src") == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请上传教材封面！"
        })
    }else{
        if(vm.textbookImg() != ""){
            var dataurl = vm.textbookImg();
            var blob = dataURLtoBlob(dataurl);
            var fd = new FormData();
            fd.append("upload", blob, "image.png");
            xhr.open('POST', '/upload', true);
            xhr.onreadystatechange = editTextbook;
            xhr.send(fd);
        }else{
            editTextbook();
        }
    }
}

function editTextbook(){
    if(vm.textbookImg() != ""){
        if(xhr.readyState == 4 && xhr.status === 200){//readyState表示文档加载进度,4表示完毕
            var postObj = {
                userID: util.getSessionStorage('userID'),
                authSign: util.getSessionStorage('authSign'),
                ver_id: vm.ver_id(),
                stage: $("#stageE").val(),
                grade: $("#gradeE").val(),
                subject: $("#subjectE").val(),
                city: $("#cityE").val(),
                version: $("#versionE").val(),
                cover: JSON.parse(xhr.response).filePath,
                remark: $("#remarkE").val(),
                type: $("#type").val(),
                title: $("#bookTitle").val(),
                intro: $("#intro").val()
            };
            util.callServerFunction('adminEditStudyVersion', postObj, function (resp) {
                if (resp.statusCode == 900) {
                    util.toast("修改教材成功", "success", "系统提示");
                    vm.textbookInfo(resp.info);
                    subLoadTextbooks();
                } else {
                    alert(resp.message)
                    errorCodeApi(resp.statusCode);
                }
            });
        }
    }else{
        var postObj = {
            userID: util.getSessionStorage('userID'),
            authSign: util.getSessionStorage('authSign'),
            ver_id: vm.ver_id(),
            stage: $("#stageE").val(),
            grade: $("#gradeE").val(),
            subject: $("#subjectE").val(),
            city: $("#cityE").val(),
            version: $("#versionE").val(),
            cover: $("#textbookImg").attr("src"),
            remark: $("#remarkE").val(),
            type: $("#type").val(),
            title: $("#bookTitle").val(),
            intro: $("#intro").val()
        };
        util.callServerFunction('adminEditStudyVersion', postObj, function (resp) {
            if (resp.statusCode == 900) {
                util.toast("修改教材成功", "success", "系统提示");
                vm.textbookInfo(resp.info);
                subLoadTextbooks();
            } else {
                alert(resp.message)
                errorCodeApi(resp.statusCode);
            }
        });
    }
}

function delTextbook(){
    var ver_id = this.ver_id;
    dialog = $.confirm({
        icon: 'icon icon-warning',
        title: '提示信息',
        content:"确定要删除 '"+ this.subject + "-" + this.version +"' 教材吗？",
        confirmButton: "<span class='fontawesome-ok'></span>&nbsp;&nbsp;确定",
        cancelButton: "<span class='fontawesome-remove'></span>&nbsp;&nbsp;取消",
        confirm: function(){
            var postObj = {
                userID: util.getSessionStorage('userID'),
                authSign: util.getSessionStorage('authSign'),
                ver_id: ver_id,
                action: "remove"
            };
            util.callServerFunction('adminEditStudyVersion', postObj, function (resp) {
                if (resp.statusCode == 900) {
                    util.toast("删除教材成功", "success", "系统提示");
                    loadTextbooks();
                } else {
                    errorCodeApi(resp.statusCode);
                }
            });
        }
    });
}

function getParagraphQuestion(sec_id){
    var postObj = {
        userID: util.getSessionStorage('userID'),
        authSign: util.getSessionStorage('authSign'),
        sec_id: sec_id,
        limit: 0
    };
    util.callServerFunction('adminGetStudySectionQuestion', postObj, function (resp) {
        if (resp.statusCode == 900) {
            var list = [];
            for(var i=0;i<resp.list.length;i++){
                resp.list[i].id = i+1;
                resp.list[i].checked = "";
                list.push(resp.list[i]);
            }
            vm.paragraphQuestions(list);
            MathJax.Hub.Queue(["Typeset",MathJax.Hub, "editInfo"]);
        } else {
            errorCodeApi(resp.statusCode);
        }
    });
}

function initAddQuestion(){
    vm.questionList([]);
    var html = "<div id='addQuestionDiv'>" +
        "<div>" +
        "<form class='form-horizontal' role='form' id='questionForm'>" +
        "<div class='form-group'>" +
        "<div class='col-lg-3'>" +
        "<label class='control-label'>关键词</label>" +
        "<input id='keyQQ' class='form-control' type='text'>" +
        "<div style='height:10px;'></div>" +
        "</div>" +
        "<div class='col-lg-2'>" +
        "<label class='control-label'>学段</label>" +
        "<select id='stageQQ' class='form-control valid'>" +
        "<option value=''>全部</option>" +
        "<option value='小学'>小学</option>" +
        "<option value='初中'>初中</option>" +
        "<option value='高中'>高中</option>" +
        "</select>" +
        "<div style='height:10px;'></div>" +
        "</div>" +
        "<div class='col-lg-2'>" +
        "<label class='control-label'>年级</label>" +
        "<select id='gradeQQ' class='form-control valid'>" +
        "<option value=''>全部</option>" +
        "<option value='一年级上'>一年级上</option>" +
        "<option value='一年级下'>一年级下</option>" +
        "<option value='二年级上'>二年级上</option>" +
        "<option value='二年级下'>二年级下</option>" +
        "<option value='三年级上'>三年级上</option>" +
        "<option value='三年级下'>三年级下</option>" +
        "<option value='四年级上'>四年级上</option>" +
        "<option value='四年级下'>四年级下</option>" +
        "<option value='五年级上'>五年级上</option>" +
        "<option value='五年级下'>五年级下</option>" +
        "<option value='六年级上'>六年级上</option>" +
        "<option value='六年级下'>六年级下</option>" +
        "<option value='七年级上'>七年级上</option>" +
        "<option value='七年级下'>七年级下</option>" +
        "<option value='七年级下'>七年级下</option>" +
        "<option value='八年级上'>八年级上</option>" +
        "<option value='八年级下'>八年级下</option>" +
        "<option value='九年级上'>九年级上</option>" +
        "<option value='九年级下'>九年级下</option>" +
        "</select>" +
        "<div style='height:10px;'></div>" +
        "</div>" +
        "<div class='col-lg-2'>" +
        "<label class='control-label'>学科</label>" +
        "<select id='subjectQQ' class='form-control valid'>" +
        "<option value=''>全部</option>" +
        "<option value='语文'>语文</option>" +
        "<option value='数学'>数学</option>" +
        "<option value='英语'>英语</option>" +
        "<option value='物理'>物理</option>" +
        "<option value='化学'>化学</option>" +
        "<option value='生物'>生物</option>" +
        "<option value='政治'>政治</option>" +
        "<option value='地理'>地理</option>" +
        "<option value='历史'>历史</option>" +
        "</select>" +
        "<div style='height:10px;'></div>" +
        "</div>" +
        "<div class='col-lg-3'>" +
        "<label class='control-label'>操作</label><br>" +
        "<button type='button' class='btn btn-rounded' onclick='searchQusetion()'><span class='entypo-search'></span>&nbsp;&nbsp;检 索</button>&nbsp;&nbsp;" +
        "</div>" +
        "</div>" +
        "</form>" +
        "</div>" +
        "<div class='table-responsive'>" +
        "<table id='questionTable' class='table table-bordered table-striped cf'>" +
        "<thead class='cf'>" +
        "<tr>" +
        "<th align='center' class='col-lg-1'><input type='checkbox' name='selectAll' onclick='selectAllQuestion()'></th>" +
        "<th align='center' class='col-lg-1'>序号</th>" +
        "<th align='center' class='col-lg-10'>内容</th>" +
        "</tr>" +
        "</thead>" +
        "<tbody data-bind='foreach: questionList'>" +
        "<tr>" +
        "<td align='center'><input type='checkbox' name='qId' data-bind='value: q_id, checked: checked' onclick='getSelectQuestion(this)'></td>" +
        "<td align='left'><span data-bind='text: id'></span></td>" +
        "<td align='left'><span data-bind='text: content'></span></td>" +
        "</tr>" +
        "</tbody>" +
        "</table>" +
        "</div></div>";
    var dialogPoint = $.dialog({
        icon: "icon icon-plus",
        title: "添加相关问题",
        content: html,
        columnClass: "col-lg-12"
    });
    ko.applyBindings(vm,document.getElementById("addQuestionDiv"));
}

// 检索问题
function searchQusetion(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startPos = 1;
    postObj.pageSize = 999;
    postObj.query = $("#keyQQ").val();
    postObj.stage = $("#stageQQ").val();
    postObj.grade = $("#gradeQQ").val();
    postObj.subject = $("#subjectQQ").val();
    util.callServerFunction('adminGetStudyQuestionList', postObj, function (data) {
        if (data.statusCode == 900) {
            var list = [];
            for(var i=0;i<data.list.length;i++){
                data.list[i].id = i+1;
                data.list[i].checked = "";
                list.push(data.list[i]);
            }
            vm.questionList(list);
            MathJax.Hub.Queue(["Typeset",MathJax.Hub, "questionTable"]);
        } else {
            alert(data.message);
            errorCodeApi(data.statusCode);
        }
    });
}

function selectAllQuestion(){
    if($("input:checkbox[name='selectAll']").prop("checked")){
        $("input:checkbox[name='qId']").each(function(){
            $(this).prop("checked",true);
        });
        for(var i=0;i<vm.questionList().length;i++){
            var same = false;
            for(var j=0;j<vm.paragraphQuestions().length;j++){
                if(vm.paragraphQuestions()[j].q_id == vm.questionList()[i].q_id){
                    same = true;
                }
            }
            if(!same){
                vm.questionList()[i].checked = vm.questionList()[i].p_id;
                vm.paragraphQuestions.push(vm.questionList()[i]);
            }
        }
    }else{
        $("input:checkbox[name='qId']").each(function(){
            $(this).prop("checked",false);
        });
        for(var i=0;i<vm.paragraphQuestions().length;i++){
            for(var j=0;j<vm.questionList().length;j++){
                if(vm.paragraphQuestions()[i].q_id == vm.questionList()[j].q_id){
                    vm.paragraphQuestions.splice(i,1);
                }
            }
        }
    }
    MathJax.Hub.Queue(["Typeset",MathJax.Hub, "editInfo"]);
}

function getSelectQuestion(obj){
    for(var i=0;i<vm.questionList().length;i++){
        if(vm.questionList()[i].q_id == $(obj).val()){
            var same = false;
            for(var j=0;j<vm.paragraphQuestions().length;j++){
                if(vm.paragraphQuestions()[j].q_id == vm.questionList()[i].q_id){
                    same = true;
                }
            }
            if($(obj).prop("checked")){
                if(!same){
                    vm.questionList()[i].checked = true;
                    vm.paragraphQuestions.push(vm.questionList()[i]);
                }
            }else{
                vm.questionList()[i].checked = "";
                vm.paragraphQuestions.splice(vm.paragraphQuestions.indexOf(vm.questionList()[i]),1);
            }
            break;
        }
    }
    MathJax.Hub.Queue(["Typeset",MathJax.Hub, "editInfo"]);
}

function delQuestion(){
    var question = this;
    dialog = $.confirm({
        icon: 'icon icon-warning',
        title: '提示信息',
        content:"确定要删除此问题吗？",
        confirmButton: "<span class='fontawesome-ok'></span>&nbsp;&nbsp;确定",
        cancelButton: "<span class='fontawesome-remove'></span>&nbsp;&nbsp;取消",
        confirm: function(){
            vm.paragraphQuestions.splice(vm.paragraphQuestions.indexOf(question),1);
        }
    });
}

MathJax.Hub.Config({
    showProcessingMessages: false,
    messageStyle: "none",
    jax: ["input/TeX", "output/HTML-CSS"],
    tex2jax: {
        inlineMath: [ ['$','$'], ["\\(","\\)"] ],
        displayMath: [ ['$$','$$'], ["\\[","\\]"] ],
        processEscapes: true
    },
    "HTML-CSS": {
        availableFonts: ["TeX"],
        styles: {
            ".MathJax_Display": {
                "text-align": "left !important",
                display: "-webkit-inline-box !important",
                margin:  "0em 0em !important"
            }
        }
    }
});

var viewModel = function(){
    this.textbooks = ko.observableArray();
    this.startPos = ko.observable(1);
    this.pageSize = ko.observable(15);
    this.prevPage = prevPage;
    this.nextPage = nextPage;
    this.textbookImg = ko.observable("");
    this.ver_id = ko.observable("");
    this.textbookInfo = ko.observable("");
    this.treeNode = ko.observable("");
    this.initEditTextbook = initEditTextbook;
    this.delTextbook = delTextbook;
    this.paragraphQuestions = ko.observableArray();
    this.questionList = ko.observableArray();
    this.delQuestion = delQuestion;
}
var xhr = new XMLHttpRequest();
var vm = new viewModel();
ko.applyBindings(vm, document.getElementById("textbooksManage"));
subLoadTextbooks();