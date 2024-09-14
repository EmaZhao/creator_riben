// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      游戏登录界面
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var LoginController = require("login_controller");
var LoginEvent = require("login_event");
var LoaderManager = require("loadermanager");

var EnterPanel = cc.Class({
    extends: BasePanel,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("login", "enter_panel");
        this.model = LoginController.getInstance().getModel()
        this.ctrl = LoginController.getInstance()
    },

    initPanel: function() {

        Utils.getNodeCompByPath("container/btn_login_server/btn_label", this.root_wnd, cc.Label).string = Utils.TI18N("选择服务器");
        var container = this.root_wnd.getChildByName("container");

        this.btn_enter = container.getChildByName("btn_enter");
        this.btn_notice = this.seekChild("btn_notice");
        this.btn_notice_1 = this.seekChild("btn_notice_1");
        this.logo = container.getChildByName("logo");
        this.btn_login_server = container.getChildByName("btn_login_server");
        this.btn_user_center = this.seekChild("btn_user_center");
        this.txt_cur_server = this.btn_login_server.getChildByName("txt_cur_server").getComponent(cc.Label);
        this.icon_state_sp = this.btn_login_server.getChildByName("icon_state").getComponent(cc.Sprite);
        this.stateIcon_nd = this.btn_login_server.getChildByName("stateIcon");
        this.usert_account_eb = this.seekChild("usert_account", cc.EditBox);

        if (PLATFORM_TYPR == "WX_SDK") {
            this.usert_account_eb.node.active = true;
        } else {
            this.usert_account_eb.node.active = false;
        }

        // 加载log,这里也是需要根据包体去判断
        // LoaderManager.getInstance().loadRes("res/login/app/txt_cn_logo.png", (function (res_object) {
        //     var frame = this.logo.addComponent(cc.Sprite);
        //     frame.spriteFrame = res_object;
        //     // this.logo.getComponent(cc.Sprite).spriteFrame = res_object;
        // }).bind(this));
        // this.loadRes(PathTool.getUIIconPath("login", "txt_cn_logo"), function(sf_obj){
        //     var frame = this.logo.addComponent(cc.Sprite);
        //     frame.spriteFrame = sf_obj;
        // }.bind(this));
        let info = LoginController.getInstance().getModel().getLoginInfo()
        if (info.srv_name) {
            this.setMainInfo()
        }

        //深海融合特殊处理
        if (PLATFORM_TYPR == "SH_RH") {
            this.btn_user_center.active = false;
            this.btn_notice.y = 1220;
        }
    },

    registerEvent: function() {
        var self = this
        this.btn_login_server.on("touchend", function() {
            // -- 选择打开服务器面板的时候,优先判断全部服务器列表是否加载完成,如果服务器列表没有加载完成,这里做一些判断  E60557
            if (self.model.getServerList().length <= 0) {
                message(Utils.TI18N("服务器列表正在加载中..."))
                return
            }

            this.ctrl.openServerList(true, self.model.getServerList(), function() {
                self.btn_enter.active = true;
                self.btn_login_server.active = true;
            })
            this.btn_enter.active = false;
            this.btn_login_server.active = false;
        }, this)
        this.btn_enter.on(cc.Node.EventType.TOUCH_END, function(event) {
            Utils.playButtonSound(1)
            if (this.downtime != null && this.downtime == true) {
                message(Utils.TI18N("停服维护中"))
                this.ctrl.getModel().checkReloadServerData()
                return
            }
            this.ctrl.openLoginTipsWindow(true, () => {
                this.OnClickEnterBtn();
            })
        }, this)

        this.btn_notice.on(cc.Node.EventType.TOUCH_END, function(event) {
            require("notice_controller").getInstance().openNocticeWindow(true);
        }, this);
        this.btn_notice_1.on(cc.Node.EventType.TOUCH_END, function(event) {
            require("notice_controller").getInstance().openNocticeWindow(true);
        }, this);
        gcore.GlobalEvent.bind(LoginEvent.LOGIN_EVENT_CUR_SERVER_UPDATE, (function() {
            this.setMainInfo()
        }).bind(this));
    },

    onShow: function() {
        if (USE_SDK == true && PLATFORM_TYPR == "SH_SDK") {
            SDK.dataPlacement(75000);
        }

        //弹公告
        require("notice_controller").getInstance().openNocticeWindow(true);
    },

    OnClickEnterBtn: function() {
        if (USE_SDK == true && PLATFORM_TYPR == "SH_SDK") {
            SDK.dataPlacement(80000);
        }

        LoginController.getInstance().getModel().setIsSocket(false);
        if (IS_SUBMIT || PLATFORM_TYPR == "SH_RH") {
            SDK.sdkSubmitUserData(1)
        }
        LoginController.getInstance().connectServer();
        if (IS_RESET == true) {
            IS_RESET = false;
            LoginController.getInstance().openLoginWindow(false);
        }
    },

    onHide: function() {},
    setMainInfo() {
        let data = LoginController.getInstance().getModel().getLoginInfo();
        this.txt_cur_server.string = data.srv_name;
        this.stateIcon_nd.active = true;
        let path;
        this.downtime = false;
        if (data.is_close) {
            this.downtime = true;
            path = PathTool.getUIIconPath("login2", "login2_1002");
        } else {
            if (data.is_new) {
                path = PathTool.getUIIconPath("login2", "login2_1000");
            } else {
                path = PathTool.getUIIconPath("login2", "login2_1001");
                //红色不推荐
                this.stateIcon_nd.active = false;
            }
        }
        this.loadRes(path, function(res) {
            this.icon_state_sp.spriteFrame = res;
        }.bind(this))
    },
    onDelete: function() {
        // LoaderManager.getInstance().deleteRes("res/login/app/txt_cn_logo");
    },

    getTestAccount: function() {
        if (this.usert_account_eb)
            return this.usert_account_eb.string;
    },
});