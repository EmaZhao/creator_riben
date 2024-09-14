// --------------------------------------------------------------------
// @author: @syg.com(必填, 创建模块的人员)
// @description:
//      申请列表danlie
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var GuildController = require("guild_controller");
var PlayerHead = require("playerhead");

var GuildApplyItem = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guild", "guild_apply_item");
        this.ctrl = GuildController.getInstance();
    },

    initPanel: function () {
        this.container = this.seekChild("container");
        this.confirm_btn = this.seekChild("confirm_btn");
        this.cancel_btn = this.seekChild("cancel_btn");
        this.role_name = this.seekChild("role_name", cc.Label);
        this.role_online = this.seekChild("role_online", cc.Label);

        //头像
        this.play_head = new PlayerHead();
        this.play_head.setParent(this.container);
        this.play_head.setPosition(-230,0)
        this.play_head.show()
    },

    registerEvent: function () {
        if (this.confirm_btn) {
            this.confirm_btn.on(cc.Node.EventType.TOUCH_END, function () {
                if (this.data != null)
                    this.ctrl.requestOperationApply(1, this.data.rid, this.data.srv_id);
            }, this)
        }

        if (this.cancel_btn) {
            this.cancel_btn.on(cc.Node.EventType.TOUCH_END, function () {
                this.ctrl.requestOperationApply(2, this.data.rid, this.data.srv_id);
            }, this)
        }
    },

    setData: function (data) {
        this.data = data;
        if (this.root_wnd)
            this.onShow();
    },

    onShow: function () {
        if (this.data == null)
            return
        var data = this.data
        if (data.is_online == 1) {
            this.role_online.string = Utils.TI18N("在线");
        } else {
            this.role_online.node.color = new cc.Color(0xd9, 0x50, 0x14, 0xff);
            this.role_online.string = Utils.TI18N("离线");
        }
        this.role_name.string = data.name;
        this.play_head.setHeadRes(data.face);
        this.play_head.setLev(data.lev);
    },

    onDelete: function () {
        if (this.play_head)
            this.play_head.deleteMe();
        this.play_head = null;
    }
});

module.exports = GuildApplyItem;