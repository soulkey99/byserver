var dialog;
$(function () {
    var rotateStart = function (awards, angle, text) {  //awards:奖项，angle:奖项对应的角度
        $('.btn-lottery').stopRotate();
        $(".btn-lottery").rotate({
            angle: 0,
            duration: 5000,
            animateTo: angle + 1440, //angle是图片上各奖项对应的角度，1440是我要让指针旋转4圈。所以最后的结束的角度就是这样子^^
            callback: function () {
                var html = "<div style='margin-top: 2em'>"+
                    "<div class='form-group'>"+
                    "<label for='mailName'>姓名</label>"+
                    "<input type='text' class='form-control' id='mailName' placeholder='请输入姓名'>"+
                    "</div>"+
                    "<div class='form-group'>"+
                    "<label for='mailPhone'>手机</label>"+
                    "<input type='text' class='form-control' id='mailPhone' placeholder='请输入手机号码'>"+
                    "</div>"+
                    "<div class='form-group'>"+
                    "<label for='mailAddress'>地址</label>"+
                    "<input type='text' class='form-control' id='mailAddress' placeholder='请输入地址'>"+
                    "</div>"+
                    "<div class='form-group'>"+
                    "<label for='mailPostCode'>备注</label>"+
                    "<textarea class='form-control' rows='3' id='remarks1' placeholder='请输入备注'></textarea>"+
                    "</div>"+
                    "</div>"+
                    "<div align='center'><button class='btn btn-success' onclick='confirmExchange()'>确定</button></div>";
                dialog = $.dialog({
                    icon: 'glyphicon glyphicon-gift',
                    title: '开奖结果',
                    content: "<div>"+text+"</div><br/><div align='center'><button class='btn btn-success'>再来一次</button></div>"+html
                })
            }
        });
    };

    $(".btn-lottery").rotate({
        bind: {
            click: function () {
                var time = [1];
                time = time[Math.floor(Math.random() * time.length)];
                if (time == 1) {
                    var data = [1, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; //返回的数组
                    data = data[Math.floor(Math.random() * data.length)];
                    if (data == 1) {
                        rotateStart(1, 157, '恭喜您抽中的一等奖');
                    }
                    if (data == 2) {
                        rotateStart(2, 247, '恭喜您抽中的二等奖');
                    }
                    if (data == 3) {
                        rotateStart(3, 22, '恭喜您抽中的三等奖');
                    }
                    if (data == 0) {
                        var angle = [67, 112, 202, 292, 337];
                        angle = angle[Math.floor(Math.random() * angle.length)]
                        rotateStart(0, angle, '很遗憾，这次您未抽中奖');
                    }
                }
            }
        }
    });
});