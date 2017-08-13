/**
 * Created by MengLei on 2016-05-16.
 */
"use strict";
const ALY = require('aliyun-sdk');
const fs = require('fs-extra');

const oss = new ALY.OSS({
    accessKeyId: 'JoUGHPTDNRPSkRIn',
    secretAccessKey: 'hUHIEmpsmYCXkpJYLMk3Rck5MMfb2z',
    //endpoint: 'http://oss-cn-beijing.aliyuncs.com',  //外网使用
    endpoint: 'http://oss-cn-beijing-internal.aliyuncs.com',  //阿里云内网使用，速度无限制
    // 这是 oss sdk 目前支持最新的 api 版本, 不需要修改
    apiVersion: '2013-10-15'
});

fs.readFile('back.tar', (err, bytes)=>{
    if(err){
        return console.log(err);
    }
    oss.putObject({
        Bucket: 'callcall-server',
        Key: 'back.tar',                 // 注意, Key 的值不能以 / 开头, 否则会返回错误.
        Body: bytes,
        AccessControlAllowOrigin: '',
        CacheControl: 'no-cache'
    }, function (err, data) {
        if (err) {
            return console.log(err.message);
        }
        console.log(data);
    });
});