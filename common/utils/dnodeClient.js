/**
 * Created by MengLei on 2015/6/3.
 */

var dnode = require('dnode');
var serverConfig = require('../../config').dnodeConfig;

function run(dest, method, params, callback) {
    var d = dnode.connect(serverConfig[dest]);
    d.on('remote', onRemote);
    d.on('error', onError);

    function onRemote(remote) {
        if (remote[method]) {
            remote[method](params, function (res) {
                callback(null, res);
                d.end();
            });
        } else {
            callback({message: 'error: method undefined.'});
            d.end();
        }
    }

    function onError(e) {
        callback(e);
        d.end();
    }
}

module.exports = run;

//run('orderServer', 'test', 5, function(e, r){
//    console.log(e);
//    console.log(r);
//})