/**
 * Created by hjy on 2016/2/3 0003.
 */

function getCropImg() {
    var cropImg = $('.cropper > img').cropper("getCroppedCanvas",{width:100,height:100});
    var dataurl = cropImg.toDataURL('image/png');
    var blob = dataURLtoBlob(dataurl);
    var fd = new FormData();
    fd.append("upload", blob, "image.png");
    xhr.open('POST', '/upload', true);
    xhr.onreadystatechange = callback;
    xhr.send(fd);
}

function callback() {
    if (xhr.readyState == 4 && xhr.status === 200) {
        vm.avatar(JSON.parse(xhr.response).filePath);
        util.toast("上传成功！","success","提示信息");
    }
}

function initCrop() {
    $('.cropper > img').cropper({
        strict: false,
        guides: false,
        highlight: false,
        dragCrop: false,
        cropBoxMovable: false,
        cropBoxResizable: false,
        setCropBoxData : {
            left : 35,
            top : 20,
            width : 100,
            height : 100
        },
        minCanvasWidth: 100,
        minCanvasHeight: 100,
        autoCropArea: 1
    });
    setCrop(35, 20, 100, 100, "cropper");
}

function setCrop(l,t,w,h,ob){
    $('.'+ob+' > img').cropper("setCropBoxData",{"left":l,"top":t,"width":w,"height":h,"rotate":0,"scaleX":1,"scaleY":1});
}

var xhr = new XMLHttpRequest();
$(document).ready(function(){
    $("#imgSelect").change(function() {
        var file = this.files[0];
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            // 通过 reader.result 来访问生成的 DataURL
            var url = reader.result;
            $('.cropper > img').cropper('replace', url);
            setCrop(35, 20, 100, 100,"cropper");
        };
    });
    initCrop();
});
