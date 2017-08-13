/**
 * Created by MengLei on 2015/9/22.
 */

//输入answer中的msg，返回summary
module.exports = function(msg){
    var summary = {
        text: '',
        voice: false,
        image: false
    };
    //生成一个答案摘要，在返回某题的答案列表的时候，不需要返回每条答案全部内容，只要截取一条文字并返回是否有图片、语音即可
    //返回的文字只要截取前70个字
    for (var j = msg.length - 1; j >= 0; j--) {
        switch (msg[j].type) {
            case 'text':
            {//文字消息
                summary.text = msg[j].msg.substr(0, 70);
            }
                break;
            case 'voice':
            {//语音消息
                summary.voice = true;
            }
                break;
            case 'image':
            {//图片消息
                summary.image = true;
            }
                break;
            default :
                break;
        }
    }
    return summary;
};
