// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      内部测试登录创建账号界面
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var LoginController = require("login_controller");
var LoginEvent = require("login_event");

var UserPanel = cc.Class({
    extends: BasePanel,
    ctor:function(){
        this.prefabPath = PathTool.getPrefabPath("login", "user_panel");
    },

    initPanel: function () {
        this.btn_login = this.root_wnd.getChildByName("btn_login");
        this.btn_regist = this.root_wnd.getChildByName("btn_regist");
        this.user_name_input = this.root_wnd.getChildByName("user_name_input").getComponent(cc.EditBox);
        this.password_input = this.root_wnd.getChildByName("password_input").getComponent(cc.EditBox);
        this.user_name_input.string = gcore.SysEnv.get("user_name") || Utils.randomStr(3, 12);
        this.password_input.string = gcore.SysEnv.get("password") || Utils.randomStr(6);

    },

    registerEvent:function(){
        this.btn_login.on(cc.Node.EventType.TOUCH_END, (function (event) {
            // var heroPlotInfoPanel = require("../../hero/view/Hero_library_infoWindow");
            // panel = new heroPlotInfoPanel();
            // panel.open()
            if(this.user_name_input.string == ""){
                message(Utils.TI18N("请输入用户名"));
                return;
            }
            if(this.password_input.string == ""){
                message(Utils.TI18N("请输入密码"));
                return;
            }
            var loginInfo = LoginController.getInstance().getModel().getLoginInfo();
            loginInfo.account = this.user_name_input.string;
            loginInfo.password = this.password_input.string;
            gcore.SysEnv.set("user_name", loginInfo.account);
            gcore.SysEnv.set("password", loginInfo.password);
            LoginController.getInstance().changeLoginWindowIndex(2);
            gcore.GlobalEvent.fire(LoginEvent.LOGIN_EVENT_ACCOUNT_LOGIN_SUCCESS);
        }).bind(this));
        this.btn_regist.on(cc.Node.EventType.TOUCH_END, (function (event){
            var loginInfo = LoginController.getInstance().getModel().getLoginInfo();
            loginInfo.account = Utils.randomStr(3, 12);
            loginInfo.password = Utils.randomStr(6);
            gcore.SysEnv.set("user_name", loginInfo.account);
            gcore.SysEnv.set("password", loginInfo.password);
            LoginController.getInstance().changeLoginWindowIndex(2);
            gcore.GlobalEvent.fire(LoginEvent.LOGIN_EVENT_ACCOUNT_LOGIN_SUCCESS);
        }).bind(this));
    },

    onShow:function(){
        cc.log("打开 UserPanel");
    },

    onHide: function () {
        cc.log("关闭 UserPanel");
    },

    onDelete: function () {
    },

});