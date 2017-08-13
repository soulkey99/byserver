/**
 * Created by MengLei on 2015/8/17.
 */

//版本号管理工具
module.exports = {
    parse: parse,
    compare: compare
};

function parse(v){
    if(v.toLowerCase().indexOf('v') >= 0){
        v = v.slice(1, v.length);
    }
}

//比较版本号
function compare(a, b) {
    //
    var va = a.split('.');
    var vb = b.split('.');
    for (var i = 0; i < 4; i++) {
        if (va[i]) {
            va[i] = parseInt(va[i]);
        } else {
            va[i] = 0;
        }
        if (vb[i]) {
            vb[i] = parseInt(vb[i]);
        } else {
            vb[i] = 0;
        }
    }
    for (var j=0; j < 3; j++) {
        j++;
        if (va[j] < vb[j]) {
            return -1;
        } else if (va[j] > vb[j]) {
            return 1;
        }
    }
    if (va[3] < vb[3]) {
        return -1;
    } else if (va[3] > vb[3]) {
        return 1;
    }else{
        return 0;
    }
}



