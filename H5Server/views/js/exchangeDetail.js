/**
 * Created by MengLei on 2015/8/6.
 */

function loadExchangeDetail(){
    var postObj={
        userID: util.getSessionStorage('userID'),
        authSign: util.getSessionStorage('authSign'),
        detailId: util.querystring('detailId')[0]
    };
    util.callServerFunction('getExchangeDetail', postObj, function(resp){
        if(resp.statusCode == 900){
            //if(resp.detail.type == 'rSale'){
            if(resp.detail.deliver == 'mail'){
                //实物物流
                vm.type(resp.detail.type);
                vm.deliver('mail');
                vm.name(resp.detail.detail.name);
                vm.phone(resp.detail.detail.phone);
                vm.address(resp.detail.detail.address);
                vm.postCode(resp.detail.detail.postCode);
                vm.status((resp.detail.detail.status == true ? '已发货' : '未发货'));
                vm.postCompany(resp.detail.detail.postCompany);
                vm.postNumber(resp.detail.detail.postNumber);
                vm.remark1(resp.detail.detail.remark);
                if(vm.name()=='' || vm.phone()=='' || vm.address()=='' || vm.postCode()==''){
                    vm.temp(true);
                }
            }else if(resp.detail.deliver == 'code'){
                //实物兑换码
                vm.type(resp.detail.type);
                vm.deliver('code');
                vm.code(resp.detail.detail.code);
                vm.status((resp.detail.detail.status == true ? '已使用' : '未使用'));
            }else if(resp.detail.deliver == 'api'){
                //实物兑换码
                vm.deliver('api');
                vm.phone(resp.detail.detail.phonenum);
            }
            $("#element").addClass('animated fadeIn');
        }
    })
}

function editInfo(){
    vm.isEdit(false);
}

function subInfo(){
    if(vm.name()==""){
        $.dialog({
            icon: 'glyphicon glyphicon-info-sign',
            title: '提示信息',
            content:"请填写收件人姓名！"
        })
    }else if(vm.phone()==""){
        $.dialog({
            icon: 'glyphicon glyphicon-info-sign',
            title: '提示信息',
            content:"请填写收件人联系电话！"
        })
    }else if(vm.address()==""){
        $.dialog({
            icon: 'glyphicon glyphicon-info-sign',
            title: '提示信息',
            content:"请填写收件人地址！"
        })
    }else if(vm.postCode()==""){
        $.dialog({
            icon: 'glyphicon glyphicon-info-sign',
            title: '提示信息',
            content:"请填写邮政编码！"
        })
    }else{
        var postObj={
            userID: util.getSessionStorage('userID'),
            authSign: util.getSessionStorage('authSign'),
            detailId: util.querystring('detailId')[0],
            name: vm.name(),
            phone: vm.phone(),
            address: vm.address(),
            postCode: vm.postCode(),
            remark: vm.remark1()
        };
        util.callServerFunction('editDeliver', postObj, function(resp){
            if(resp.statusCode == 900){
                $.dialog({
                    icon: 'glyphicon glyphicon-ok',
                    title: '提示信息',
                    content:"修改成功！"
                })
                vm.isEdit(true);
            }else{
                util.errorCodeApi(resp.statusCode);
            }
        })
    }
}

var viewModel = function(){
    this.temp = ko.observable(false);
    this.type = ko.observable();
    this.deliver = ko.observable();
    this.code = ko.observable();
    this.name = ko.observable();
    this.address = ko.observable();
    this.phone = ko.observable();
    this.status = ko.observable();
    this.postCompany = ko.observable();
    this.postNumber = ko.observable();
    this.postCode = ko.observable();
    this.remark1 = ko.observable();
    this.isEdit = ko.observable(true);
    this.editInfo = editInfo;
    this.subInfo = subInfo;
};
var vm = new viewModel();
ko.applyBindings(vm);
$(function() {
    FastClick.attach(document.body);
});
loadExchangeDetail();