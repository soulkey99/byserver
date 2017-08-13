/**
 * Created by MengLei on 2015/4/20.
 */

function getParam() {
    var user = {userID: "", authSign: ""};
    var url = unescape(window.location.href);
    var allArgs = url.split("?")[1];
    if (allArgs) {
        var args = allArgs.split("&");
        for (var i = 0; i < args.length; i++) {
            var arg = args[i].split("=");
            if (arg[0] == "userID") {
                user.userID = arg[1];
            }
            if (arg[0] == "authSign") {
                user.authSign = arg[1];
            }
        }
    }
    return user;
}
function loadUrl() {
    var user = getParam();
    if (user.userID != "") {
        document.getElementById("userID").textContent = "userID = " + user.userID;
        document.getElementById("authSign").textContent = "authSign = " + user.authSign;
    } else {
        document.getElementById("userID").textContent = "NO Parameter";
        document.getElementById("authSign").textContent = "";
    }
}