/**
 * Created by hjy on 2015/11/30 0030.
 */

function activationEmail(){
    var postObj = {
        code: util.querystring("code")[0]
    }
    util.callServerFunction('pubVerifyEmail', postObj, function(resp){
        if(resp.statusCode == 900){
            $("#nick").text(resp.nick + "，恭喜您激活成功！");
            $("#email").text(resp.email);
        }else{
            $("#nick").text(resp.nick + "，激活失败！");
        }
    });
}

activationEmail();