/**
 * Created by MengLei on 2015/7/21.
 */

function loadGoodDetail(goodId){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.goodId = goodId;
    util.callServerFunction('getGoodDetail', postObj, function (data) {
        if (data.statusCode == 900) {
            vm.price(data.goodDetail.price);
            vm.type(data.goodDetail.type);
            vm.deliver(data.goodDetail.deliver);
            vm.goodName(data.goodDetail.goodName);
            vm.stock(data.goodDetail.stock);
            for(var i=0; i<data.goodDetail.goodPic.length; i++){
                vm.goodPic.push({index:i,src: data.goodDetail.goodPic[i]});
            }
            if(data.goodDetail.validTime < new Date(util.getTimestamp(1)).getTime() || !data.goodDetail.valid){
                vm.sign(1);
            }else if(data.goodDetail.stock<=0){
                vm.sign(2);
            }else{
                vm.sign(3);
            }
            vm.goodInfo(data.goodDetail.goodInfo);
            //initSlider($);//banner slider数据加载完成之后，才init这个slider，否则会出错
            initJssor();
            $("#element").addClass('animated fadeIn');
            sendLog("访问商城商品-"+util.serviceConfig, {商品名称: data.goodDetail.goodName});
        }else{
            //获取商品列表失败
            $.dialog({
                title: '提示信息',
                content:"获取商品信息失败！"
            })
            setCloseBtn();
        }
    });
}

function loadUserPhone(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    util.callServerFunction('getUserPhone', postObj, function (data) {
        if (data.statusCode == 900) {
            vm.phoneNum(data.phone);
        }
    });
}

function onExchange(){
    //进入兑换信息的填写页面
    if(util.getSessionStorage("userID") == "" || util.getSessionStorage("userID") == "undefined" || util.getSessionStorage("userID") == null){
        util.js2Phone();
    }else{
        switch (vm.type()) {
            case 'api':
                var html = "<div>" +
                    "<div class='form-group'>" +
                    "<label for='mailName'>积分兑换的流量将直接充入您的注册手机号中，请确认手机运营商是否符合，如果兑换了不符合的流量包导致流量兑换失败，索课科技不负任何责任。</label>" +
                    "</div>" +
                    "<div class='form-group'>" +
                    "<label for='mailPhone'>您的手机号：" + vm.phoneNum() + "</label>" +
                    "</div>" +
                    "</div>" +
                    "<div style='margin: 0px auto;width: 5em;line-height: 2em;border-radius: 30px;background-color: #f53535;text-align: center;color: white;margin-top: 1em' onclick='confirmExchange()'>兑 换</div>";
                dialog = $.dialog({
                    title: '兑换信息',
                    content: html
                })
                setCloseBtn();
                break;
            case 'api_hjjd':
                var html = "<div>" +
                    "<div class='form-group'>" +
                    "<label for='mailName'>姓名</label>" +
                    "<input type='text' class='form-control' id='hjjdName' placeholder='点击输入'>" +
                    "</div>" +
                    "<div class='form-group'>" +
                    "<label for='mailPhone'>身份证</label>" +
                    "<input type='text' class='form-control' id='hjjdIDCode' placeholder='点击输入'>" +
                    "</div>" +
                    "<div class='form-group'>" +
                    "<label for='mailAddress'>手机号</label>" +
                    "<input type='text' class='form-control' id='hjjdPhone' placeholder='点击输入'>" +
                    "</div>" +
                    "<div class='form-group'>" +
                    "<label for='mailPostCode'>备注</label>" +
                    "<textarea class='form-control' rows='3' id='remarks2' placeholder='点击输入'></textarea>" +
                    "</div>" +
                    "</div>" +
                    "<div style='margin: 0px auto;width: 5em;line-height: 2em;border-radius: 30px;background-color: #f53535;text-align: center;color: white;margin-top: 1em' onclick='confirmExchange()'>兑 换</div>";
                dialog = $.dialog({
                    title: '填写兑换信息',
                    content: html
                })
                setCloseBtn();
                break;
            case 'rSale':
            {
                switch (vm.deliver()) {
                    case 'mail':
                        var html = "<div>" +
                            "<div class='form-group'>" +
                            "<label for='mailName'>收件人姓名</label>" +
                            "<input type='text' class='form-control' id='mailName' placeholder='点击输入'>" +
                            "</div>" +
                            "<div class='form-group'>" +
                            "<label for='mailPhone'>收件人手机</label>" +
                            "<input type='tel' pattern='[0-9]*' class='form-control' id='mailPhone' placeholder='点击输入'>" +
                            "</div>" +
                            "<div class='form-group'>" +
                            "<label for='mailAddress'>收件人地址</label>" +
                            "<input type='text' class='form-control' id='mailAddress' placeholder='点击输入'>" +
                            "</div>" +
                            "<div class='form-group'>" +
                            "<label for='mailAddress'>邮编</label>" +
                            "<input type='text' class='form-control' id='mailPostCode' placeholder='点击输入'>" +
                            "</div>" +
                            "<div class='form-group'>" +
                            "<label for='mailPostCode'>备注</label>" +
                            "<textarea class='form-control' rows='3' id='remarks1' placeholder='点击输入'></textarea>" +
                            "</div>" +
                            "</div>" +
                            "<div style='margin: 0px auto;width: 5em;line-height: 2em;border-radius: 30px;background-color: #f53535;text-align: center;color: white;margin-top: 1em' onclick='confirmExchange()'>兑 换</div>";
                        dialog = $.dialog({
                            title: '填写兑换信息',
                            content: html
                        })
                        setCloseBtn();
                        break;
                    case 'code':
                        confirmExchange();
                        break;
                    default :
                        break;
                }
            }
                break;
            default :
                break;
        }
    }
}

function confirmExchange(){
    var postObj = {
        userID: util.getSessionStorage("userID"),
        authSign: util.getSessionStorage("authSign"),
        goodId: util.querystring('goodId')[0]
    };
    switch (vm.type()){
        case 'api':
            //调用api兑换，手机号
            postObj.phone = vm.phoneNum();
            break;
        case 'api_hjjd':
            //皇家极地，姓名、身份证、手机号
            postObj.name = $('#hjjdName').val();
            postObj.idCode = $('#hjjdIDCode').val();
            postObj.phone = $('#hjjdPhone').val();
            postObj.remarks = $('#remarks2').val();
            break;
        case 'rSale':
        {
            switch (vm.deliver()){
                case 'mail':
                    //实物物流，姓名，手机，地址，邮编
                    postObj.name = $('#mailName').val();
                    postObj.phone = $('#mailPhone').val();
                    postObj.address = $('#mailAddress').val();
                    postObj.postCode = $('#mailPostCode').val();
                    postObj.remarks = $('#remarks1').val();
                    break;
                case 'code':
                    //实物兑换码
                    break;
                default :
                    break;
            }
        }
            break;
        default :
            break;
    }

    if($('#mailName').val()=="" && vm.deliver()=="mail"){
        $.dialog({
            title: '提示信息',
            content: "请输入收件人姓名！"
        })
        setCloseBtn();
    }else if($('#mailPhone').val()=="" && vm.deliver()=="mail"){
        $.dialog({
            title: '提示信息',
            content: "请输入收件人手机号码！"
        })
        setCloseBtn();
    }else if(!util.checkMobile($('#mailPhone').val()) && vm.deliver()=="mail"){
        $.dialog({
            title: '提示信息',
            content: "请输入正确的手机号码！"
        })
        setCloseBtn();
    }else if($('#mailAddress').val()=="" && vm.deliver()=="mail"){
        $.dialog({
            title: '提示信息',
            content: "请输入收件人地址！"
        })
        setCloseBtn();
    }else if($('#mailPostCode').val()=="" && vm.deliver()=="mail"){
        $.dialog({
            title: '提示信息',
            content: "请输入邮政编码！"
        })
        setCloseBtn();
    }else if(!util.checkPostCode($('#mailPostCode').val()) && vm.deliver()=="mail"){
        $.dialog({
            title: '提示信息',
            content: "请输入正确的邮政编码！"
        })
        setCloseBtn();
    }else {
        util.callServerFunction('exchangeBonus', postObj, function (data) {
            if (data.statusCode == 900) {
                var html = "";
                if (vm.type() == "rSale" && vm.deliver() == "code") {
                    html = "<div class='form-group'>" +
                        "<label for='mailName'>兑换成功！</label>" +
                        "</div>" +
                        "<div class='form-group'>" +
                        "<label for='mailPhone'>请牢记兑换码：" + data.code + "</label>" +
                        "</div>";
                } else {
                    dialog.close();
                    html = "<div class='form-group'>" +
                        "<label for='mailName'>兑换成功！</label>" +
                        "</div>";
                }
                $.dialog({
                    title: '提示信息',
                    content: html
                })
                sendLog("兑换商城商品（成功）-"+util.serviceConfig, {商品名称: vm.goodName()});
                setCloseBtn();
            } else {
                sendLog("兑换商城商品（失败）-"+util.serviceConfig, {商品名称: vm.goodName()});
                $.dialog({
                    icon: 'glyphicon glyphicon-exclamation-sign',
                    title: '提示信息',
                    content: "您的积分不足，多赚些积分再来吧！"
                })
                setCloseBtn();
            }
        });
    }
}

function initJssor(){
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
    var jssor_1_slider = new $JssorSlider$("jssor_2", jssor_1_options);
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
}

function setBgColorIn(obj){
    $(obj).css("backgroundColor","#dc3030");
}

function setBgColorOut(obj){
    $(obj).css("backgroundColor","#f53535");
}

function setCloseBtn(){
    $(".glyphicon-remove").empty();
    $(".glyphicon-remove").append("<div style='width: 1.7em;height: 1.7em;background-color: #999999;border-radius: 1em;line-height: 1.7em'>X</div>");
    $(".row").css("backgroundColor","rgba(0,0,0,0)");
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
    this.price = ko.observable();
    this.type = ko.observable();
    this.valid = ko.observable();
    this.deliver = ko.observable();
    this.goodId = ko.observable();
    this.goodName = ko.observable();
    this.goodInfo = ko.observable();
    this.goodPic = ko.observableArray();
    this.type = ko.observable();
    this.phoneNum = ko.observable();
    this.stock = ko.observable();
    this.code = ko.observable();
    this.sign = ko.observable();
};
var vm = new viewModel(), dialog = "";
$(document).ready(function() {
    FastClick.attach(document.body);
    ko.applyBindings(vm);
    var goodId = util.querystring('goodId')[0];
    loadGoodDetail(goodId);
    loadUserPhone();
    vm.code('none');
});