/**
 * Created by MengLei on 2015/11/2.
 */

var config = require('../../../../config');
var log = require('../../../../utils/log').h5;
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var options = {
    host: 'smtp.mxhichina.com',
    port: 465,
    secure: true,
    auth: config.smtp_auth
};
var transporter = nodemailer.createTransport(smtpTransport(options));
//向用户的注册邮箱中发送验证邮件

module.exports = function(email, code){
    var link = '';
    if(config.production_mode == 'true'){
        link = 'http://callcall.soulkey99.com:8067/pub/verify.html?code=' + code;
    } else {
        link = 'http://test.soulkey99.com:8067/pub/verify.html?code=' + code;
    }
    var html = "<style class=\"fox_global_style\">div.fox_html_content { line-height: 1.5; }div.fox_html_content { font-size: 10.5pt; font-family: \"Microsoft YaHei UI\"; color: rgb(0, 0, 0); line-height: 1.5; }</style> 欢迎注册，验证链接： <div><a href=" + link + "  yahei=\"\" ui\'\";=\"\" font-size:=\"\" 14px;=\"\" font-weight:=\"\" normal;=\"\" font-style:=\"\" normal;\'=\"\" style=\"font-family: \'\'; font-size: 10.5pt; line-height: 1.5; background-color: window;\">" + link + "</a><span microsoft=\"\" yahei=\"\" ui\'\";=\"\" font-size:=\"\" 14px;=\"\" color:=\"\" rgb(0,=\"\" 0,=\"\" 0);=\"\" background-color:=\"\" rgba(0,=\"\" font-weight:=\"\" normal;=\"\" font-style:=\"\" normal;text-decoration:=\"\" none;\'=\"\" style=\"font-family: \'\'; font-size: 10.5pt; line-height: 1.5; background-color: window;\">&nbsp;</span></div><div>点击验证。</div><span style=\"font-family: &quot;\" microsoft=\"\" yahei=\"\" ui\'\";=\"\" font-size:=\"\" 14px;=\"\" color:=\"\" rgb(0,=\"\" 0,=\"\" 0);=\"\" background-color:=\"\" rgba(0,=\"\" font-weight:=\"\" normal;=\"\" font-style:=\"\" normal;text-decoration:=\"\" none;\'=\"\"></span>";
    transporter.sendMail({
        from: 'CallCall教师<' + config.smtp_auth.user + '>',
        to: email,
        subject: 'CallCall教师【公众号】验证邮件',
        html: html
    }, function(err, info){
        if(err){
            log.error('send email error: ' + JSON.stringify(err));
        }else{
            log.trace('send email to ' + email + ' success.');
        }
    });
};

