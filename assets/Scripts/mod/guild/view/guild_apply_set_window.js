// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      入帮申请设置面板
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var GuildController = require("guild_controller");

var GuildApplySetWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guild", "guild_apply_set_window");
        this.win_type = WinType.Big;
        this.viewTag = SCENE_TAG.dialogue;
        this.ctrl = GuildController.getInstance();
        this.set_index = 0;
        this.condition_list = [];
        this.condition_index = 0;
        this.initConditionList();
    },


    openCallBack: function () {
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;
        var container = this.seekChild("container");
        this.close_btn = this.seekChild(container, "close_btn");
        this.confirm_btn = this.seekChild(container, "confirm_btn");
        this.set_value = this.seekChild("set_value", cc.Label);
        this.condition_value = this.seekChild("condition_value", cc.Label);
        this.condition_left = this.seekChild("condition_left", cc.Button);
        this.condition_right = this.seekChild("condition_right", cc.Button);
        this.set_left = this.seekChild("set_left", cc.Button);
        this.set_right = this.seekChild("set_right", cc.Button);
        this.seekChild(container, "win_title", cc.Label).string = Utils.TI18N("入会设置");
        this.seekChild(container, "set_title", cc.Label).string = Utils.TI18N("验证设置:");
        this.seekChild(container, "condition_title", cc.Label).string = Utils.TI18N("入会要求:");
        this.seekChild(this.confirm_btn, "label", cc.Label).string = Utils.TI18N("确定");
    },

    registerEvent: function () {
        if (this.background) {
            this.background.on(cc.Node.EventType.TOUCH_END, function () {
                this.ctrl.openGuildApplySetWindow(false);
            }, this)
        }

        if (this.close_btn) {
            this.close_btn.on(cc.Node.EventType.TOUCH_END, function () {
                Utils.playButtonSound("c_close");
                this.ctrl.openGuildApplySetWindow(false);
            }, this)
        }

        this.confirm_btn.on("click", function () {
            var config = this.condition_list[this.condition_index];
            this.ctrl.requestChangeApplySet(this.set_index, config.lev);
        }, this)

        this.condition_left.node.on("click", function () {
            if (this.condition_index == 0)
                return
            this.condition_index = this.condition_index - 1;
            this.setGuildConditionInfo(this.condition_index);
        }, this)

        this.condition_right.node.on("click", function () {
            if (this.condition_index + 1 >= this.condition_list.length)
                return
            this.condition_index = this.condition_index + 1;
            this.setGuildConditionInfo(this.condition_index);
        }, this)
        this.set_left.node.on("click", function () {
            if (this.set_index == 0)
                return
            this.set_index = this.set_index - 1;
            this.setGuildSetInfo(this.set_index);
        }, this)
        this.set_right.node.on("click", function () {
            if (this.set_index == 1)
                return
            this.set_index = this.set_index + 1;
            this.setGuildSetInfo(this.set_index);
        }, this)
    },

    initConditionList: function () {
        this.condition_list = [
            { index: 1, lev: 1, desc: Utils.TI18N("1级") },
            { index: 2, lev: 10, desc: Utils.TI18N("10级") },
            { index: 3, lev: 20, desc: Utils.TI18N("20级") },
            { index: 4, lev: 30, desc: Utils.TI18N("30级") },
            { index: 5, lev: 40, desc: Utils.TI18N("40级") },
            { index: 6, lev: 50, desc: Utils.TI18N("50级") },
            { index: 7, lev: 60, desc: Utils.TI18N("60级") },
        ]
    },

    setGuildConditionInfo: function (index) {
        var config = this.condition_list[index];
        if (config != null)
            this.condition_value.string = config.desc;
        var status = 1;
        if (index == 0) {
            status = 1;
        } else if (index + 1 == this.condition_list.length) {
            status = 2;
        } else {
            status = 3;
        }
        if (this.condition_status != status) {
            this.condition_status = status;
            if (status == 1) {
                Utils.setGreyButton(this.condition_left, true);
                Utils.setGreyButton(this.condition_right, false);
            } else if (status == 2) {
                Utils.setGreyButton(this.condition_left, false);
                Utils.setGreyButton(this.condition_right, true);
            } else {
                Utils.setGreyButton(this.condition_left, false);
                Utils.setGreyButton(this.condition_right, false);
            }
        }
    },

    setGuildSetInfo: function (index) {
        if (index == 0) {
            this.set_value.string = Utils.TI18N("不需要验证");
            Utils.setGreyButton(this.set_left, true);
            Utils.setGreyButton(this.set_right, false);
        } else if (index == 1) {
            this.set_value.string = Utils.TI18N("需要验证");
            Utils.setGreyButton(this.set_left, false);
            Utils.setGreyButton(this.set_right, true);
        }
    },

    openRootWnd: function () {
        var my_info = this.ctrl.getModel().getMyGuildInfo();
        if (my_info) {
            this.set_index = my_info.apply_type;
            this.setGuildSetInfo(this.set_index);

            var condition_lev = my_info.apply_lev;
            for (var i in this.condition_list) {
                var v = this.condition_list[i];
                if (v.lev == condition_lev) {
                    this.condition_index = Number(i);
                    break;
                }
            }
            this.setGuildConditionInfo(this.condition_index);
        }
    },

    closeCallBack: function () {
        this.ctrl.openGuildApplySetWindow(false);
    }

});

module.exports = GuildApplySetWindow;