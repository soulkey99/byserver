//ͼƬ��ʾ���
(function($) {       
    $.imageFileVisible = function(options) {
        // Ĭ��ѡ��
        var defaults = {
        //����ͼƬ��Ԫ��
            wrapSelector: null,
            //<input type=file />Ԫ��
            fileSelector:  null ,
            width : '100%',
            height: 'auto',
            errorMessage: "����ͼƬ"
         };
         // Extend our default options with those provided.
         var opts = $.extend(defaults, options);
         $(opts.fileSelector).on("change",function(){
             var file = this.files[0];
             var imageType = /image.*/;
             if (file.type.match(imageType)) {
                 var reader = new FileReader();
                 reader.onload = function () {
                     var img = new Image();
                     //img.src = reader.result;
                     //$(img).width( opts.width);
                     //$(img).height( opts.height);
                     //$( opts.wrapSelector ).append(img);
                     //vm.avatar(reader.result);
                     alert(reader.result)
                     $('.cropper-example-1 > img').cropper('replace', reader.result);
                     reader.readAsDataURL(file);
                 }
             }else{
                     alert(opts.errorMessage);
             }
         });
    };
})(jQuery); 