// --------------------------------------------------------------------
// @author: @syg.com(必填, 创建模块的人员)
// @description:
//      竖版好友列表
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var FriendController = require("friend_controller");
var RoleController = require("role_controller");

var FriendListPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("friend", "firend_list_panel");
        this.ctrl = FriendController.getInstance();
        this.model = this.ctrl.getModel();
        this.size = cc.size(720, 800);
        this.item_list = {};
    },

    initPanel: function () {
        this.root_wnd.setContentSize(this.size);
        this.main_panel = this.root_wnd.getChildByName("main_panel");
        this.num_label = this.main_panel.getChildByName("rich_text").getComponent(cc.RichText);
        this.cost_panel = this.main_panel.getChildByName("cost_panel");
        this.friend_point = this.cost_panel.getChildByName("num_label").getComponent(cc.Label);
        //删除按钮
        this.btn_del = this.main_panel.getChildByName("btn_del");
        this.btn_del_label = this.btn_del.getChildByName("Label").getComponent(cc.Label);
        //添加好友
        this.btn_add = this.main_panel.getChildByName("btn_add");
        //一键赠送
        this.btn_send = this.main_panel.getChildByName("btn_send");

        Utils.getNodeCompByPath("main_panel/btn_del/Label", this.root_wnd, cc.Label).string = Utils.TI18N("删除好友");
        Utils.getNodeCompByPath("main_panel/btn_add/Label", this.root_wnd, cc.Label).string = Utils.TI18N("添加好友");
        Utils.getNodeCompByPath("main_panel/btn_send/Label", this.root_wnd, cc.Label).string = Utils.TI18N("一键赠送");
    },

    registerEvent: function () {
        if (this.btn_del) {
            this.btn_del.on(cc.Node.EventType.TOUCH_END, function () {
                this.clickDelBtn();
            }, this)
        }
        if (this.btn_add) {
            this.btn_add.on(cc.Node.EventType.TOUCH_END, function () {
                this.ctrl.openFriendFindWindow(true);
            }, this)
        }
        if (this.cost_panel) {
            this.cost_panel.on(cc.Node.EventType.TOUCH_END, function () {
                var tips = Utils.TI18N("1、友情点通过每日收取好友赠送的友情点获得，每日最多能够收取到五个好友赠送的友情点\n" +
                    "2、超出次数的赠礼依然能够获得银币奖励\n" +
                    "3、玩家赠送好友礼物，自己也可以获得银币奖励")
                // TipsManager:getInstance():showCommonTips(tips,cc.p(35,355)
            }, this)
        }
        if (this.btn_send) {
            this.btn_send.on(cc.Node.EventType.TOUCH_END, function () {
                if (this.data == null)
                    return
                var count = this.model.getFriendPresentCount() || 10;
                var list = [];
                var vo = null;
                var index = 1;
                for (var i in this.data) {
                    var vo = this.data[i];
                    if (vo && vo.is_present == 0) {
                        list.push(vo);
                        index = index + 1;
                    }
                    if (index >= count)
                        break
                }
                this.ctrl.sender_13317(0, list);
            }, this)
        }
    },

    setData: function (data) {
        if (this.root_wnd != null)
            this.onShow();
        if (data == null)
            return
        this.data = data; 
    },

    clickDelBtn: function () {
        this.is_del = !this.is_del;
        if (this.call_fun)
            this.call_fun(this.is_del);
        var str = Utils.TI18N("删除好友");
        if (this.is_del == true)
            str = Utils.TI18N("取消删除");
        this.btn_del_label.string = str;
    },

    onShow: function () {
        var all_num = this.ctrl.getModel().getFriendOnlineAndTotal().total_num;
        var str = Utils.TI18N("好友数：") + all_num + "/100";
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
        if (bool == false){
            this.is_del = false;
            this.btn_del_label.string = Utils.TI18N("删除好友");
        }
    },

    setFriendPoint:function(){
        var role_vo = RoleController.getInstance().getRoleVo();
        var friend_point = role_vo.friend_point || 0;
        this.friend_point.string = (friend_point);
    },

    openRootWnd: function () {

    },

    closeCallBack: function () {

    }
});

module.exports = FriendListPanel;