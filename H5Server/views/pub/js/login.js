/**
 * Created by hjy on 2015/11/3 0003.
 */

function login(){
    if($("#email").val()==""){
        $("#remark").empty();
        $("#remark").text("*请填写邮箱");
    }else if($("#passwd").val()==""){
        $("#remark").empty();
        $("#remark").text("*请填写密码");
    }else{
        var postObj = {
            email: $("#email").val(),
            passwd: util.sha256($("#passwd").val())
        };
        util.callServerFunction('pubLogin', postObj, function(resp){
            if(resp.statusCode == 900){
                util.setSessionStorage("userID",resp.userID);
                util.setSessionStorage("authSign",resp.authSign);
                util.setSessionStorage("userName",resp.userInfo.name);
                util.setSessionStorage("nick",resp.nick);
                window.location.href = "/pub/index.html";
            }else{
                $("#remark").empty();
                $("#remark").text("*"+resp.message);
            }
        });
    }
}

function initRegister(){
    var html = "<span id='cEmail'></span>"  +
        "<input type='text' id='emailRegister' placeholder='输入邮箱'>" +
        "<span id='cPasswd'></span>" +
        "<input type='password' id='passwdRegister' placeholder='输入密码'>" +
        "<span id='cPasswdCheck'></span>" +
        "<input type='password' id='passwdRegisterCheck' placeholder='输入确认密码'>" +
        "<span id='cNick'></span>" +
        "<input type='text' id='nickRegister' placeholder='输入公众号名称'>" +
        "<span id='cIntro'></span>" +
        "<textarea id='introRegister' placeholder='输入自我介绍' rows='4'></textarea>" +
        "<button class='button expand info' onclick='register()' style='color:#006dcc'>注 册</button>"+
        "<button class='button expand secondary' onclick='closeRegister()' style='color:#006dcc'>关 闭</button>";
    dialog = util.dialog("注册新用户",html,"l");
}

function closeRegister(){
    dialog.close();
}

function register(){
    var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
    $("#cEmail,#cPasswd,#cPasswdCheck,#cNick,#cIntro").empty();
    if($("#emailRegister").val() == ""){
        $("#cEmail").text("*请填写邮箱");
        $("#emailRegister").focus();
    }else if(!reg.test($("#emailRegister").val())){
        $("#cEmail").text("*请填写正确的邮箱");
        $("#emailRegister").val("");
        $("#emailRegister").focus();
    }else if($("#passwdRegister").val() == ""){
        $("#cPasswd").text("*请填写密码");
        $("#passwdRegister").focus();
    }else if($("#passwdRegisterCheck").val() == ""){
        $("#cPasswdCheck").text("*请填写确认密码");
        $("#passwdRegisterCheck").focus();
    }else if($("#passwdRegister").val()!=$("#passwdRegisterCheck").val()){
        $("#cPasswdCheck").text("*两次输入的密码不相同");
        $("#passwdRegister").val("");
        $("#passwdRegisterCheck").val("");
        $("#passwdRegister").focus();
    }else if($("#nickRegister").val() == ""){
        $("#cNick").text("*请填写公众号名称");
        $("#nickRegister").focus();
    }else if($("#introRegister").val() == ""){
        $("#cIntro").text("*请填写自我介绍");
        $("#introRegister").focus();
    }else{
        var postObj = {
            email: $("#emailRegister").val()
        }
        util.callServerFunction('pubCheckEmail', postObj, function(resp){
            if(resp.statusCode == 900){
                postObj = {
                    email: $("#emailRegister").val(),
                    passwd: util.sha256($("#passwdRegister").val()),
                    nick: $("#nickRegister").val(),
                    intro: $("#intro").val()
                }
                util.callServerFunction('pubRegister', postObj, function(resp){
                    if(resp.statusCode == 900){
                        var email = $("#emailRegister").val();
                        $("#email").val(email);
                        util.toast("注册成功！","success","系统提示");
                        dialog.close();
                        util.alert("温馨提示","<div align='center'><a href='"+ util.url2Email(email) +"' target='_blank'>体验更多功能，点击激活账号</a></div>","l");
                    }else{
                        util.toast("注册失败！","success","系统提示");
                    }
                });
            }else{
                $("#cEmail").text("*该邮箱已被注册");
                $("#emailRegister").focus();
            }
        });
    }
}

$(document).foundation();
document.onkeydown = function(event){
    e = event ? event :(window.event ? window.event : null);
    if(e.keyCode==13){
        login();
    }
}