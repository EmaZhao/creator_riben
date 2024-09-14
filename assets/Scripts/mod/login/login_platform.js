var LoginPlatform = cc.Class({
    extends: BaseController,
    ctor:function(){
    },

    isLogin: function() {
    	return this.is_logined;
    },

    login: function() {
	    if (this.is_logined) {
	        this.loginCallback()	
	    } else {
	        SDK.sdkLogin()
	    }
    },

    onLoginInfo: function(login_data) {
    	this.login_info = login_data;
	    this.is_logined = true;
	    this.loginCallback();
    },

    loginCallback: function() {
	    var usr = this.getUID();
	    var password = "12345678"
	    var data = {};
	    data.isTourist = false;
	    data.usrName = usr;
	    data.password = password;

	    var LoginController = require("login_controller");
        LoginController.getInstance().loginPlatformRequest(data);
    },

    onLogout: function() {
        if(isSubmit){
            SDK.sdkSubmitUserData(5)
        }
    },

    getInfo: function() {
    	return this.login_info;
    },

    getUserNam: function() {

    },

    getUID: function() {
    	if (this.login_info)
    		return this.login_info.uid;
    },

    getTimestamp: function() {
    	if (this.login_info)
    		return this.login_info.timestamp;
    },

    getToken: function() {
    	if (this.login_info)
    		return this.login_info.token;
    },

    getChannel: function() {
		return SDK.getCurrChannel();
    },

    getSubChannel: function() {
        return SDK.getSubChannel();
    },

    getSign: function() {
    	if (this.login_info)
    		return this.login_info.sign;	
    },

    // SDK初始化失败
    onSdkInitFail: function() {

    },

    getFinalChannel: function() {
        var cur_channel = this.getChannel();
        var sub_channel = this.getSubChannel();
        if (cur_channel && sub_channel)
            return cur_channel + "_" + sub_channel;
    },

})

module.exports = LoginPlatform;
