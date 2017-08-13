/**
 * Created by MengLei on 2015/5/23.
 */

function getParam() {
    var invite = {shareCode: "", from: "", role: ""};
    var url = unescape(window.location.href);
    var allArgs = url.split("?")[1];
    if (allArgs) {
        var args = allArgs.split("&");
        for (var i = 0; i < args.length; i++) {
            var arg = args[i].split("=");
            if (arg[0] == "shareCode") {
                invite.shareCode = arg[1];
            }
            if (arg[0] == "from") {
                invite.from = arg[1];
            }
            if (arg[0] == "role") {
                invite.role = arg[1];
            }
        }
    }
    return invite;
}
function loadUrl() {
    var invite = getParam();
    if (invite.shareCode != "") {
        document.getElementById("shareCode").value = invite.shareCode;
        document.getElementById("from").value = invite.from;
        document.getElementById("role").value = invite.role;
    } else {
        document.getElementById("shareCode").value = "NO Parameter";
        document.getElementById("from").value = "";
        document.getElementById("role").value = "";
    }
}