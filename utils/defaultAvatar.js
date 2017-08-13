/**
 * Created by MengLei on 2015/10/23.
 */

var query = require('query-mobile-phone-area');

//根据手机号归属地，获取对应的默认头像
module.exports = function(num){
    var ret = query(num);
    if(ret){
        switch (ret.province){
            case '北京':
                break;
            default :
                break;
        }
    }else{
        //
    }
};
