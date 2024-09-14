// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      公会宣言修改
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var GuildController = require("guild_controller");

var GuildChangeSignWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guild", "guild_change_sign_window");
        this.win_type = WinType.Mini;
        this.viewTag = SCENE_TAG.dialogue;
        this.ctrl = GuildController.getInstance();
    },


    openCallBack: function () {
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;
        this.close_btn = this.seekChild("close_btn");
        this.confirm_btn = this.seekChild("confirm_btn");
        this.cost_value = this.seekChild("cost_value", cc.Label);

        this.edit_title = this.seekChild("edit_title", cc.EditBox);
    },



    registerEvent: function () {
        this.background.on(cc.Node.EventType.TOUCH_END, function () {
            this.ctrl.openGuildChangeSignWindow(false);
        }, this)
        this.close_btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound("c_close");
            this.ctrl.openGuildChangeSignWindow(false);
        }, this)
        this.confirm_btn.on(cc.Node.EventType.TOUCH_END, function () {
            var target_name = this.edit_title.string;
            if (target_name == "") {
                message(Utils.TI18N("宣言不能为空！"));
            } else {
                this.ctrl.requestChangeGuildSign(target_name);
            }
        }, this)
    },

    openRootWnd: function () {

    },

    closeCallBack: function () {
        this.ctrl.openGuildChangeSignWindow(false)
    }

});

module.exports = GuildChangeSignWindow;