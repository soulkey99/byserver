/**
 * Created by MengLei on 2015/11/3.
 */

var gm = require('gm');

//生成缩略图使用的中间件，判断请求如果需要缩略图，那么这里就先生成缩略图
module.exports = function(req, res, next) {
    if (req.fields.thumbnail == 'true') {
        //如果需要thumbnail，那么生成
        gm(req.files.upload.path).resize(120, 120).noProfile().setFormat('jpg').write(req.files.upload.path + '_thumb', function (err) {
            if (err) {
                result(res, {statusCode: 905, message: err.message});
            } else {
                //生成缩略图成功，下一步
                next();
            }
        });
    } else {
        //否则直接下一步
        next();
    }
};
