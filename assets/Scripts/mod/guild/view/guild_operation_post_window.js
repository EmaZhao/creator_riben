// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      任命或者免职以及踢人面板
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var GuildController = require("guild_controller");
var GuildConst = require("guild_const");

var GuildOperationPostWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guild", "guild_operation_post_window");
        this.win_type = WinType.Mini;
        this.viewTag = SCENE_TAG.dialogue;
        this.ctrl = GuildController.getInstance();
    },


    openCallBack: function () {
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;
        this.notcie = this.seekChild("notice", cc.Label);
        this.close_btn = this.seekChild("close_btn");
        this.setmember_btn = this.seekChild("setmember_btn");
        this.setmember_btn_label = this.seekChild(this.setmember_btn, "label", cc.Label);
        this.kickout_btn = this.seekChild("kickout_btn");
        this.setleader_btn = this.seekChild("setleader_btn");
        this.center_y = this.setmember_btn.y;
        this.container_nd = this.seekChild("container");
        this.seekChild(this.container_nd, "win_title", cc.Label).string = Utils.TI18N("管理操作");
        this.seekChild(this.setleader_btn, "label", cc.Label).string = Utils.TI18N("转让会长");
        this.seekChild(this.kickout_btn, "label", cc.Label).string = Utils.TI18N("移除出公会");
    },



    registerEvent: function () {
        this.background.on(cc.Node.EventType.TOUCH_END, function () {
            this.ctrl.openGuildOperationPostWindow(false);
        }, this)

        this.close_btn.on(cc.Node.EventType.TOUCH_END, function () {
            this.ctrl.openGuildOperationPostWindow(false);
        }, this)

        this.setleader_btn.on(cc.Node.EventType.TOUCH_END, function () {
            if (this.data != null)
                this.ctrl.requestOperationPost(this.data.rid, this.data.srv_id, GuildConst.post_type.leader)
        }, this)

        this.setmember_btn.on(cc.Node.EventType.TOUCH_END, function (event) {
            var btn = event.currentTarget;
            if (btn.index != null && this.data != null)
                this.ctrl.requestOperationPost(this.data.rid, this.data.srv_id, btn.index);
        }, this)

        this.kickout_btn.on(cc.Node.EventType.TOUCH_END, function () {
            if (this.data != null)
                this.ctrl.requestKickoutMember(this.data.rid, this.data.srv_id, this.data.name);
        }, this)
    },

    // 列表中 对应的1：转让会长 2：任命副会长 3：罢免副会长 4：踢出公会
    openRootWnd: function (data) {
        if (data == null)
            return
        this.data = data;
        this.notcie.string = cc.js.formatStr(Utils.TI18N("你要对【%s】玩家执行的操作是"), data.name);
        if (data.role_post == GuildConst.post_type.leader) {
            if (data.post == GuildConst.post_type.assistant) {
                this.setmember_btn_label.string = Utils.TI18N("罢免副会长");
                this.setmember_btn.index = GuildConst.post_type.member;
            } else {
                this.setmember_btn.index = GuildConst.post_type.assistant;
                this.setmember_btn_label.string = Utils.TI18N("任命副会长");
            }
        } else if (data.role_post == GuildConst.post_type.assistant) {
            if (data.post == GuildConst.post_type.member) {
                this.kickout_btn.y = this.center_y;
                this.setleader_btn.active = false;
                this.setmember_btn.active = false;
            } else {
                this.kickout_btn.active = false;
                this.setleader_btn.active = false;
                this.setmember_btn.active = false;
            }
        }
    },

    closeCallBack: function () {
        this.ctrl.openGuildOperationPostWindow(false);
    }

});

module.exports = GuildOperationPostWindow;