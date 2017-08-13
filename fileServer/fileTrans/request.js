/**
 * Created by MengLei on 2015/7/15.
 */
var request = require('request');
var fs = require('fs-extra');

var formData = {
    upload: fs.createReadStream('./public/favicon.png')
};

request.post({url: 'http://182.92.161.167:8062/upload', formData: formData}, function(err, res, body){
    console.log(err);
    console.log(res);
    console.log(body);
});