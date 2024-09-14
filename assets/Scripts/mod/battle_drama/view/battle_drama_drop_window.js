// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     掉落信息总览面板
// <br/>Create: 2019-03-25 16:00:50
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var BattleDramaController = require("battle_drama_controller");

var Battle_drama_dropWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("battledrama", "battle_drama_drop_windows");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.panel_list = {};
        this.tab_list = {};
        this.tab_array = [
            { label: Utils.TI18N("Boss掉落"), index: 1 },
            { label: Utils.TI18N('挂机掉落'), index: 2 }
        ]
        this.cur_tab = null
        this.cur_index = null
        this.ctrl = BattleDramaController.getInstance();
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;
        this.main_container = this.seekChild("root");
        this.close_btn = this.seekChild(this.main_container, "close_btn");
        this.image_3_nd = this.seekChild(this.main_container, "Image_3")

        this.tableContainer = this.seekChild(this.main_container, "tab_container");
        var tab_btn = null;
        var type = null;
        var label = null;
        for (var i = 1; i <= this.tab_array.length; i++) {
            tab_btn = this.tableContainer.getChildByName(cc.js.formatStr("tab_btn_%s", i));
            tab_btn.select_bg = tab_btn.getChildByName("select_bg");
            tab_btn.select_bg.active = false;
            tab_btn.unselect_bg = tab_btn.getChildByName("unselect_bg");
            tab_btn.label = tab_btn.getChildByName("title").getComponent(cc.Label);
            tab_btn.label.node.color = new cc.Color(0xff, 0xff, 0xff, 0xff);
            type = this.tab_array[i - 1].index;
            label = this.tab_array[i - 1].label;
            tab_btn.type = type;
            tab_btn.label.string = label;
            this.tab_list[type] = tab_btn;
        }
        Utils.getNodeCompByPath("root/title_label", this.root_wnd, cc.Label).string = Utils.TI18N("掉落信息");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openDramDropWindows(false)
        }.bind(this), 2)
        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openDramDropWindows(false)
        }.bind(this), 2)
        Utils.onTouchEnd(this.world_btn, function () {
        }.bind(this), 2)
        var fun = function(btn){
            Utils.onTouchEnd(btn, function () {
                if (btn.type != null) {
                    this.changeTabView(btn.type);
                }
            }.bind(this), 1)
        }.bind(this)
        if (this.tab_list) {
            for (var k in this.tab_list) {
                var btn = this.tab_list[k];
                fun(btn)
            }
        }

    },


    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (max_dun_id, index) {
        this.max_dun_id = max_dun_id;
        index = index || 1;
        this.changeTabView(index)
    },

    changeTabView: function (index) {
        if (this.cur_index && this.cur_index == index) {
            return
        }
        if (this.cur_tab != null) {
            if (this.cur_tab.label) {
                this.cur_tab.label.node.color = new cc.Color(0xff, 0xff, 0xff, 0xff);
            }
            this.cur_tab.select_bg.active = false;
        }
        this.cur_tab = this.tab_list[index];
        if (this.cur_tab != null) {
            if (this.cur_tab.label) {
                this.cur_tab.label.node.color = new cc.Color(0xff, 0xff, 0xff, 0xff);
            }
            this.cur_tab.select_bg.active = true;
        }
        if (this.cur_panel != null) {
            this.cur_panel.setVisibleStatus(false);
            this.cur_panel = null;
        }
        var cur_panel = this.panel_list[index];
        if (cur_panel == null) {
            if (index == 1) {//boss
                var BattleDramaDropBossTipsWindow = require("battle_drama_drop_boss_tips_panel");
                cur_panel = new BattleDramaDropBossTipsWindow(this.max_dun_id);
            } else if (index == 2) {//hook
                var BattlDramaDropTipsWindow = require("battle_drama_drop_tips_panel");
                cur_panel = new BattlDramaDropTipsWindow(this.max_dun_id);
            }
            this.panel_list[index] = cur_panel;
            if (cur_panel != null) {
                cur_panel.setParent(this.image_3_nd);
                cur_panel.show();
            }
        }

        if (cur_panel != null) {
            cur_panel.setVisibleStatus(true);
            this.cur_panel = cur_panel;
            this.cur_index = index;
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        if (this.panel_list) {
            for (var i in this.panel_list) {
                if (this.panel_list[i]) {
                    this.panel_list[i].deleteMe();
                    this.panel_list[i] = null;
                }
            }
            this.panel_list = null;
        }
        this.ctrl.openDramDropWindows(false)
    },
})