/**
 * Created by MengLei on 2016/3/23.
 */
"use strict";
//定义全局SKError类，在普通Error类上面增加一个错误码
class SKError extends Error{
    constructor(msg, code){
        super(msg);
        this.code = code;
    }
}
global.SKError = SKError;
