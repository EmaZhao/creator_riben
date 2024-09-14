// --------------------------------------------------------------------
// @author: @syg.com(必填, 创建模块的人员)
// @description:
//      竖版好友列表
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var FriendController = require("friend_controller");

var FriendApplyPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("friend", "friend_apply_panel");
        this.ctrl = FriendController.getInstance();
        this.size = cc.size(720, 800);
        this.item_list = {};
    },

    initPanel: function () {
        this.root_wnd.setContentSize(this.size);
        this.main_panel = this.root_wnd.getChildByName("main_panel");

        this.num_label = this.main_panel.getChildByName("rich_text").getComponent(cc.RichText);
        if (this.num != null) {
            this.setApplyNum(this.num)
        }
    },

    registerEvent: function () {

    },

    setData: function (data) {
        if (data == null)
            return
        this.data = data;
        if (this.root_wnd != null)
            this.onShow();
    },

    setApplyNum: function (num) {
        if (this.root_wnd == null) {
            this.num = num;
            return
        }
        num = num || 0;

        this.num_label.string = cc.js.formatStr(Utils.TI18N("申请数：%s/%s"),num,99)
    },


    setCallFun: function (call_fun) {
        this.call_fun = call_fun;
    },

    setVisibleStatus: function (bool) {
        if (this.root_wnd == null)
            return
        this.root_wnd.active = bool;
    },

    closeCallBack: function () {

    }
});

module.exports = FriendApplyPanel;