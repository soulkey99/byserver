/**
 * Created by MengLei on 2015/9/23.
 */

//输入q_msg，返回q_summary
module.exports = function(q_msg){
    //问题的空摘要，下面才会填入数据
    var q_summary = {
        text: '',    //一条文字
        image: '',      //一条图片
        orientation: '',    //图片方向
        voice: '',      //一条语音
        time: 0        //语音时长
    };
    //生成一个问题摘要，在返回列表的时候，不需要返回问题全部内容，只要截取一条文字一张图片一段语音即可，如果没有的话，也可以不取
    for (var j = q_msg.length - 1; j >= 0; j--) {
        switch (q_msg[j].type) {
            case 'text':
            {//文字消息
                q_summary.text = q_msg[j].msg;
            }
                break;
            case 'voice':
            {//语音消息
                q_summary.voice = q_msg[j].msg || '';
                q_summary.time = q_msg[j].time;
            }
                break;
            case 'image':
            {//图片消息
                q_summary.image = q_msg[j].msg || '';
                q_summary.orientation = q_msg[j].orientation;
            }
                break;
            default :
                break;
        }
    }
    return q_summary;
};

