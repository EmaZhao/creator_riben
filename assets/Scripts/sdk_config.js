// ANDROID_SDK 微端android的SDK
// WX_SDK 微信SDK
// SH_RH  深海融合的爱微游、疯狂游乐场SDK
// SH_WX  深海小程序的SDK
// DMM_SDK DMM的SDK

window.PACKAGE_VERSION = "0_0_37";
window.PLATFORM = "sy";           // 平台号
// window.PLATFORM_TYPR = "";  // 游戏代号
window.PLATFORM_TYPR = "DMM_SDK";  // 游戏代号
window.PLATFORM_NAME = "h5mlf";
window.PAY_ID_FUNC = null;
window.IS_SUBMIT = false;         // 是否需要提交数据到SDK

window.SDK = null;
if (PLATFORM_TYPR == "ANDROID_SDK") {
	IS_SUBMIT = true;
	SDK = require("sdk");
} else if (PLATFORM_TYPR == "WX_SDK") {
	SDK = require("wx_sdk");
} else if (PLATFORM_TYPR == "SH_RH") {
	// IS_SUBMIT = true;
	SDK = require("sh_rh");
}else if (PLATFORM_TYPR == "SH_SDK") {
	SDK = require("sh_sdk");
}else if (PLATFORM_TYPR == "QQ_SDK") {
	SDK = require("qq_sdk");
}else if (PLATFORM_TYPR == "DMM_SDK") {
	SDK = require("dmm_sdk");
}else {	//内网测试服
	SDK = {};
	SDK.pay = function (money, buyNum, prodId, productName, productDesc, extension, coinNum) {
		var payCallFunc = function(){
			console.log("money="+money+"--buyNum="+buyNum+"--prodId="+prodId+"--productName="+productName+"--productDesc="+productDesc+"--extension="+extension+"--coinNum="+coinNum);
		}
		require("tips_controller").getInstance().showFirstCharge(payCallFunc)
	}
}
