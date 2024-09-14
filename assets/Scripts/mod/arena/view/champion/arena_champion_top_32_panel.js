// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-13 11:42:49
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ArenaConst = require("arena_const");
var ArenaEvent = require("arena_event");

var PanelEnum = {
    "C32": 1,
    "C4": 2,
}

var ArenaChampionTop32Panel = cc.Class({
    extends: BasePanel,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("arena", "arena_champion_top_32_panel");

        this.ctrl = arguments[0];
        this.model = this.ctrl.getChamPionModel();
    },

    // 可以初始化声明一些变量的
    initConfig: function() {
        this.panle_tabs = {};
        this.cur_panel = null;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function() {
        Utils.getNodeCompByPath("container/main_panel/tab_container/tab_btn_1/title", this.root_wnd, cc.Label).string = Utils.TI18N("32强赛");
        Utils.getNodeCompByPath("container/main_panel/tab_container/tab_btn_2/title", this.root_wnd, cc.Label).string = Utils.TI18N("4强赛");
        this.container_nd = this.seekChild("container");
        this.panel_conatiner_nd = this.seekChild("page_container");
        this.vs_container_nd = this.seekChild("vs_container");

        this.btn_infos = {};
        for (var bnt_i = 1; bnt_i <= 2; bnt_i++) {
            var btn_info = this.btn_infos[bnt_i] = {};
            var btn_nd = this.seekChild("tab_btn_" + bnt_i);
            btn_nd.tab_tag = bnt_i;
            btn_info["btn_sp"] = btn_nd.getComponent(cc.Sprite);
            btn_info["txt_nd"] = this.seekChild(btn_nd, "title")
            btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickTabBtn, this);
        }

        var Top32Panel = require("arena_champion_top_32_1_panel");
        this.panle_tabs[PanelEnum.C32] = new Top32Panel(this.ctrl);
        this.panle_tabs[PanelEnum.C32].setParent(this.panel_conatiner_nd);
        this.panle_tabs[PanelEnum.C32].show();
        this.panle_tabs[PanelEnum.C32].setVisible(false);

        var Top4Panel = require("arena_champion_top_32_2_panel");
        this.panle_tabs[PanelEnum.C4] = new Top4Panel(this.ctrl);
        this.panle_tabs[PanelEnum.C4].setParent(this.panel_conatiner_nd);
        this.panle_tabs[PanelEnum.C4].show();
        this.panle_tabs[PanelEnum.C4].setVisible(false);

        this.updateTab(PanelEnum.C32);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {
        // 查看战斗信息
        this.addGlobalEvent(ArenaEvent.CheckFightInfoEvent, function(status, group, pos) {
            this.changeToFightinfo(status, group, pos);
        }.bind(this));

        this.addGlobalEvent(ArenaEvent.UpdateTop324GroupPosEvent, function(data) {
            this.updateFightInfo(data);
        }.bind(this));
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function(params) {
        this.updateWidget();
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function() {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function() {
        for (var tab_i in this.panle_tabs) {
            this.panle_tabs[tab_i].deleteMe();
            this.panle_tabs[tab_i] = null;
        }
        if (this.vs_panel) {
            this.vs_panel.deleteMe()
        }
    },

    // 主界面基础信息更新
    updateBaseInfo: function() {
        if (this.root_wnd) {
            this.updateWidget();
            for (var panel_i in this.panle_tabs) {
                if (this.panle_tabs[panel_i])
                    this.panle_tabs[panel_i].updateBaseInfo();
            }
        }
    },

    updateWidget: function() {
        var base_info = this.base_info = this.model.getBaseInfo();
        var role_info = this.role_info = this.model.getRoleInfo();
        if (!base_info || !role_info) return;

        if (base_info.step == ArenaConst.champion_step.unopened ||
            base_info.step == ArenaConst.champion_step.score ||
            (base_info.step == ArenaConst.champion_step.match_32 &&
                base_info.step_status == ArenaConst.champion_step_status.unopened)) {
            this.root_wnd.active = false;
        } else {
            this.root_wnd.active = true;
        }
    },

    updateTab: function(tab_index) {
        if (this.cur_panel && this.cur_panel === tab_index) return;

        var other_tab = 1;
        if (tab_index == 1)
            other_tab = 2;
        // 按钮变化
        var select_btn_info = this.btn_infos[tab_index];
        // select_btn_info["btn_sp"].setState(cc.Sprite.State.NORMAL);
        this.loadRes(PathTool.getUIIconPath("arenachampion", "arenachampion_1022"), function(res) {
            select_btn_info["btn_sp"].spriteFrame = res
        }.bind(this))
        select_btn_info["txt_nd"].color = new cc.Color(0xff, 0xff, 0xff, 0xff);

        var other_btn_info = this.btn_infos[other_tab];
        // other_btn_info["btn_sp"].setState(cc.Sprite.State.GRAY);
        this.loadRes(PathTool.getUIIconPath("arenachampion", "arenachampion_1023"), function(res) {
            other_btn_info["btn_sp"].spriteFrame = res
        }.bind(this))
        other_btn_info["txt_nd"].color = new cc.Color(0xfe, 0xd1, 0x9c, 0xff);

        this.panle_tabs[tab_index].setVisible(true);
        if (this.cur_panel)
            this.panle_tabs[this.cur_panel].setVisible(false);

        this.cur_panel = tab_index;
    },

    onClickTabBtn: function(event) {
        if (!this.cur_panel || this.cur_panel !== event.target.tab_tag) {
            this.updateTab(event.target.tab_tag);
        }
    },

    changeToFightinfo: function(status, group, pos) {
        if (status) {
            this.ctrl.sender20263(group, pos);
        } else {

        }
    },

    updateFightInfo: function(data) {
        this.container_nd.active = false;

        if (!this.vs_panel) {
            var VsPanel = require("arena_champion_vs_panel");
            this.vs_panel = new VsPanel();
            this.vs_panel.setParent(this.vs_container_nd);
            this.vs_panel.show();
        } else {
            this.vs_panel.setVisible(true);
        }
        this.vs_panel.updateFightInfo(data);
    },

    isShowVS: function() {
        if (this.vs_panel && !this.container_nd.active)
            return true;
    },

    closeVS: function() {
        this.container_nd.active = true;
        this.vs_panel.setVisible(false);
    },

})