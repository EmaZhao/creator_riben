// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-11 17:48:39
// --------------------------------------------------------------------
var ArenaTab = {
    "LOOP": 1,
    "CHAM": 2,
}

var PathTool = require("pathtool");
var RoleController = require("role_controller");

var ArenaEnterWindow = cc.Class({
    extends: BaseView,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("arena", "arena_enter_window");
        this.viewTag = SCENE_TAG.ui; //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full; //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips

        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function() {
        this.cur_tab = null;
        this.tab_panels = {};
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function() {

        Utils.getNodeCompByPath("container/set_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("形象设置");
        this.panel_container_nd = this.seekChild("panel_container");
        this.loop_btn_nd = this.seekChild("loop_btn");
        this.rank_btn_nd = this.seekChild("rank_btn");
        this.loop_normal_bg_nd = this.seekChild("loop_normal_bg");
        this.rank_normal_bg_nd = this.seekChild("rank_normal_bg");
        this.set_btn_nd = this.seekChild("set_btn");

        this.loop_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickLoopBtn, this);
        this.rank_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickRankBtn, this);
        this.set_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickSetBtn, this);

        this.updateTab(ArenaTab.LOOP);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function(params) {
        this.updateWidgets();
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function() {
        for (var parnel_i in this.tab_panels) {
            if (this.tab_panels[parnel_i])
                this.tab_panels[parnel_i].deleteMe();
        }
        this.ctrl.openArenaEnterWindow(false);
    },

    updateWidgets: function() {

    },

    updateTab: function(tab_type) {
        if (!tab_type || tab_type == this.cur_tab) return;

        var other_tab = null;
        if (tab_type == ArenaTab.LOOP) {
            this.loop_normal_bg_nd.active = false;
            this.rank_normal_bg_nd.active = true;
            other_tab = ArenaTab.CHAM;
        } else if (tab_type == ArenaTab.CHAM) {
            this.loop_normal_bg_nd.active = true;
            this.rank_normal_bg_nd.active = false;
            other_tab = ArenaTab.LOOP;
        }

        if (!this.tab_panels[tab_type]) {
            var PanelSorce = null;
            if (tab_type == ArenaTab.LOOP) {
                PanelSorce = require("arena_enter_loop_panel");
            } else {
                PanelSorce = require("arena_enter_champion_panel");
            }
            this.tab_panels[tab_type] = new PanelSorce(this.ctrl);
            this.tab_panels[tab_type].setParent(this.panel_container_nd);
            this.tab_panels[tab_type].show();
        } else {
            this.tab_panels[tab_type].setVisible(true);
        }

        if (this.tab_panels[other_tab]) {
            this.tab_panels[other_tab].setVisible(false);
        }

        this.cur_tab = tab_type;
    },

    onClickLoopBtn: function() {
        this.updateTab(ArenaTab.LOOP);
    },

    onClickRankBtn: function() {
        this.updateTab(ArenaTab.CHAM);
    },

    onClickSetBtn: function() {
        RoleController.getInstance().openRoleDecorateView(true, 3);
    },
})