const LoginController = require("login_controller");
var RoleController = require("role_controller");

const DMMSDK = function() {};

DMMSDK.callbacks = {};
DMMSDK.callbackId = 1;
DMMSDK.loginData = null;


DMMSDK.initSDK = function() {
    console.error("初始化DMM SDK");

    window.addEventListener("message", processMessage.bind(this), true);

    this.callMethod("getToken", [], (result) => {
        console.error(result);
        if (!result.data.success) {
            console.error(result.data.message);
            return;
        }
        DMMSDK.loginData = result.data.data;
        DMMSDK.loginData.usrName = "dmm_" + result.data.usrName;
        DMMSDK.loginData.usrId = "dmm_" + result.data.usrId;
        // LoginController.getInstance().loginPlatformRequest(DMMSDK.loginData);
        LoginController.getInstance().getModel().requestDefaultServer();
        LoginController.getInstance().changeLoginWindowIndex(2);
    });
};

function processMessage(event) {
    const result = event.data;
    if (result.type === "callMethodResult") {
        let callback = this.callbacks[result.callbackId];
        callback && callback(event.data);
        delete this.callbacks[result.callbackId];
    }
}

DMMSDK.callMethod = function(e, t, c) {
    const data = {
        type: "callMethod",
        methodName: e,
        parameters: t,
        callbackId: this.callbackId++
    };
    this.callbacks[data.callbackId] = c;
    window.parent.postMessage(data, "*");
};

DMMSDK.loginGame = function() {
    console.error("dmm登录数据", DMMSDK.loginData);
    LoginController.getInstance().cusSDKLogin_dmm(DMMSDK.loginData);
};

DMMSDK.submitLogin = function(url) {
    if (url) {

    }
};

DMMSDK.getCurrChannel = function() {

};

DMMSDK.getSubChannel = function() {

};

//支付
DMMSDK.pay = function(money, buyNum, prodId, productName, productDesc, extension, coinNum, image, successCallback, failCallback) {
    //屏蔽支付
    message("現在は購入できません、詳細はお知らせをご覧ください。");
    return;
    var payCallFunc = function() {

        var loginInfo = LoginController.getInstance().model.getLoginInfo();

        var roleVo = RoleController.getInstance().getRoleVo();
        if (roleVo == null) return;
        var severInfo = roleVo.srv_id.split("_");
        var platform = severInfo[0] || "";
        var zone_id = severInfo[1];

        // var systemInfo = qq.getSystemInfoSync();
        // var systemName = systemInfo.system;
        // var pf = "";
        // if(systemName.indexOf("iOS")>-1){
        //     // return;
        // }else if(systemName.indexOf("Android")>-1){
        //     pf = "qq_m_qq-2001-android-2011";
        // }
        var ImageUrl = "";
        if (image) {
            ImageUrl = "https://dkgame.manhuanggame.com/ProductRes/Productpictures/" + image + ".jpg";
        }


        //时间戳
        var date_time = Math.ceil(Date.now() / 1000);

        productName = productName || (money * 10) + "钻石";
        var cps = "dmmsandbox";
        var channel = "dkh5_dmm";

        var _extension = roleVo.rid + "$$" + platform + "$$" + zone_id +
            "$$" + channel + "$$" + prodId + "$$" + productName + "$$" + cps + "$$" + date_time;
        cc.log("拓展参数_extension==>", _extension)
        var base_64 = require("base64").Base64;
        _extension = base_64.encode(_extension);

        var url = "https://" + loginInfo.host + "/api.php/pf/dmm/pre_pay";
        var data = {
            openid: DMMSDK.loginData.uid,
            zone_id: zone_id,
            pf: '',
            amt: money * 10,
            good_num: 1,
            app_remark: _extension,
            cps: cps
        };

        this.callMethod("preOrder", [url, data], (result) => {

            if (!result.data.success) {
                console.error(result.data.message);
                var CommonAlert = require("commonalert");
                CommonAlert.showItemApply(Utils.TI18N("不正行為を発覚しました，\n正しい手順でご購入ください。"), null, null, Utils.TI18N("确定"),
                    null, null, Utils.TI18N("提示"), null, null, true, null, null, null, null, { off_y: -20 });
                return;
            }
            var PlatformPointShopItemId = result.data.orderId;

            var payment = {
                PlatformPointShopItemId: PlatformPointShopItemId,
                Price: money,
                Name: productName,
                Count: buyNum,
                Description: productDesc,
                ImageUrl: ImageUrl
            };
            this.callMethod("makePayment", [payment], (result) => {
                console.error('makePayment result: ', result);
                if (!result.data.success) {
                    var cancelUrl = "https://" + loginInfo.host + "/api.php/pf/dmm/cancel_pay";
                    var cancelData = {
                        openid: DMMSDK.loginData.uid,
                        app_remark: _extension,
                        bill_no: PlatformPointShopItemId
                    };
                    this.callMethod("cancelPayment", [cancelUrl, cancelData], (result) => {
                        console.error('cancelPayment result: ', result);
                        if (failCallback) {
                            failCallback();
                        }
                    });
                } else {
                    if (successCallback) {
                        successCallback()
                    }
                }
                // if(!result.data.success) {
                //     console.error(result.data.message);
                // }
            });
        });
    }.bind(this);

    require("tips_controller").getInstance().showFirstCharge(payCallFunc);
};

module.exports = DMMSDK;