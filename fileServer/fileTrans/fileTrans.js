/**
 * Created by MengLei on 2015/7/15.
 */

var express = require('express');
var app = express();
var formidable = require('formidable');
var path = require('path');
var fs = require('fs-extra');
var request = require('request');

app.post('/upload', function(req, res){
    var form = new formidable.IncomingForm();
    var tmpPath = '';

    try {
        form.parse(req, function (err, fields, files) {
            if (err) {
                result(res, {statusCode: 905, message: err.message});
            } else {
                var name = files.upload.name;
                tmpPath = files.upload.path;
                var destPath = tmpPath + path.extname(name);
                fs.move(tmpPath, destPath, function(err){
                    if (err) {
                        result(res, {statusCode: 905, message: err.message});
                        return;
                    }
                    var formData = {
                        upload: fs.createReadStream(destPath)
                    };

                    request.post({url: 'http://182.92.161.167:8062/upload', formData: formData}, function(err, resp, body){
                        console.log(err);
                        console.log(resp);
                        console.log(body);
                        res.end(body);
                        fs.remove(tmpPath);
                    });
                });

            }
        })
    }catch(ex){
        //
    }
});

app.use(function(req, res){
    var url = req.url;
    console.log('redirect url: ' + url);
    res.redirect('http://182.92.161.167:8062' + url);
});

app.listen(8062);
