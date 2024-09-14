// 获取服务器名称

// window.SDK = {
//     _down_apk_url_ret: null
// }


function getServerName(srv_id) {
    if (srv_id == null) {
        return "";
    }
    var tmpName = "";
    var vo = require("role_controller").getInstance().getRoleVo();
    if (vo) {
        var listOr = srv_id.split("_");
        var listMe = vo.srv_id.split("_");
        if (listOr[1] && listMe[0] && listOr[0] != listMe[0]) {
            tmpName = Utils.TI18N("异域");
        } else if (listOr.length > 1) {
            tmpName = cc.js.formatStr("S%s", listOr[listOr.length - 1]);
        }
        if (srv_id == "robot_1") {//代表机器人
            tmpName = name;
        }
        return tmpName
    }
}

window.delayOnce = function (callabck, time) {
    time = time || 1;
    if (callabck) {
        var cur_timer = gcore.Timer.set(function (callabck) {
            if (callabck)
                callabck();
        }.bind(this, callabck), time * 1000);
    }
}

// 包下载地址获取
// window.SDK.get_apk_url = function (callback) {
//     if (this._down_apk_url_ret) {
//         callback(this._down_apk_url_ret);
//         returnjs
//     }
//     if (DOWN_APK_URL == null) {
//         callback({ success: false, message: "not found DOWN_APK_URL" })
//         return
//     }
//     var url = DOWN_APK_URL;
//     var date_time = Math.ceil(Date.now() / 1000);
//     cc.log("date_time==>", date_time);
//     var channel = CHANNEL;//后面需改用正确获取方法，当前为测试
//     url = url + "?product_name=" + GAME_CODE;
//     url = url + "&date_time=" + date_time;
//     url = url + "&sign=" + this.getSignValue(date_time);
//     url = url + "&channel_name=" + channel;
//     cc.log("push_log_url==>", url);
//     var Downloadmanager = require("downloadmanager");
//     DownloadManager.getInstance().downloadText(url, function (status, responseText) {
//         if (status == null && responseText != null) {
//             var response = responseText.replace(/\\/g, "");
//             var response_2 = JSON.parse(response);
//             this._down_apk_url_ret = response_2;
//             callback(response_2);
//         } else {
//             cc.log("status==>", status, "responseText==>", responseText);
//         }
//     }.bind(this))
// }

// window.SDK.getSignValue = function (date_time) {
//     var value = "";
//     var key = SIGN_KEY;
//     value = value + GAME_CODE;
//     value = value + date_time;
//     value = value + key;
    
//     var MD5 = require("md5.min");
//     value = MD5(value);
//     value = value.toLowerCase();
//     return value
// }

// 二维码下载处理
// window.SDK.download_qrcode_png = function (url, callback) {
//     cc.loader.load({ url: url, type: "png" }, function (err, tex) {
//         if (err) {
//             cc.log("图片下载失败")
//             return
//         }
//         callback(tex);
//     })
// }


// //截屏并保存图片
// //name 对name处理成存储路径
// //callback 回调内容，传入bool:截图是否成功 callback（bool）
// window.SDK.CaptureScreenSaveImg = function(name,callback){
// }

module.exports = {
    getServerName: getServerName
}