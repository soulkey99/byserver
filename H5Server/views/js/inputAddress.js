/**
 * Created by MengLei on 2015/8/7.
 */

function confirmExchange(){
    var postObj = {
        userID: util.querystring('userID')[0],
        authSign: util.querystring('authSign')[0],
        goodId: util.querystring('goodId')[0],
        name: $('#mailName').val(),
        phone: $('#mailPhone').val(),
        address: $('#mailAddress').val(),
        postCode: $('#mailPostCode').val()
    };

    $.ajax({
        type: "POST",
        dataType: "JSON",
        url: '/api?m=exchangeBonus',
        data: postObj,
        success: function (resp) {
            if(resp.statusCode == 900){
                window.history.back();
                //goB(function(){
                //    window.history.back();
                //});
            }else{
                alert(resp.message);
            }
        },
        error: function(err){
            console.log(err);
        }
    });
}


function goB ($){
    var origContent = "";
    function loadContent(hash) {
        if(hash != "") {
            if(origContent == "") {
                origContent = $('#content').html();
            }
            $('#content').load(hash +".html",
                function(){ prettyPrint(); });
        } else if(origContent != "") {
            $('#content').html(origContent);
        }
    }
    $(document).ready(function() {
        $.history.init(loadContent);
        $('#navigation a').click(function(e) {
            var url = $(this).attr('href');
            url = url.replace(/^.*#/, '');
            $.history.load(url);
            return false;
        });
    });
}


