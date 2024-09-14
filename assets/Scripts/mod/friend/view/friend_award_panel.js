// --------------------------------------------------------------------
// @author: @syg.com(必填, 创建模块的人员)
// @description:
//      竖版好友赠送友情点
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var FriendController = require("friend_controller");
var RoleController = require("role_controller");

var FriendAwardPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("friend", "friend_award_panel");
        this.ctrl = FriendController.getInstance();
        this.size = cc.size(720, 800);
        this.item_list = {};
    },

    initPanel: function () {
        this.root_wnd.setContentSize(this.size);
        this.main_panel = this.root_wnd.getChildByName("main_panel");
        this.cost_panel = this.main_panel.getChildByName("cost_panel");
        this.friend_point = this.cost_panel.getChildByName("num_label").getComponent(cc.Label);
        this.num_label = this.main_panel.getChildByName("rich_text").getComponent(cc.RichText);

        this.btn_send = this.main_panel.getChildByName("btn_send");
        // var title = this.btn_send.getTitleRenderer();

        Utils.getNodeCompByPath("main_panel/btn_send/Label", this.root_wnd, cc.Label).string = Utils.TI18N("一键领取");
    },

    registerEvent: function () {
        this.btn_send.on(cc.Node.EventType.TOUCH_END, (function () {
            var list = [];
            
            var array = this.ctrl.getModel().getArray();
            for (var i = 0; i < array.length; i++) {
                var vo = array[i];
                if (vo && vo.is_draw == 1)
                    list.push({ rid: vo.rid, srv_id: vo.srv_id });
            }
            this.ctrl.sender_13317(1, list);
        }).bind(this))
    },

    setData: function (data) {
        if (data == null)
            return
        this.data = data;
        if (this.root_wnd)
            this.onShow();
    },

    setFriendPoint: function () {
        var role_vo = RoleController.getInstance().getRoleVo();
        var friend_point = role_vo.friend_point || 0;
        this.friend_point.string = friend_point;
    },

    onShow: function () {
        var num = 0;
        if (this.data && Utils.next(this.data)) {
            for (var i in this.data) {
                var vo = this.data[i];
                if (vo && vo.is_draw == 1)
                    num = num + 1;
            }
        }
        var str = Utils.TI18N("礼物数：") + num;
        var color = Config.color_data.data_color16[156];
        this.num_label.string = "<color=" + color + ">" + str + "</c>";
        this.setFriendPoint();
    },

    setCallFun: function (call_fun) {
        this.call_fun = call_fun;
    },

    setVisibleStatus: function (bool) {
        if (this.root_wnd == null)
            return
        this.root_wnd.active = bool;
    },


    openRootWnd: function () {

    },

    closeCallBack: function () {
    }
});

module.exports = FriendAwardPanel;