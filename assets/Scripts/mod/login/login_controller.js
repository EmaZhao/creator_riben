// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      登录控制器
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

// var MainSceneController = require("mainscene_controller");
var LoginEvent = require("login_event");
var RoleController = require("role_controller")
var LoginPlatform = require("login_platform");

var LoginController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        this.finish_loading = false;
        var LoginModel = require("login_model");

        this.model = new LoginModel();
        this.model.initConfig();
        this.enable_relogin = true;           // 是否允许重连
    },

    // 注册监听事件
    registerEvents: function () {
        gcore.GlobalEvent.bind(LoginEvent.LOGIN_EVENT_ACCOUNT_LOGIN_SUCCESS, (function () {
            this.model.requestDefaultServer();
        }).bind(this));

        gcore.GlobalEvent.bind(LoginEvent.LOGIN_EVENT_DEFSERVER_SUCCESS, (function () {
        }).bind(this));

        gcore.GlobalEvent.bind(gcore.GlobalEvent.EVT_SOCKET_CONNECT, (function () {
            this.enable_relogin = true;
            if (this.reconnect_timer) {
                gcore.Timer.del(this.reconnect_timer);
                this.reconnect_timer = null;
                game.updateWaitingStatus();
            }
            if (USE_SDK) {
                SDK.loginGame();
            } else {
                this.login();
            }
        }).bind(this));

        gcore.GlobalEvent.bind(gcore.GlobalEvent.EVT_SOCKET_DISCONNECT, (function () {
            this.reconnectServer();
        }).bind(this));
    },

    // 注册协议接受事件
    registerProtocals: function () {
        this.RegisterProtocal(1110, this.on1110);
        this.RegisterProtocal(10310, this.on10310);
        this.RegisterProtocal(10101, this.on10101);
        this.RegisterProtocal(10102, this.on10102);
        this.RegisterProtocal(10103, this.on10103);
    },

    // 获取模块
    getModel: function () {
        return this.model;
    },

    // 打开登录加载
    openLoginWindow: function (data) {
        if (data && data.status) {
            var LoginWindow = require("login_window");

            if (this.login_window == null) {
                this.login_window = new LoginWindow()
            }
            this.login_window.open(data);
        } else {
            if (this.login_window) {
                this.finish_loading = false;
                game.updateLoadingStatus(true);
                gcore.GlobalEvent.fire(EventId.LOADING_FINISH)
                this.login_window.close();
                this.login_window = null;
            }
        }
    },

    //打开开场剧情
    openLoginStoryWindow:function(status){
      if (status == true) {
        if (this.login_story_window == null) {
            let LoginStoryWindow = require("login_story_window")
            this.login_story_window = new LoginStoryWindow()
        }
        this.login_story_window.open()
      } else {
          if (this.login_story_window != null) {
              this.login_story_window.close()
              this.login_story_window = null
          }
      }
    },
    //打开开始游戏提示
    openLoginTipsWindow:function(status, callBack){
      if (status == true) {
        if (this.login_tips_window == null) {
            let LoginTipsWindow = require("login_tips_window")
            this.login_tips_window = new LoginTipsWindow()
        }
        this.login_tips_window.open({callBack:callBack})
      } else {
          if (this.login_tips_window != null) {
              this.login_tips_window.close()
              this.login_tips_window = null
          }
      }
    },

    getTestAccount: function () {
        if (this.login_window)
            return this.login_window.getTestAccount();
    },

    // 切换登录窗体的面板状态
    changeLoginWindowIndex: function (index) {
        if (this.login_window) {
            this.login_window.changeSubPanel(index);
        }
    },

    // 连接服务器
    connectServer: function (host, port, ws) {
        if (NO_SOCKET) {
            console.log("NO_COSKET   ")
            this.openLoginWindow(false);
            return;
        }
        var loginInfo = this.model.getLoginInfo();
        host = host || loginInfo.host;
        port = port || loginInfo.port;
        ws = ws || loginInfo.ws;

        cc.log("建立socket链接");
        cc.log(loginInfo);

        if (host && port) {
            cc.log("建立socket链接1");
            gcore.SmartSocket.connect(host, port, ws);
            // gcore.SmartSocket.connect("localhost", "9001");
        } else {
            message(Utils.TI18N("服务器地址信息错误"));
        }
    },

    // 断线重线处理
    reconnectServer: function () {
        if (!this.reconnect_timer && this.enable_relogin) {
            this.reconnect_timer = gcore.Timer.set(this.connectServer.bind(this), 3000, -1);
            game.updateWaitingStatus(WaitingStaus.CONNECT);
        }
    },

    // 登录服务器
    login: function () {
        var loginInfo = this.model.getLoginInfo();
        var data = [
            { key: "account", val: loginInfo.account }
            , { key: "channel", val: CHANNEL }
            , { key: "idfa", val: "windows" }
        ];
        this.SendProtocal(1110, { args: data });
    },

    sdkLogin: function () {
        // LoginPlatform
        var protocal = {}
        var account = this.model.getLoginData().usrName || "";
        var srv_id = this.model.getLoginData().srv_id || "";
        var device_id = "nicai"
        // var device_id = device.getDeviceName()
        var timestamp = LoginPlatform.getInstance().getTimestamp();
        var token = LoginPlatform.getInstance().getToken();
        var sign = LoginPlatform.getInstance().getSign();
        var channel = LoginPlatform.getInstance().getChannel();
        account = channel + "_" + account;
        var final_channel = LoginPlatform.getInstance().getFinalChannel();
        var gettui_cid = "meiyou";
        var device_type = "";
        // var gettui_cid = device.getuiId()
        var idfa = "meiyou";
        var is_emulator = "false";
        var os_ver = "";
        var carrier_name = "";
        var net_type = "";
        var app_name = GAME_NAME;
        var package_name = GAME_NAME;
        var package_version = "1.0.1";
        var os = "os";

        var logsign_str = account + device_id + idfa + channel + gettui_cid + is_emulator;
        var MD5 = require("md5.min");
        // cc.log("value_1==>", value);
        var logsign = MD5(logsign_str);
        logsign = logsign.toLowerCase();

        protocal.args = [
            { key: "account", val: account },
            { key: "timestamp", val: timestamp },
            { key: "enter_srv_id", val: srv_id },
            { key: "platform", val: PLATFORM_NAME },
            { key: "device_id", val: device_id },
            { key: "device_type", val: device_type },
            { key: "gettui_cid", val: gettui_cid },
            { key: "idfa", val: idfa },
            { key: "token", val: token },
            { key: "channel", val: final_channel },
            { key: "sign", val: sign },
            { key: "logsign", val: logsign },
            { key: "os_ver", os_ver },
            { key: "carrier_name", val: carrier_name },
            { key: "net_type", val: net_type },
            { key: "os", val: os },
            { key: "emulator", val: is_emulator },
            { key: "app_name", val: app_name },
            { key: "package_name", val: package_name },
            { key: "package_version", val: package_version }
        ];

        this.SendProtocal(1110, protocal);
    },

    //自定义参数的SDKLogin
    cusSDKLogin: function (data) {
        if (!data) return;

        var srv_id = this.model.getLoginData().srv_id || "";
        var account = data.account;
        var rawData = data.rawData;
        var signature = data.signature;
        var channel = data.channel;
        var device_id = "";
        var idfa = "";
        var gettui_cid = "";
        var is_emulator = "";
        var package_name = data.package_name;
        var package_version = data.package_version;
        var app_name = "";
        var platform = data.platform;
        var token = data.token ||"";
        var timestamp = data.timestamp || "";
        var sign = data.sign || "";

        var logsign_str = account + device_id + idfa + channel + gettui_cid + is_emulator;
        var MD5 = require("md5.min");
        var logsign = MD5(logsign_str);
        logsign = logsign.toLowerCase();

        var protocal = {}
        protocal.args = [
            { key: "account", val: account },
            { key: "enter_srv_id", val: srv_id },
            { key: "platform", val: platform },
            { key: "device_id", val: device_id },
            { key: "gettui_cid", val: gettui_cid },
            { key: "idfa", val: idfa },
            { key: "channel", val: channel },
            { key: "logsign", val: logsign },
            { key: "emulator", val: is_emulator },
            { key: "app_name", val: app_name },
            { key: "package_name", val: package_name },
            { key: "package_version", val: package_version },
            { key: "rawData", val: rawData },
            { key: "signature", val: signature },
            { key: "token", val: token },
            { key: "timestamp", val: timestamp },
            { key: "sign", val: sign }
        ];

        cc.log(protocal);
        this.SendProtocal(1110, protocal);
    },

    //自定义参数的SDKLogin
    //data:[]  看不同平台包传入不同的内容；
    cusSDKLogin_2: function (data) {
        if (!data) return
        var srv_id = this.model.getLoginData().srv_id || "";
        var device_id = "";
        var idfa = "";
        var gettui_cid = "";
        var is_emulator = "";
        var app_name = "";
        var logsign_str = data.account + device_id + idfa + data.channel + gettui_cid + is_emulator;
        var MD5 = require("md5.min");
        var logsign = MD5(logsign_str);
        logsign = logsign.toLowerCase();

        var args = [
            { key: "enter_srv_id", val: srv_id },
            { key: "device_id", val: device_id },
            { key: "gettui_cid", val: gettui_cid },
            { key: "idfa", val: idfa },
            { key: "logsign", val: logsign },
            { key: "emulator", val: is_emulator },
            { key: "app_name", val: app_name },
        ];

        var protocal = {};
        protocal.args = data.concat(args)

        cc.log("1110--protocal==>", protocal);
        this.SendProtocal(1110, protocal);
    },

    cusSDKLogin_dmm: function (data) {
       if (!data) return;

        var uid = data.uid;
        var token = data.token;
        var time = data.time;
        var sign = data.sign;
        var platform = "dmm";

        var protocal = {}
        protocal.args = [
            { key: "account", val: uid },
            { key: "token", val: token },
            { key: "timestamp", val: time },
            { key: "sign", val: sign },
            { key: "platform", val: platform },
        ];
        
       console.error("dmm登录请求数据:", protocal);
        this.SendProtocal(1110, protocal);
    },

    // 账号角色列表信息返回
    on1110: function (data) {
        cc.log("1110登录游戏返回");
        cc.log(data);

        // 1110返回错误则不需要重连
        if (data.code == 1) {
            if (this.model.auto_login == false) {//不需要主动进入服务器 比如在服务器列表中选择服
                return;
            }
            if (this.model.isSocket) {
                gcore.GlobalEvent.fire(LoginEvent.LOGIN_EVENT_PLAYER_INFO, data)
                return
            }
            if (data.roles.length == 0) {
                this.reqCreateRole();
            } else {
                var role = this.role = data.roles[0];
                this.reqLoginRole(role.rid, role.srv_id);
            }

            // 提交服务器信息
            if ((PLATFORM_TYPR == "WX_SDK" || PLATFORM_TYPR == "QQ_SDK") && USE_SDK) {
                var loginInfo = this.model.getLoginInfo();
                SDK.submitLogin(loginInfo.host);
            }
        } else if (data.code == 4) { //服务器维护或者被封或者未开服
            this.enable_relogin = false;
            require("notice_controller").getInstance().openNocticeWindow(true);
        } else {
            this.enable_relogin = false;
            message(data.msg);
        }
    },

    getCurRoleInfo: function() {
        return this.role;
    },

    // 掉线提示， 收到该协议后将不会进行重连
    on10310: function (data) {
        this.enable_relogin = false;
        gcore.SmartSocket.stopHeart();
        if (this.reconnect_timer) {
            gcore.Timer.del(this.reconnect_timer);
            this.reconnect_timer = null;
            game.updateWaitingStatus();
        }

        if (data.is_show == 1) {
            message(data.msg);
        }

        var GuideController = require("guide_controller");
        GuideController.getInstance().setGuideMainRootWnd(false);
        var CommonAlert = require("commonalert");
        CommonAlert.showItemApply(Utils.TI18N("该账号已在其他地方登录"),null,function(){
            game.relogin();
            if(PLATFORM_TYPR == "SH_RH"){
                SDK.logout();
            }
        }.bind(this),Utils.TI18N("确定"),null,null,Utils.TI18N("提示"),null,null,true,null, null,null,null,{off_y:-18,close_off:true})
        // game.relogin();
    },

    // 请求创建新角色
    reqCreateRole: function () {
        if(PLATFORM_TYPR == "SH_RH" || PLATFORM_TYPR == "SH_SDK"){
            this.SendProtocal(10101, { sex: 0, name: "", career: 1, playform: CHANNEL});
        }else{
            this.SendProtocal(10101, { sex: 0, name: "", career: 1, playform: PLATFORM });
        }
    },

    // 创建新角色返回
    on10101: function (data) {
        if (data.code == 1) {
            if (IS_SUBMIT) {
                SDK.sdkSubmitUserData(2, data)
            }
            if (PLATFORM_TYPR == "SH_RH" && PLATFORM_NAME == "sh"){
                SDK.createRole(data);
            }
            if (PLATFORM_TYPR == "SH_SDK"){
                SDK.createRole(data);
            }
            this.model.setFirstRoleData(data);
            this.reqLoginRole(data.rid, data.srv_id);
        } else {
            message(data.msg);
        }
    },

    // 请求登录角色
    reqLoginRole: function (rid, srv_id) {
        var loginInfo = this.model.getLoginInfo();
        loginInfo.login_rid = rid;
        loginInfo.login_srv_id = srv_id;
        cc.log(RoleController.getInstance().init_role);
        if (RoleController.getInstance().init_role) {// 角色已登录 断线重连处理
            this.SendProtocal(10103, { rid: rid, srv_id: srv_id });
        } else {
            this.SendProtocal(10102, { rid: rid, srv_id: srv_id });
        }
    },

    // 角色登录成功返回
    on10102: function (data) {
        if (data.code == 1) {
            if (this.login_window)
                this.login_window.showLoading();

            game.initConfigs(function () {
                this.SendProtocal(10300, {});
            }.bind(this));
            RoleController.getInstance().getModel().setWorldLev(data.world_lev || 0)
        } else {
            message(data.msg);
        }
        if (this.serverListWindow) {
            this.openServerList(false)
        }
    },

    sender10300: function() {
        this.SendProtocal(10300, {});
    },

    // 角色重连成功返回
    on10103: function (data) {
        if (data.code == 1) {
            var RoleController = require("role_controller")
            RoleController.getInstance().setReconnect(true)
            this.SendProtocal(10300, {});
        } else {
            message(data.msg);
        }
    },

    //打开选区列表
    openServerList(bool, data, callFunc) {
        if (bool) {
            if (!this.serverListWindow) {
                let serverListWindow = require("server_list_window")
                this.serverListWindow = new serverListWindow()
            }
            this.serverListWindow.open(data)
            this.serverListWindow.addCallBack(callFunc)
        } else {
            if (this.serverListWindow) {
                this.serverListWindow.close();
                this.serverListWindow = null
            }
        }
    },

    updateLoading: function (progerss) {
        if (this.login_window)
            this.login_window.updateLoading(progerss);
    },

    updateSeconLoading: function (progerss, isinit) {
        if (this.login_window)
            this.login_window.updateSeconLoading(progerss, isinit);
    },

    loginPlatformRequest: function (data) {
        var login_data = this.model.getLoginData();
        if (data.usrName != login_data.usrName) {
            gcore.SysEnv.set("user_name", data.usrName);
            gcore.SysEnv.set("password", data.password);
            login_data.usrName = data.usrName;
            login_data.password = data.password;
        }
        this.loginNewUserRequest(data)
    },

    loginNewUserRequest: function (data) {
        var info = {}
        info.code = 1;
        info.accName = data.usrName;
        info.platform = PLATFORM_NAME;
        info.msg = "";
        this.loginPlatformResult(info);
    },

    loginPlatformResult: function (data) {
        if (data.code == 1) {
            this.model.requestDefaultServerList(data.accName, data.platform)
        } else {

        }
    },

    //强制下线
    sender10312: function() {
        this.SendProtocal(10312, {});
    },
});

module.exports = LoginController;
