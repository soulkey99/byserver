/**
 * Created by MengLei on 2015/10/14.
 */

var fs = require('fs');
var path = require('path');
var mode = require('./../../config').production_mode;

//证书配置
// var opt_prod = {
//     pfx: fs.readFileSync(path.join(__dirname, 'prod.pfx'))
// };
//
// var opt_test = {
//     pfx: fs.readFileSync(path.join(__dirname, 'test.pfx'))
// };

//
var opt_prod2 = {
    key: fs.readFileSync(path.join(__dirname, 'prod.key')),
    cert: fs.readFileSync(path.join(__dirname, 'prod.crt'))
};

var opt_test2 = {
    key: fs.readFileSync(path.join(__dirname, 'test.key')),
    cert: fs.readFileSync(path.join(__dirname, 'test.crt'))
};

module.exports = (mode == 'true' ? opt_prod2 : opt_test2);
