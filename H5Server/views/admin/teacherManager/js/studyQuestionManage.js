/**
 * Created by hjy on 2016/4/19 0019.
 */

function initJit(){
    //init data
    json = {
        id: "",
        name: "",
        data: {
            type: "",
            parentId: ""
        },
        children: [{

        }]
    };
    var subtree = json.children.pop();
    //end
    var removing = false;
    //init Spacetree
    //Create a new ST instance
    st = new $jit.ST({
        injectInto: "infovis",
        orientation: "top",
        levelDistance: 50,
        levelsToShow: 50,
        //offsetY: 350,
        Navigation: {
            enable: true,
            panning: "avoid nodes",
            zooming: false
        },
        NodeStyles: {
            enable: false,
            type: 'auto',
            stylesHover: true,
            stylesClick: true
        },
        Tips: {
            enable: true,
            type: 'HTML',
            offsetX: 20,
            offsetY: 20,
            force: false,
            onShow: function(tip, node) {
                tip.innerHTML = "<span class='tip' style='border: 1px #CCCCCC solid;background-color: white'>"+ node.name +"</span>";
                MathJax.Hub.Queue(["Typeset",MathJax.Hub, tip]);
            },
            onHide: function() {

            }
        },
        Events: {
            enable: true,
            onClick: function(node, eventInfo, e){
                if(node){
                    nodeId = node.id;
                    nodeType = node.data.type;
                    parentId = node.data.parentId;
                    if(nodeType == "root"){
                        setQuestionInfo(nodeId);
                        $("#questionTitle").text("添加子问题");
                        $("#questionTitle").prev().removeClass();
                        $("#questionTitle").prev().addClass("icon icon-plus");
                        $("#choiceTitle").text("题干问题下不可添加选项");
                        $("#choiceTitle").prev().removeClass();
                        $("#choiceTitle").prev().addClass("icon icon-warning");
                        util.toast("已选择题干节点，请添加子问题或修改题干", "success", "系统提示");
                    }else if(nodeType == "question"){
                        setQuestionInfo(nodeId);
                        $("#questionTitle").text("修改当前问题节点");
                        $("#questionTitle").prev().removeClass();
                        $("#questionTitle").prev().addClass("icon icon-document-edit");
                        $("#choiceTitle").text("当前问题下添加选项");
                        $("#choiceTitle").prev().removeClass();
                        $("#choiceTitle").prev().addClass("icon icon-plus");
                        util.toast("已选择问题节点，请添加问题选项或修改该问题", "success", "系统提示");
                    }else if(nodeType == "choice"){
                        setOptionInfo(nodeId);
                        $("#questionTitle").text("当前选项下添加问题");
                        $("#questionTitle").prev().removeClass();
                        $("#questionTitle").prev().addClass("icon icon-plus");
                        $("#choiceTitle").text("修改当前选项");
                        $("#questionTitle").prev().removeClass();
                        $("#questionTitle").prev().addClass("icon icon-document-edit");
                        util.toast("已选择问题选项节点，请添加子问题或修改选项", "success", "系统提示");
                    }
                    st.select(nodeId,"animate");
                }
            }
        },
        align: "center",
        //set overridable=true if you want
        //to set styles for nodes individually
        Node: {
            overridable: true,
            //width: 10,
            //height: 30,
            color: "#f77",
            autoHeight: false,
            autoWidth: true,
            height: 20
        },
        //change the animation/transition effect
        transition: $jit.Trans.Quart.easeOut,

        onBeforeCompute: function(node){
            MathJax.Hub.Queue(["Typeset",MathJax.Hub, "infovis"]);
        },

        onAfterCompute: function(node){
            MathJax.Hub.Queue(["Typeset",MathJax.Hub, "infovis"]);
        },

        //This method is triggered on label
        //creation. This means that for each node
        //this method is triggered only once.
        //This method is useful for adding event
        //handlers to each node label.
        onCreateLabel: function(label, node){
            //add some styles to the node label
            if(node.name.indexOf("<img")>=0){
                label.innerHTML = node.name.substring(0,node.name.indexOf("<img"));
            }else{
                label.innerHTML = node.name;
            }
            var style = label.style;
            label.id = node.id;
            style.color = 'green';
            style.fontSize = '0.6em';
            style.textAlign = 'center';
            //style.width = "60px";
            style.cursor = "pointer";
            if(node.getData('width') > 300){
                //style.width = "300px";
                //node.data.$width = 10;
            }else{
                //style.width = node.getData('width') + 'px';
                //node.data.$width = 10;
            }
            style.width = node.getData('width') + 'px';
            style.height = node.getData('height') + 'px';
            node.data.$height = node.getData('height');
            //console.log(node);
            //Delete the specified subtree
            //when clicking on a label.
            //Only apply this method for nodes
            //in the first level of the tree.
        },
        //This method is triggered right before plotting a node.
        //This method is useful for adding style
        //to a node before it's being rendered.
        onBeforePlotNode: function(node) {
            node.data.$width = node.getData('width');
            if (node._depth%2 == 0 && node._depth!=0 && node._depth!=1) {
                if (node.selected) {
                    node.data.$color = "#ff7";
                } else {
                    //delete node.data.$color;
                    node.data.$color = '#ccc';
                }
            } else {
                if (node.selected) {
                    node.data.$color = "#ff7";
                } else {
                    node.data.$color = '#f77';
                }
            }
        }
    });
    //load json data
    st.loadJSON(json);
    //compute node positions and layout
    st.compute();
    //optional: make a translation of the tree
    st.geom.translate(new $jit.Complex(-200, 0), "current");
    //Emulate a click on the root node.
    st.onClick(st.root);
    //end
}

function initMathJax(){
    MathJax.Hub.Queue(["Typeset",MathJax.Hub, "contentPreview"]);
    MathJax.Hub.Queue(["Typeset",MathJax.Hub, "remarkPreview"]);
    MathJax.Hub.Queue(["Typeset",MathJax.Hub, "optionContentPreview"]);
    MathJax.Hub.Queue(["Typeset",MathJax.Hub, "hintContentPreview"]);
    MathJax.Hub.Queue(["Typeset",MathJax.Hub, "infovis"]);
}

function contentPreview(){
    vm.questionContentPreview(vm.questionContent());
    MathJax.Hub.Queue(["Typeset",MathJax.Hub, "contentPreview"]);
}

function remarkPreview(){
    vm.remarkPreview(vm.remark());
    MathJax.Hub.Queue(["Typeset",MathJax.Hub, "remarkPreview"]);
}

function optionContentPreview(){
    vm.optionContentPreview(vm.optionContent());
    MathJax.Hub.Queue(["Typeset",MathJax.Hub, "optionContentPreview"]);
}

function hintContentPreview(){
    vm.hintContentPreview(vm.hintContent());
    MathJax.Hub.Queue(["Typeset",MathJax.Hub, "hintContentPreview"]);
}

// 添加节点
function addNode(sign){
    if(nodeId != "" || vm.questionType() == "newRoot"){
        if(sign == "question"){
            if(vm.questionType() == "newRoot"){ //添加题干
                if(checkQuestion()){
                    var postObj = {};
                    postObj.userID = util.getSessionStorage("userID");
                    postObj.authSign = util.getSessionStorage("authSign");
                    postObj.type = "root";
                    postObj.stage = vm.stage();
                    postObj.grade = vm.grade();
                    postObj.subject = vm.subject();
                    postObj.content = vm.questionContent();
                    postObj.remark = vm.remark();
                    postObj.difficulty = vm.difficulty();
                    var pointId = []
                        ,relatedId = []
                        ,enhanceId = [];
                    for(var i=0;i<vm.points().length;i++){
                        pointId.push(vm.points()[i].p_id);
                    }
                    for(var i=0;i<vm.relateds().length;i++){
                        relatedId.push(vm.relateds()[i].q_id);
                    }
                    for(var i=0;i<vm.enhances().length;i++){
                        enhanceId.push(vm.enhances()[i].q_id);
                    }
                    postObj.point = pointId.join(",");
                    postObj.related = relatedId.join(",");
                    postObj.enhance = enhanceId.join(",");
                    util.callServerFunction('adminEditStudyQuestion', postObj, function (data) {
                        if (data.statusCode == 900) {
                            util.toast("添加问题成功", "success", "系统提示");
                            //修改选项中下一题ID
                            json = {
                                id: data.info.q_id,
                                name: vm.questionContent(),
                                data: {
                                    type: "root",
                                    parentId: ""
                                }
                            }
                            st.loadJSON(json);
                            st.compute();
                            st.geom.translate(new $jit.Complex(-200, 0), "current");
                            st.onClick(st.root);
                        } else {
                            alert(data.message);
                            errorCodeApi(data.statusCode);
                        }
                    });
                }
            }else{
                if(nodeType == "root" && vm.questionType() != "root"){ //题干下添加问题
                    if(checkQuestion()){
                        var postObj = {};
                        postObj.userID = util.getSessionStorage("userID");
                        postObj.authSign = util.getSessionStorage("authSign");
                        postObj.type = vm.questionType();
                        postObj.stage = vm.stage();
                        postObj.grade = vm.grade();
                        postObj.subject = vm.subject();
                        postObj.content = vm.questionContent();
                        postObj.remark = vm.remark();
                        postObj.prev_id = nodeId;
                        var pointId = []
                            ,relatedId = []
                            ,enhanceId = [];
                        for(var i=0;i<vm.points().length;i++){
                            pointId.push(vm.points()[i].p_id);
                        }
                        for(var i=0;i<vm.relateds().length;i++){
                            relatedId.push(vm.relateds()[i].q_id);
                        }
                        for(var i=0;i<vm.enhances().length;i++){
                            enhanceId.push(vm.enhances()[i].q_id);
                        }
                        postObj.point = pointId.join(",");
                        postObj.related = relatedId.join(",");
                        postObj.enhance = enhanceId.join(",");
                        util.callServerFunction('adminEditStudyQuestion', postObj, function (data) {
                            if (data.statusCode == 900) {
                                util.toast("添加问题成功", "success", "系统提示");
                                var node = {
                                    children: [{
                                        id: data.info.q_id,
                                        name: vm.questionContent(),
                                        data: {
                                            type: "question",
                                            parentId: nodeId
                                        }
                                    }]
                                };
                                node.id = nodeId;
                                st.addSubtree(node, "animate", {
                                    hideLabels: false,
                                    onComplete: function() {
                                        MathJax.Hub.Queue(["Typeset",MathJax.Hub, "infovis"]);
                                    }
                                });
                            } else {
                                alert(data.message);
                                errorCodeApi(data.statusCode);
                            }
                        });
                    }
                }else if(nodeType == "question" || nodeType == "root"){   //修改问题
                    if(checkQuestion()){
                        var postObj = {};
                        postObj.userID = util.getSessionStorage("userID");
                        postObj.authSign = util.getSessionStorage("authSign");
                        postObj.q_id = nodeId;
                        postObj.type = vm.questionType();
                        postObj.stage = vm.stage();
                        postObj.grade = vm.grade();
                        postObj.subject = vm.subject();
                        postObj.content = vm.questionContent();
                        postObj.remark = vm.remark();
                        if(nodeType == "root"){
                            postObj.difficulty = vm.difficulty();
                        }
                        var pointId = []
                            ,relatedId = []
                            ,enhanceId = [];
                        for(var i=0;i<vm.points().length;i++){
                            pointId.push(vm.points()[i].p_id);
                        }
                        for(var i=0;i<vm.relateds().length;i++){
                            relatedId.push(vm.relateds()[i].q_id);
                        }
                        for(var i=0;i<vm.enhances().length;i++){
                            enhanceId.push(vm.enhances()[i].q_id);
                        }
                        postObj.point = pointId.join(",");
                        postObj.related = relatedId.join(",");
                        postObj.enhance = enhanceId.join(",");
                        util.callServerFunction('adminEditStudyQuestion', postObj, function (data) {
                            if (data.statusCode == 900) {
                                util.toast("修改问题成功", "success", "系统提示");
                                if(vm.questionContent().indexOf("<img")>0){
                                    $("#"+nodeId).text(vm.questionContent().substring(0,vm.questionContent().indexOf("<img")));
                                }else{
                                    $("#"+nodeId).text(vm.questionContent());
                                }
                                MathJax.Hub.Queue(["Typeset",MathJax.Hub, "infovis"]);
                            } else {
                                alert(data.message);
                                errorCodeApi(data.statusCode);
                            }
                        });
                    }
                }else if(nodeType == "choice"){    //选项下添加问题
                    if(checkQuestion()){
                        var postObj = {};
                        postObj.userID = util.getSessionStorage("userID");
                        postObj.authSign = util.getSessionStorage("authSign");
                        postObj.type = vm.questionType();
                        postObj.stage = vm.stage();
                        postObj.grade = vm.grade();
                        postObj.subject = vm.subject();
                        postObj.content = vm.questionContent();
                        postObj.remark = vm.remark();
                        postObj.choice_id = nodeId;
                        var pointId = []
                            ,relatedId = []
                            ,enhanceId = [];
                        for(var i=0;i<vm.points().length;i++){
                            pointId.push(vm.points()[i].p_id);
                        }
                        for(var i=0;i<vm.relateds().length;i++){
                            relatedId.push(vm.relateds()[i].q_id);
                        }
                        for(var i=0;i<vm.enhances().length;i++){
                            enhanceId.push(vm.enhances()[i].q_id);
                        }
                        postObj.point = pointId.join(",");
                        postObj.related = relatedId.join(",");
                        postObj.enhance = enhanceId.join(",");
                        util.callServerFunction('adminEditStudyQuestion', postObj, function (data) {
                            if (data.statusCode == 900) {
                                util.toast("添加问题成功", "success", "系统提示");
                                var node = {
                                    children: [{
                                        id: data.info.q_id,
                                        name: vm.questionContent(),
                                        data: {
                                            type: "question",
                                            parentId: nodeId
                                        }
                                    }]
                                };
                                node.id = nodeId;
                                st.addSubtree(node, "animate", {
                                    hideLabels: false,
                                    onComplete: function() {
                                        MathJax.Hub.Queue(["Typeset",MathJax.Hub, "infovis"]);
                                    }
                                });
                            } else {
                                alert(data.message);
                                errorCodeApi(data.statusCode);
                            }
                        });
                    }
                }
            }
        }else if(sign == "choice"){
            if(nodeType == "question"){  //问题下添加选项
                var choices = []
                    ,postObj = {}
                    ,choice = {};
                postObj.userID = util.getSessionStorage("userID");
                postObj.authSign = util.getSessionStorage("authSign");
                postObj.q_id = nodeId;
                postObj.action = vm.optionType();
                postObj.content = vm.optionContent();
                postObj.correct = vm.correct();
                postObj.flag = vm.flag();
                postObj.hint = vm.hintContent();
                util.callServerFunction('adminEditStudyChoice', postObj, function (data) {
                    if (data.statusCode == 900) {
                        util.toast("添加选项成功", "success", "系统提示");
                        var node = {
                            children: [{
                                id: data.info.choice[data.info.choice.length-1].choice_id,
                                name: vm.optionContent(),
                                data: {
                                    type: "choice",
                                    parentId: nodeId
                                }
                            }]
                        };
                        node.id = nodeId;
                        st.addSubtree(node, "animate", {
                            hideLabels: false,
                            onComplete: function() {
                                MathJax.Hub.Queue(["Typeset",MathJax.Hub, "infovis"]);
                            }
                        });
                    } else {
                        alert(data.message);
                        errorCodeApi(data.statusCode);
                    }
                });
            }else if(nodeType == "choice"){  //修改选项
                var choices = []
                    ,postObj = {}
                    ,choice = {};
                postObj.userID = util.getSessionStorage("userID");
                postObj.authSign = util.getSessionStorage("authSign");
                postObj.choice_id = nodeId;
                postObj.action = vm.optionType();
                postObj.content = vm.optionContent();
                postObj.correct = vm.correct();
                postObj.flag = vm.flag();
                postObj.hint = vm.hintContent();
                util.callServerFunction('adminEditStudyChoice', postObj, function (data) {
                    if (data.statusCode == 900) {
                        util.toast("修改选项成功", "success", "系统提示");
                        $("#"+nodeId).text(vm.optionContent());
                        MathJax.Hub.Queue(["Typeset",MathJax.Hub, "infovis"]);
                    } else {
                        alert(data.message);
                        errorCodeApi(data.statusCode);
                    }
                });
            }
        }
    }else{
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择节点！"
        })
    }
}

// 验证问题内容
function checkQuestion(){
    if(vm.questionType() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择问题类型！"
        })
        return false;
    }else if(vm.stage() == "" && vm.questionType() == "root" && vm.questionType() == "newRoot"){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择学段！"
        })
        return false;
    }else if(vm.grade() == "" && vm.questionType() == "root" && vm.questionType() == "newRoot"){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择年级！"
        })
        return false;
    }else if(vm.subject() == "" && vm.questionType() == "root" && vm.questionType() == "newRoot"){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择学科！"
        })
        return false;
    }else if(vm.questionContent() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请填写问题内容！"
        })
        return false;
    }else{
        return true;
    }
}

// 获取并设置题目内容
function setQuestionInfo(q_id){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.q_id = q_id;
    util.callServerFunction('adminGetStudyQuestion', postObj, function (data) {
        if (data.statusCode == 900) {
            vm.questionType(data.info.type);
            vm.stage(data.info.stage);
            vm.grade(data.info.grade);
            vm.subject(data.info.subject);
            vm.questionContent(data.info.content);
            contentPreview();
            vm.remark(data.info.remark);
            remarkPreview();
            vm.difficulty(data.info.difficulty);

            postObj = {};
            postObj.userID = util.getSessionStorage("userID");
            postObj.authSign = util.getSessionStorage("authSign");
            postObj.q_id = q_id;
            postObj.type = "point";
            postObj.limit = 0;
            util.callServerFunction('adminGetStudyQuestionExtra', postObj, function (data) {
                if (data.statusCode == 900) {
                    var list = [];
                    for(var i=0;i<data.list.length;i++){
                        data.list[i].id = i+1;
                        data.list[i].checked = data.list[i].p_id;
                        list.push(data.list[i]);
                    }
                    vm.points(list);
                } else {
                    alert(data.message);
                    errorCodeApi(data.statusCode);
                }
            });

            postObj = {};
            postObj.userID = util.getSessionStorage("userID");
            postObj.authSign = util.getSessionStorage("authSign");
            postObj.q_id = q_id;
            postObj.type = "related";
            postObj.limit = 0;
            util.callServerFunction('adminGetStudyQuestionExtra', postObj, function (data) {
                if (data.statusCode == 900) {
                    vm.relateds(data.list);
                } else {
                    alert(data.message);
                    errorCodeApi(data.statusCode);
                }
            });

            postObj = {};
            postObj.userID = util.getSessionStorage("userID");
            postObj.authSign = util.getSessionStorage("authSign");
            postObj.q_id = q_id;
            postObj.type = "enhance";
            postObj.limit = 0;
            util.callServerFunction('adminGetStudyQuestionExtra', postObj, function (data) {
                if (data.statusCode == 900) {
                    vm.enhances(data.list);
                } else {
                    alert(data.message);
                    errorCodeApi(data.statusCode);
                }
            });
        } else {
            alert(data.message);
            errorCodeApi(data.statusCode);
        }
    });
}

// 获取并设置选项内容
function setOptionInfo(choice_id){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.choice_id = choice_id;
    util.callServerFunction('adminGetStudyChoice', postObj, function (data) {
        if (data.statusCode == 900) {
            vm.optionType(data.info.action);
            vm.flag(data.info.flag);
            vm.correct("" + data.info.correct);
            vm.optionContent(data.info.content);
            optionContentPreview();
            vm.hintContent(data.info.hint);
            hintContentPreview();
        } else {
            alert(data.message);
            errorCodeApi(data.statusCode);
        }
    });
}

// 点击选项序列
function checkFlag(){
    vm.flag($("input[name='flag']:checked").val());
}

// 重置问题属性
function resetQuestion(){
    vm.questionType("");
    vm.stage("");
    vm.grade("");
    vm.subject("");
    vm.questionContent("");
    vm.questionContentPreview("");
    vm.pointId("");
    vm.pointPreview("");
    vm.relatedId("");
    vm.relatedPreview("");
    vm.enhanceId("");
    vm.enhancePreview("");
    vm.remark("");
    vm.points([]);
    vm.relateds([]);
    vm.enhances([]);
}

// 重置选项属性
function resetOption(){
    vm.optionType("");
    vm.flag("");
    vm.correct("");
    vm.optionContent("");
    vm.optionContentPreview("");
    vm.hintContent("");
    vm.hintContentPreview("");
}

// 弹出添加知识点窗口
function initPoint(){
    var html = "<div id='pointDiv'>" +
        "<div>" +
        "<form class='form-horizontal' role='form' id='questionForm'>" +
        "<div class='form-group'>" +
        "<div class='col-lg-3'>" +
        "<label class='control-label'>关键词</label>" +
        "<input id='key' class='form-control' type='text'>" +
        "<div style='height:10px;'></div>" +
        "</div>" +
        "<div class='col-lg-2'>" +
        "<label class='control-label'>学段</label>" +
        "<select id='stage' class='form-control valid'>" +
        "<option value=''>全部</option>" +
        "<option value='小学'>小学</option>" +
        "<option value='初中'>初中</option>" +
        "<option value='高中'>高中</option>" +
        "</select>" +
        "<div style='height:10px;'></div>" +
        "</div>" +
        "<div class='col-lg-2'>" +
        "<label class='control-label'>年级</label>" +
        "<select id='grade' class='form-control valid'>" +
        "<option value=''>全部</option>" +
        "<option value='一年级'>一年级</option>" +
        "<option value='二年级'>二年级</option>" +
        "<option value='三年级'>三年级</option>" +
        "<option value='四年级'>四年级</option>" +
        "<option value='五年级'>五年级</option>" +
        "<option value='六年级'>六年级</option>" +
        "<option value='七年级'>七年级</option>" +
        "<option value='七年级'>七年级</option>" +
        "<option value='八年级'>八年级</option>" +
        "<option value='九年级'>九年级</option>" +
        "</select>" +
        "<div style='height:10px;'></div>" +
        "</div>" +
        "<div class='col-lg-2'>" +
        "<label class='control-label'>学科</label>" +
        "<select id='subject' class='form-control valid'>" +
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
        "<button type='button' class='btn btn-rounded' onclick='searchPoint()'><span class='entypo-search'></span>&nbsp;&nbsp;检 索</button>&nbsp;&nbsp;" +
        "</div>" +
        "</div>" +
        "</form>" +
        "</div>" +
        "<div class='table-responsive'>" +
        "<table class='table table-bordered table-striped cf'>" +
        "<thead class='cf'>" +
        "<tr>" +
        "<th align='center' class='col-lg-1'><input type='checkbox' name='selectAll' onclick='selectAllPoints()'></th>" +
        "<th align='center' class='col-lg-3'>标题</th>" +
        "<th align='center' class='col-lg-7'>内容</th>" +
        "</tr>" +
        "</thead>" +
        "<tbody data-bind='foreach: pointList'>" +
        "<tr>" +
        "<td align='center'><input type='checkbox' name='pointId' data-bind='value: p_id, checked: checked' onclick='getSelectPoints()'></td>" +
        "<td align='left'><span data-bind='text: title'></span></td>" +
        "<td align='left'><span data-bind='text: content'></span></td>" +
        "</tr>" +
        "</tbody>" +
        "</table>" +
        "</div></div>";
    var dialogPoint = $.dialog({
        icon: "icon icon-plus",
        title: "添加相关知识点",
        content: html,
        columnClass: "col-lg-12"
    });
    ko.applyBindings(vm,document.getElementById("pointDiv"));
    vm.pointList(vm.points());
}

// 检索知识点
function searchPoint(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startPos = 1;
    postObj.pageSize = 999;
    postObj.query = $("#key").val();
    postObj.stage = $("#stage").val();
    postObj.grade = $("#grade").val();
    postObj.subject = $("#subject").val();
    util.callServerFunction('adminGetStudyPointList', postObj, function (data) {
        if (data.statusCode == 900) {
            var list = [];
            if(vm.points().length > 0){
                for(var j=0;j<vm.points().length;j++){
                    list.push(vm.points()[j]);
                }
            }
            for(var i=0;i<data.list.length;i++){
                if(vm.points().length > 0){
                    if(checkPoint(data.list[i].p_id)){
                        data.list[i].checked = "";
                        list.push(data.list[i]);
                    }
                }else{
                    data.list[i].checked = "";
                    list.push(data.list[i]);
                }
            }
            vm.pointList(list);
        } else {
            alert(data.message);
            errorCodeApi(data.statusCode);
        }
    });
}

// 检验已选知识点和检索出的知识点结果中是否存在重复
function checkPoint(p_id){
    for(var i=0;i<vm.points().length;i++){
        if(vm.points()[i].p_id == p_id){
           return false;
        }
    }
    return true;
}

// 选择/取消全选知识点
function selectAllPoints(){
    if($("input:checkbox[name='selectAll']").prop("checked")){
        $("input:checkbox[name='pointId']").each(function(){
            $(this).prop("checked",true);
        });
    }else{
        $("input:checkbox[name='pointId']").each(function(){
            $(this).prop("checked",false);
        });
    }
    getSelectPoints();
}

// 获取已选择知识点
function getSelectPoints(){
    var list = [];
    $("input:checkbox[name='pointId']").each(function(){
        if($(this).prop("checked")){
            for(var i=0;i<vm.pointList().length;i++){
                if(vm.pointList()[i].p_id == $(this).val()){
                    vm.pointList()[i].checked = vm.pointList()[i].p_id;
                    list.push(vm.pointList()[i]);
                }
            }
        }
    });
    vm.points(list);
}

// 检索题目
function searchQuestion(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startPos = 1;
    postObj.pageSize = 999;
    postObj.query = $("#keyQ").val();
    postObj.stage = $("#stageQ").val();
    postObj.grade = $("#gradeQ").val();
    postObj.subject = $("#subjectQ").val();
    postObj.status = $("#status").val();
    postObj.u_id = $("#u_id").val();
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

// 选择题干
function selectQuestion(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.q_id = this.q_id;
    util.callServerFunction('adminGetFullQuestion', postObj, function (data) {
        if (data.statusCode == 900) {
            json = data.info;
            st.loadJSON(json);
            st.compute();
            st.geom.translate(new $jit.Complex(-200, 0), "current");
            st.onClick(st.root);
        } else {
            alert(data.message);
            errorCodeApi(data.statusCode);
        }
    });
}

// 删除知识点
function deletePoint(){
    var ponit = this;
    $.confirm({
        icon: 'fontawesome-warning-sign',
        title: '提示信息',
        content: "确定要删除此知识点吗？",
        confirmButton: "<span class='fontawesome-ok'></span>&nbsp;&nbsp;确定",
        cancelButton: "<span class='fontawesome-remove'></span>&nbsp;&nbsp;取消",
        confirm: function() {
            vm.points.splice(vm.points.indexOf(ponit),1);
        }
    })
}

// 删除相关问题
function deleteRelated(){
    var ponit = this;
    $.confirm({
        icon: 'fontawesome-warning-sign',
        title: '提示信息',
        content: "确定要删除此知识点吗？",
        confirmButton: "<span class='fontawesome-ok'></span>&nbsp;&nbsp;确定",
        cancelButton: "<span class='fontawesome-remove'></span>&nbsp;&nbsp;取消",
        confirm: function() {
            vm.relateds.splice(vm.relateds.indexOf(ponit),1);
            util.toast("删除相关问题成功", "success", "系统提示");
        }
    })
}

// 删除提高问题
function deleteEnhance(){
    var ponit = this;
    $.confirm({
        icon: 'fontawesome-warning-sign',
        title: '提示信息',
        content: "确定要删除此知识点吗？",
        confirmButton: "<span class='fontawesome-ok'></span>&nbsp;&nbsp;确定",
        cancelButton: "<span class='fontawesome-remove'></span>&nbsp;&nbsp;取消",
        confirm: function() {
            vm.enhances.splice(vm.enhances.indexOf(ponit),1);
            util.toast("删除提高问题成功", "success", "系统提示");
        }
    })
}

// 添加相关问题
function addRelated(){
    vm.relateds.push(this);
    util.toast("添加相关问题成功", "success", "系统提示");
}

// 添加提高问题
function addEnhance(){
    vm.enhances.push(this);
    util.toast("添加提高问题成功", "success", "系统提示");
}

//点击上传图片
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

//上传图片
function uploadImg(){
    if(xhr.readyState == 4 && xhr.status === 200) {//readyState表示文档加载进度,4表示完毕
        vm.questionContent(vm.questionContent() + "<img class='questionImg' src='"+ JSON.parse(xhr.response).filePath +"'>");
        contentPreview();
    }
}

function loadUserList(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    util.callServerFunction('adminGetQuestionAdminList', postObj, function (data) {
        if (data.statusCode == 900) {
            $("#u_id").append("<option value=''>全部</option>");
            for(var i=0;i<data.list.length;i++){
                $("#u_id").append("<option value='"+ data.list[i].userID +"'>"+ data.list[i].userNick +"</option>");
            }
            $('.selectpicker').selectpicker({
                style: 'btn btn-info'
            });
            $('.btn-group').css("width","100%");
        } else {
            errorCodeApi(data.statusCode);
        }
    });
}

function showMsg(){
    $.dialog({
        icon: 'icon icon-warning',
        title: '未通过原因',
        content: this.mag
    })
}

function subReview(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.q_id = this.q_id;
    postObj.status = "pending";
    util.callServerFunction('adminCheckStudyQuestion', postObj, function (data) {
        if (data.statusCode == 900) {
            util.toast("操作成功", "success", "系统提示");
            searchQuestion();
        } else {
            alert(data.message);
            errorCodeApi(data.statusCode);
        }
    });
}

var nodeId = ""
    ,nodeType = ""
    ,parentId = ""
    ,json = {}
    ,st = null
    ,xhr = new XMLHttpRequest();
var viewModel = function(){
    // 问题属性
    this.questionType = ko.observable("");
    this.stage = ko.observable("");
    this.grade = ko.observable("");
    this.subject = ko.observable("");
    this.questionContent = ko.observable("");
    this.questionContentPreview = ko.observable("");
    this.pointId = ko.observable("");
    this.pointPreview = ko.observable("");
    this.relatedId = ko.observable("");
    this.relatedPreview = ko.observable("");
    this.enhanceId = ko.observable("");
    this.enhancePreview = ko.observable("");
    this.remark = ko.observable("");
    this.remarkPreview = ko.observable("");
    this.difficulty = ko.observable("");

    // 选项属性
    this.optionType = ko.observable("");
    this.flag = ko.observable("");
    this.correct = ko.observable("");
    this.optionContent = ko.observable("");
    this.optionContentPreview = ko.observable("");
    this.hintContent = ko.observable("");
    this.hintContentPreview = ko.observable("");

    // 知识点
    this.pointList = ko.observableArray();
    this.points = ko.observableArray();
    this.deletePoint = deletePoint;

    // 相关问题
    this.relateds = ko.observableArray();
    this.deleteRelated = deleteRelated;
    this.addRelated = addRelated;

    // 提高问题
    this.enhances = ko.observableArray();
    this.deleteEnhance = deleteEnhance;
    this.addEnhance = addEnhance;

    // 问题
    this.questionList = ko.observableArray();
    this.selectQuestion = selectQuestion;
    this.showMsg = showMsg;
    this.subReview = subReview;
}
var vm = new viewModel();
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
MathJax.Hub.Queue(initMathJax);
ko.applyBindings(vm, document.getElementById("studyQuestionManage"));
$("#pic").change(function() {
    var file = this.files[0];
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
        // 通过 reader.result 来访问生成的 DataURL
        var blob = dataURLtoBlob(reader.result);
        var fd = new FormData();
        fd.append("upload", blob, "image.png");
        xhr.open('POST', '/upload', true);
        xhr.onreadystatechange = uploadImg;
        xhr.send(fd);
    };
});
initJit();
loadUserList();