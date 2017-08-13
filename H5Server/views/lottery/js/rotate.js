    var inRotation = false;
    var dialog = "";
    function rotateStart(awards, angle, text, detailId, deliver, code) {  //awards:奖项，angle:奖项对应的角度
        // navigator.vibrate(1000); 移动端震动
        $('.btn-lottery').stopRotate();
        $(".btn-lottery").rotate({
            angle: 0,
            duration: 5000,
            animateTo: angle + 1440, //angle是图片上各奖项对应的角度，1440是我要让指针旋转4圈。所以最后的结束的角度就是这样子^^
            callback: function () {
                var html = "";
                if(deliver == "mail"){
                    html = "<div>"+text+"</div><div style='margin-top: 2em'>" +
                        "<div class='form-group'>" +
                        "<label for='mailName'>收件人姓名</label>" +
                        "<input type='text' class='form-control' id='mailName' placeholder='请输入收件人姓名'>" +
                        "</div>" +
                        "<div class='form-group'>" +
                        "<label for='mailPhone'>收件人手机</label>" +
                        "<input type='text' class='form-control' id='mailPhone' placeholder='请输入收件人手机号码'>" +
                        "</div>" +
                        "<div class='form-group'>" +
                        "<label for='mailAddress'>收件人地址</label>" +
                        "<input type='text' class='form-control' id='mailAddress' placeholder='请输入收件人地址'>" +
                        "</div>" +
                        "<div class='form-group'>" +
                        "<label for='mailAddress'>邮编</label>" +
                        "<input type='text' class='form-control' id='mailPostCode' placeholder='请输入邮编'>" +
                        "</div>" +
                        "<div class='form-group'>" +
                        "<label for='mailPostCode'>备注</label>" +
                        "<textarea class='form-control' rows='3' id='remark' placeholder='年龄；性别；生日或对你来说最特别的日子；近期的小愿望'></textarea>" +
                        "<input type='hidden' id='detailId' value='"+detailId+"' />" +
                        "</div>" +
                        "</div>" +
                        "<div align='center'><button class='btn btn-success' onclick='confirmUserInfo()'>确 定</button></div>";
                    dialog = $.dialog({
                        icon: 'glyphicon glyphicon-gift',
                        title: '开奖结果',
                        backgroundDismiss: false,
                        content: html
                    })
                }else if(deliver == "api"){
                    var postObj = {};
                    postObj.userID = util.getSessionStorage("userID");
                    postObj.authSign = util.getSessionStorage("authSign");
                    util.callServerFunction('getUserPhone', postObj, function (data) {
                        if (data.statusCode == 900) {
                            if(data.phone == "" || data.phone == undefined){
                                html = "<div class='form-group'>" +
                                    "<label for='mailName'>请填写您的手机号。</label>" +
                                    "</div>" +
                                    "<div class='form-group'>" +
                                    "<label for='mailPhone'>您的手机号：<input type='text' id='userPhone'></label>" +
                                    "</div>" +
                                    "<div align='center'><button class='btn btn-success' onclick=\"subUserPhone('"+ detailId +"')\">提 交</button></div>";
                            }else{
                                html = "<div class='form-group'>" +
                                    "<label for='mailName'>中奖获得的流量将直接充入您的注册手机号中。</label>" +
                                    "</div>";
                            }
                        }
                        dialog = $.dialog({
                            icon: 'glyphicon glyphicon-gift',
                            title: '开奖结果',
                            backgroundDismiss: false,
                            content: html
                        })
                    });
                }else if(deliver == "bonus"){
                    var html = "<div>"+text+"</div><div style='margin-top: 2em'>" +
                        "<label for='mailName'>10积分已充入您使用的账号中，稍后请注意查收。</label>" +
                        "</div>";
                    dialog = $.dialog({
                        icon: 'glyphicon glyphicon-gift',
                        title: '开奖结果',
                        backgroundDismiss: false,
                        content: html
                    })
                }else if(deliver == "code"){
                    var html = "<div>"+text+"</div><div style='margin-top: 2em'>" +
                        "<label for='mailName'>价值100元京东购物卡兑换码："+ code +"</label>" +
                        "</div>";
                    dialog = $.dialog({
                        icon: 'glyphicon glyphicon-gift',
                        title: '开奖结果',
                        backgroundDismiss: false,
                        content: html
                    })
                }else{
                    html = "<div>"+text+"</div><br/><div align='center'><button class='btn btn-success' onclick='onceAgain()'>再来一次</button></div>";
                    dialog = $.dialog({
                        icon: 'glyphicon glyphicon-gift',
                        title: '开奖结果',
                        backgroundDismiss: false,
                        content: html
                    })
                }
                inRotation = false;
            }
        });
    };

    $(".btn-lottery").rotate({
        bind: {
            click: function () {
                var time = [1];
                time = time[Math.floor(Math.random() * time.length)];
                if (time == 1) {
                    onceAgain();
                }
            }
        }
    });

    function subUserPhone(detailId){
        if($("#userPhone").val() == "") {
            $.dialog({
                icon: 'glyphicon glyphicon-hourglass',
                title: '温馨提示',
                content: "请填写您的手机号码！"
            })
        } else {
            var postObj = {
                userID: util.getSessionStorage("userID"),
                authSign: util.getSessionStorage("authSign"),
                detailId: detailId,
                phone: $("#userPhone").val()
            };
            util.callServerFunction('editDeliver', postObj, function (data) {
                if (data.statusCode == 900) {
                    dialog.close();
                    $.dialog({
                        icon: 'glyphicon glyphicon-hourglass',
                        title: '温馨提示',
                        content: "兑换成功！"
                    })
                }
            });
        }
    }

    function onceAgain(){
        if(!inRotation) {
            if(dialog!=""){
                dialog.close();
            }
            inRotation = true;
            var postObj = {};
            postObj.userID = util.getSessionStorage("userID");
            postObj.authSign = util.getSessionStorage("authSign");
            postObj.goodId = util.getUrlParameter("goodId");
            //postObj.goodId = "56ca9c5199707ed15b2ae1b8";
            util.callServerFunction('exchangeBonus', postObj, function (data) {
                if (data.statusCode == 900) {
                    var rank = parseInt(data.rank);
                    var detailId = data.detailId;
                    var code = data.code;
                    var postObj = {};
                    postObj.userID = util.getSessionStorage("userID");
                    postObj.authSign = util.getSessionStorage("authSign");
                    postObj.goodId = util.getUrlParameter("goodId");
                    //postObj.goodId = "56ca9c5199707ed15b2ae1b8";
                    util.callServerFunction('getGoodDetail',postObj, function(data){
                        if(data.statusCode == 900){
                            var deliver,rankDesc;
                            for(var j=0;j<data.goodDetail.detail.length;j++){
                                $.each(data.goodDetail.detail[j],function(key,value){
                                    if(key == "rank" && value == rank){
                                        deliver = data.goodDetail.detail[j].deliver;
                                        rankDesc = data.goodDetail.detail[j].rankDesc;
                                    }
                                });
                            }
                            sendLog("参加转盘抽奖-"+util.serviceConfig, {奖项: rankDesc==undefined?'未中奖':rankDesc});
                            switch(rank){
                                case 1 :
                                    rotateStart(rank, 157, '人品大爆炸！恭喜抽中'+rankDesc+'！你没有看错！就是'+rankDesc+'！小主洗干净等着我们送货上门吧！', detailId, deliver, code);
                                    break;
                                case 2 :
                                    rotateStart(rank, 247, '人品大爆发！恭喜抽中'+rankDesc+'！', detailId, deliver, code);
                                    break;
                                case 3 :
                                    rotateStart(rank, 67, '人品大爆发！恭喜抽中'+rankDesc+'！', detailId, deliver, code);
                                    break;
                                case 4 :
                                    rotateStart(rank, 337, '人品大爆发！恭喜抽中'+rankDesc+'！', detailId, deliver, code);
                                    break;
                                case 0 :
                                    var angle = [22, 112, 202, 292];
                                    angle = angle[Math.floor(Math.random() * angle.length)];
                                    rotateStart(rank, angle, '哎呀，你离奖品仅差0.1厘米，下次换个手试试吧！', "","");
                                    break;
                            }
                        }else{
                            util.errorCodeApi(data.statusCode);
                        }
                    });
                } else if(data.statusCode == 936) {
                    $.dialog({
                        icon: 'glyphicon glyphicon-hourglass',
                        title: '温馨提示',
                        content: "今日人品已耗光，洗洗手，明天再战吧^_^"
                    })
                    inRotation = false;
                } else if(data.statusCode == 933) {
                    $.dialog({
                        icon: 'glyphicon glyphicon-hourglass',
                        title: '温馨提示',
                        content: "亲爱哒，您的积分余额不足，赚取更多积分再来抽奖吧！"
                    })
                    inRotation = false;
                } else if(data.statusCode == 902) {
                    $.dialog({
                        icon: 'glyphicon glyphicon-hourglass',
                        title: '温馨提示',
                        content: "亲爱哒，请先登录才能参与抽奖呦！"
                    })
                    inRotation = false;
                } else {
                    util.errorCodeApi(data.statusCode);
                }
            });
        }
    }

    function confirmUserInfo(){
        if(dialog!=""){
            dialog.close();
        }
        if($("#mailName").val()==""){
            $.dialog({
                icon: 'icon icon-warning',
                title: '提示信息',
                content:"请填写收件人姓名！"
            })
        }else if($("#mailPhone").val()==""){
            $.dialog({
                icon: 'icon icon-warning',
                title: '提示信息',
                content:"请填写收件人手机号码！"
            })
        }else if($("#mailAddress").val()==""){
            $.dialog({
                icon: 'icon icon-warning',
                title: '提示信息',
                content:"请填写收件人地址！"
            })
        }else{
            var postObj = {};
            postObj.userID = util.getSessionStorage("userID");
            postObj.authSign = util.getSessionStorage("authSign");
            postObj.name = $("#mailName").val();
            postObj.phone = $("#mailPhone").val();
            postObj.address = $("#mailAddress").val();
            postObj.postCode = $("#mailPostCode").val();
            postObj.detailId = $("#detailId").val();
            postObj.remark = $("#remark").val();
            util.callServerFunction('editDeliver',postObj, function(data){
                if(data.statusCode == 900){
                    $.dialog({
                        icon: 'icon icon-checkmark',
                        title: '提示信息',
                        content: "邮寄信息已提交，我们会尽快将奖品送到您身边！"
                    });
                }else{
                    util.errorCodeApi(data.statusCode);
                }
            });
        }
    }

    function initRule(){
        var postObj = {};
        postObj.userID = util.getSessionStorage("userID");
        postObj.authSign = util.getSessionStorage("authSign");
        postObj.goodId = util.getUrlParameter("goodId");
        //postObj.goodId = "56ca9c5199707ed15b2ae1b8";
        util.callServerFunction('getGoodDetail',postObj, function(data){
            if(data.statusCode == 900){
                for(var i=0;i<data.goodDetail.detail.length;i++){
                    $("#awards").append("<p>"+data.goodDetail.detail[i].rankDesc+"："+data.goodDetail.detail[i].name+"</p>");
                }
                $("#explain").append(data.goodDetail.goodInfo);
            }else{
                util.errorCodeApi(data.statusCode);
            }
        });
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

    var analytics = AV.analytics({
        // 设置 AppId
        appId: "593tvxmvvbzlb178tszjl1l21ewztqu805768lno6ttk5r82",
        // 设置 AppKey
        appKey: "8w60idssacdpsc0kni8vwb4jgapoy8h8ze1px0ryaxcsj35l",
        // 你当前应用或者想要指定的版本号（自定义）
        version: '2016.3.15',
        // 你当前应用的渠道或者你想指定的渠道（自定义）
        channel: '商城首页统计-'+util.serviceConfig
    });

    var viewModel = function(){
        this.details = ko.observableArray();
    }
    var vm = new viewModel();
    ko.applyBindings(vm);
    initRule();