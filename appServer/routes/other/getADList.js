/**
 * Created by zhengyi on 15/2/26.
 */
var result = require('../../utils/result');
var proxy = require('../../../common/proxy');
var crypto = require('crypto');

module.exports = function (req, res) {
    var param = {};
    if (req.body.time) {
        param['time'] = req.body.time;
    }
    if (req.headers.platform) {
        param['platform'] = req.headers.platform.toLowerCase();
        if (req.headers.platform.toLowerCase() == 'ios') {
            //对于ios类型的，需要分辨率信息，如果不传默认iphone5及以上的分辨率，如果传了，则直接取值
            //为了强迫症，需要把上传来的resolution的值强制转成全小写形式
            param['resolution'] = req.body.resolution;
        }
    }
    if (req.user && req.user.userType) {
        param['userType'] = req.user.userType;
    } else if (req.body.userType) {
        param['userType'] = req.body.userType;
    }
    proxy.Advertise.getCurrentAd(param, function(err, doc){
        if(err){
            return result(res, {statusCode: 905, message: err.message});
        }
        //此处通过计算得出广告的id
        //算法为：将所有的item的_id.toString()拼成一个大的string，然后计算md5得出摘要
        var md5 = crypto.createHash('md5');
        md5.update(new Date().toLocaleDateString());
        result(res, {statusCode: 900, adId: md5.digest('hex'), list: doc});
    });
};
