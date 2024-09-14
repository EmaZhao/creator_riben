// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      公会改名面板
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var GuildController = require("guild_controller");
var RoleController = require("role_controller");

var GuildChangeNameWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guild", "guild_change_name_window");
        this.win_type = WinType.Big;
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

        this.item_img_sp = this.seekChild("item_img",cc.Sprite);
        this.loadRes(PathTool.getItemRes(3),function(bg_sp){
            this.item_img_sp.spriteFrame = bg_sp;
        }.bind(this))
    },



    registerEvent: function () {
        this.background.on(cc.Node.EventType.TOUCH_END, function () {
            this.ctrl.openGuildChangeNameWindow(false);
        }, this)
        this.close_btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound("c_close");
            this.ctrl.openGuildChangeNameWindow(false);
        }, this)

        this.confirm_btn.on(cc.Node.EventType.TOUCH_END, function () {
            if (this.role_vo != null) {
                var target_name = this.edit_title.string;
                if (target_name == "") {
                    message(Utils.TI18N("公会名字不能为空！"));
                } else if (target_name == this.role_vo.gname) {
                    message(Utils.TI18N("公会名字不能与当前一样！"));
                } else {
                    this.ctrl.requestChangGuildName(target_name);
                }
            }
        }, this)
    },

    openRootWnd: function () {
        var config = Config.guild_data.data_const.rename_gold;
        if (this.role_vo == null)
            this.role_vo = RoleController.getInstance().getRoleVo();
        if (config != null && this.role_vo != null) {
            var self_total = this.role_vo.getTotalGold();
            this.cost_value.string = cc.js.formatStr("%s/%s", Utils.getMoneyString(self_total), config.val);
        }
    },

    closeCallBack: function () {
        this.ctrl.openGuildChangeNameWindow(false);
    }

});

module.exports = GuildChangeNameWindow;