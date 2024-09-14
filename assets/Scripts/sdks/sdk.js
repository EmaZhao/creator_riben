// 原声anddroid原声SDK

var LoginPlatform = require("login_platform")
var LoginController = require("login_controller");
var RoleController = require("role_controller");

var SDK = function() {
    this._down_apk_url_ret = null;
};

var proto = SDK.prototype;


// 界面加载完成之后初始化SDK
SDK.initSDK = function() {
    cc.log("初始化SDK");
    if (PLATFORM_TYPR == "ANDROID_SDK") { // Android原生SDK
        if (window.control) {
            window.control.initSDK()
        }
    }
}

// 初始化成功回调
SDK.sdkInitBack = function(result) {
    cc.log("SDK初始化结果");
    cc.log(result);
    if (result == 1) { // 初始化成功
        this.sdkLogin();
    } else if (result === 2) {
        cc.log("SDK初始化失败");
    }
}

// 调起SDK登录界面
SDK.sdkLogin = function() {
    cc.log("初始化登陆");
    if (PLATFORM_TYPR == "ANDROID_SDK") { // Android原生SDK
        if (window.control) {
            window.control.sdkLogin()
        }
    }
}

// SDK登录成功回调
SDK.sdkBackLogin = function(loginData) {
    if (loginData) {
        // 登录成功回调
        cc.log("登录成功回调");
        cc.log(loginData);
        var jons_data = JSON.parse(loginData);
        cc.log(jons_data)
        LoginPlatform.getInstance().onLoginInfo(jons_data);
    }
}

// SDK登录成功回调
SDK.sdkBackLoginTest = function() {
    var loginData = {};
    loginData.extension = null;
    loginData.sdkUserID = "2174939";
    loginData.sdkUsername = "UQ555438";
    loginData.suc = true;
    loginData.timestamp = "1561184589";
    loginData.token = "24a56a77b9988712869728f22a896b92";
    loginData.userID = 525886;
    loginData.uid = 525886;

    if (loginData) {
        // 登录成功回调
        cc.log("登录成功回调");
        cc.log(loginData);
        LoginPlatform.getInstance().onLoginInfo(loginData);
    }
}

// 请求SDK进行支付
SDK.pay = function(money, buyNum, prodId, productName, productDesc, extension, coinNum) {
    //屏蔽支付
    message("現在は購入できません、詳細はお知らせをご覧ください。");
    return;
    var loginData = LoginController.getInstance().getModel().getLoginData();
    var roleVo = RoleController.getInstance().getRoleVo();
    if (!roleVo || !loginData) return;
    var srvData = LoginController.getInstance().getModel().findServer(roleVo.srv_id);
    if (!srvData || srvData.srv_id != roleVo.srv_id)
        srvData = loginData;
    var config = Config.charge_data.data_charge_data[prodId];
    if (config && config.val != money) return;


    var productId = prodId;
    productName = productName || (money * 10) + "钻石";
    productDesc = productDesc || productName;
    var price = money;
    buyNum = buyNum || 1;

    var channel = LoginPlatform.getInstance().getChannel() || "";
    var gold = roleVo.getTotalGold();
    var severInfo = roleVo.srv_id.split("_");
    var platform = severInfo[0] || "";
    var serverId = severInfo[1];
    var serverName = srvData.srv_name;
    var roleId = roleVo.rid;
    var roleName = roleVo.name;
    var roleLev = roleVo.lev;
    var coinNum = roleVo.coin;
    var vip = "vip" + roleVo.vip_lev;
    var finalChannelId = LoginPlatform.getInstance().getFinalChannel();
    var ext = roleVo.rid + "$$" + platform + "$$" + serverId + "$$" + finalChannelId + "$$" + prodId + "$$" + productName;
    var host = srvData.host
        // var testData = {};
        // testData.money = 6;
        // testData.buyNum = 4;
        // testData.prodId = "id222"
    var payData = { productId: productId, productName: productName, productDesc: productDesc, price: price, buyNum: buyNum, coinNum: coinNum, serverID: serverId, serverName: serverName, roleID: roleId, roleName: roleName, roleLevel: roleLev, vip: vip, extension: ext, host: host }
    cc.log("支付参数");
    cc.log(payData);

    if (PLATFORM_TYPR == "ANDROID_SDK") { // Android原生SDK
        if (window.control) {
            window.control.sdkPay(JSON.stringify(payData))
        }
    }
}

// 请求SDK退出界面
SDK.exitAPP = function() {

}

// 请求SDK上报用户数据
SDK.sdkSubmitUserData = function(dataType, rdata) {
    let loginData = LoginController.getInstance().getModel().getLoginData();
    if (loginData.srv_id == "") return;
    if (dataType == 1) {
        if (cli_log && cli_log.log_select_server) {
            cli_log.log_select_server(login_data.usrName);
        };
        if (!this.log_select_flag) return
        this.log_select_flag = true;
    } else if (dataType == 2) {
        if (cli_log && cli_log.log_create_role) {
            cli_log.log_create_role(login_data.usrName);
        };
    }
    let account = LoginPlatForm.getInstance().getInfo().openid;
    let roleVo = RoleController.getInstance().getRoleVo() || rdata;
    let srv_id;
    if (roleVo && roleVo.srv_id) {
        srv_id = roleVo.srv_id;
    } else if (loginData.srv_id) {
        srv_id = loginData.srv_id;
    }
    let index = srv_id.indexOf("_");
    if (index != -1) {
        srv_id = Number(srv_id.slice(index + 1, srv_id.length));
    } else {
        srv_id = 0;
    }
    let serverId = srv_id; //serverId(roleVo && roleVo.srv_id || loginData.srv_id)
    let serverName = loginData.srv_name;
    let roleId = roleVo && roleVo.rid || 0;
    let roleName = roleVo && roleVo.name || "";
    let roleCTime = roleVo && roleVo.reg_time || 0;
    let roleLev = roleVo && roleVo.lev || 1;
    let vipLev = roleVo && roleVo.vip_lev || 0;
    let gold = roleVo && roleVo.getTotalGold() || 0;
    let power = roleVo && roleVo.power || 0;
    var data_info = { dataType: dataType, gold: gold, roleId: roleID, roleName: roleName, roleLev: roleLev, serverId: serverId, vipLev: vipLev, roleCTime: roleCTime, };

    cc.log("数据提交参数");
    cc.log(data_info);

    if (PLATFORM_TYPR == "ANDROID_SDK") { // Android原生SDK
        if (window.control) {
            window.control.submitExtraData(JSON.stringify(data_info));
        }
    }
    // let info = table.concat({dataType, serverId, serverName, roleId, roleName, roleCTime, roleLev, gold, vipLev, power, account}, "#")
    // sdkCallFunc("submitExtraData", info)
}

// SDK提示信息
SDK.sdkBackInfo = function() {

}

// SDK弹窗
SDK.sdkAlert = function() {

}

SDK.testJSON = function(data) {
    if (data) {
        cc.log(data);
        cc.log("JJJJJJJJJJJJJJJJJJJJ");
        var jons_data = JSON.parse(data);
        cc.log(jons_data);
    }
}


// 判断SDK能否切换账号
SDK.sdkCanSwitchAccount = function() {

}

// SDK切换账号请求
SDK.sdkOnSwitchAccount = function() {

}

// 判断能否显示用户中心
SDK.sdkCanShowAccountCenter = function() {

}

// 显示用户中心请求
SDK.sdkShowAccountCenter = function() {

}

// 显示用户中心请求
SDK.sdkSubmitUserData = function(dataType, rdata) {

}

SDK.getCurrChannel = function() {
    var cur_channel = null;
    if (PLATFORM_TYPR == "ANDROID_SDK") {
        if (window.control) {
            cur_channel = window.control.getCurrChannel()
        }
    }
    cc.log("获取渠道id" + cur_channel);
    return cur_channel;
}

SDK.getSubChannel = function() {
    var sub_channel = null;
    if (PLATFORM_TYPR == "ANDROID_SDK") {
        if (window.control) {
            sub_channel = window.control.getSubChannel();
        }
    }
    cc.log("获取子渠道id" + sub_channel);
    return sub_channel;
}

SDK.loginGame = function() {
    LoginController.getInstance().sdkLogin();
}


/**********二维码处理相关***********/

SDK.download_qrcode_png = function() {
    // var apk_data = RoleController.getInstance().getApkData();
    // if(apk_data){
    //     SDK.download_qrcode_png(apk_data.message.qrcode_url,function(img){
    //         var spriteFrame = new cc.SpriteFrame();
    //         cc.log(spriteFrame)
    //         spriteFrame.setTexture(img);
    //         this.erweima_img_sp.spriteFrame = spriteFrame;
    //     }.bind(this))
    // }
}

module.exports = SDK;