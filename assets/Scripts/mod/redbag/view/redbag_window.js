// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      公会boss主窗体
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var RedbagController = require("redbag_controller");
var GuildEvent = require("guild_event");

var RedbagWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("redbag", "redbag_btn_panel");
        this.win_type = WinType.Big;
        this.viewTag = SCENE_TAG.dialogue;
        this.ctrl = RedbagController.getInstance();
        this.model = this.ctrl.getModel();

        this.extend_id = arguments[0];
        this.btn_list = {};
        this.view_list = {};
        this.select_btn = null;
    },


    openCallBack: function () {
        var main_panel = this.seekChild("main_panel");

        this.container = this.seekChild(main_panel, "container");
        this.background = this.seekChild("background");

        for (var i = 1; i <= 3; i++) {
            var btn = main_panel.getChildByName("tab_btn_" + i);
            if (btn) {
                var tab = {};
                tab.btn = btn;
                tab.select_bg = btn.getChildByName("select_bg");
                tab.select_bg.active = false;
                tab.title = btn.getChildByName("title").getComponent(cc.Label);
                tab.red_point = btn.getChildByName("red_point");
                tab.red_point.active = false;
                if (i == 2) {
                    var is_red = this.model.getIsHaveRedBag();
                    tab.red_point.active = is_red;
                } else if (i == 1) {
                    var is_red = this.model.getSendRedBagStatue();
                    tab.red_point.active = is_red;
                }
                tab.index = i;

                this.btn_list[i] = tab;
                this.setBtnClick(btn, i);
            }
        }

        Utils.getNodeCompByPath("main_panel/win_title", this.root_wnd, cc.Label).string = Utils.TI18N("公会红包");
        Utils.getNodeCompByPath("main_panel/tab_btn_1/title", this.root_wnd, cc.Label).string = Utils.TI18N("发红包");
        Utils.getNodeCompByPath("main_panel/tab_btn_2/title", this.root_wnd, cc.Label).string = Utils.TI18N("抢红包");
        Utils.getNodeCompByPath("main_panel/tab_btn_3/title", this.root_wnd, cc.Label).string = Utils.TI18N("发红包榜");
    },

    setBtnClick(btn, index) {
        btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(ButtonSound.Tab);
            this.changeTabIndex(index);
        }.bind(this))

    },

    registerEvent: function () {
        this.background.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound("c_close");
            this.ctrl.openMainView(false)
        }.bind(this))
        this.addGlobalEvent(GuildEvent.UpdateGuildRedStatus, function () {
            var is_red = this.model.getIsHaveRedBag();
            this.updateSomeRedStatus(is_red);
            is_red = this.model.getSendRedBagStatue();
            this.updateOneRedStatus(is_red);
        })
    },

    updateSomeRedStatus: function (status) {
        if (this.btn_list && this.btn_list[2]) {
            var btn = this.btn_list[2];
            btn.red_point.active = status;
        }
    },

    updateOneRedStatus: function (status) {
        if (this.btn_list && this.btn_list[1]) {
            var btn = this.btn_list[1];
            btn.red_point.active = status;
        }
    },

    changeTabIndex: function (index) {
        if (this.select_btn && this.select_btn.index == index) return
        if (this.select_btn) {
            this.select_btn.select_bg.active = false;
            this.select_btn.title.color = new cc.Color(0xcf, 0xb5, 0x93, 0xff);
        }
        if (this.pre_panel)
            this.pre_panel.setVisibleStatus(false);
        this.pre_panel = this.createSubPanel(index);
        this.select_btn = this.btn_list[index];
        if (this.select_btn) {
            this.select_btn.select_bg.active = true;
            this.select_btn.title.color = new cc.Color(0xff, 0xed, 0xd6, 0xff)
        }
        if (this.pre_panel) {
            this.pre_panel.setVisibleStatus(true);
            // this.pre_panel.setData(this.data);
        }
        if (this.select_btn && this.select_btn.index == 3) {
            this.ctrl.sender13545();
        }
    },

    createSubPanel: function (index) {
        index = Number(index);
        var panel = this.view_list[index];
        var size = this.container.getContentSize();
        if (panel == null) {
            if (index == 1) {
                panel = Utils.createClass("redbag_send_panel", this.extend_id);
                panel.setPosition(cc.v2(size.width / 2, 355));
            } else if (index == 2) {
                panel = Utils.createClass("redbag_get_panel");
                panel.setPosition(cc.v2(size.width / 2, 375));
            } else if (index == 3) {
                panel = Utils.createClass("redbag_rank_panel");
                panel.setPosition(cc.v2(size.width / 2, 375));
            }
            panel.show();
            panel.setParent(this.container);
            this.view_list[index] = panel;
        }
        return panel
    },

    openRootWnd: function (index, data) {
        this.data = data;
        index = index || 1;
        var is_have_red = this.model.getIsHaveRedBag() || false;
        if (is_have_red == true && index == 1 && !this.extend_id) {
            index = 2;
        }
        this.changeTabIndex(index)
    },

    closeCallBack: function () {
        this.ctrl.openMainView(false);
        for (var i in this.view_list) {
            var v = this.view_list[i];
            v.deleteMe();
            v = null;
        }
        this.view_list = null;
    }

});

module.exports = RedbagWindow;