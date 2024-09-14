// --------------------------------------------------------------------
// @author: @syg.com(必填, 创建模块的人员)
// @description:
//      发红包榜
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var RedbagController = require("redbag_controller");
var PlayerHead = require("playerhead");
var RoleController = require("role_controller");
var RedbagEvent = require("redbag_event");
var RedRankItem = require("redbag_rank_item");
var CommonScrollView = require("common_scrollview");

var RedBagGetPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("redbag", "redbag_rank");
        this.ctrl = RedbagController.getInstance();
        this.size = cc.v2(644, 740);
    },

    initPanel: function () {
        this.main_panel = this.seekChild("main_panel");
        this.size = this.main_panel.getContentSize();
        this.top_panel = this.seekChild(this.main_panel, "top_panel");
        this.look_btn = this.seekChild(this.top_panel, "look_btn");

        this.no_label = this.seekChild(this.top_panel, "no_label");
        this.no_label.active = false;

        this.head_bg = this.seekChild(this.top_panel, "head_bg");
        this.head_icon = new PlayerHead();
        this.head_icon.setParent(this.head_bg);
        this.head_icon.show()
        this.head_icon.setPosition(0, 0);
        this.head_bg.active = false;
        this.look_btn.active = false;

        this.role_name = this.seekChild(this.top_panel, "role_name", cc.Label);
        
        Utils.getNodeCompByPath("main_panel/top_panel/look_btn/Label", this.root_wnd, cc.Label).string = Utils.TI18N("查看详情");
        Utils.getNodeCompByPath("main_panel/top_panel/no_label", this.root_wnd, cc.Label).string = Utils.TI18N("虚位以待！");
    },

    registerEvent: function () {
        this.look_btn.on(cc.Node.EventType.TOUCH_END, function (sender) {
            if (!this.first_data) return
            var roleVo = RoleController.getInstance().getRoleVo();
            if (roleVo.rid == this.first_data.rid && roleVo.srv_id == this.first_data.srv_id) {
                message(Utils.TI18N("你连自己都不认识了么？"));
                return
            }
            require("chat_controller").getInstance().openFriendInfo(this.first_data);
        }.bind(this));
        this.addGlobalEvent(RedbagEvent.Rank_List_Event, function (data) {
            this.updateMessage(data);
            this.updateRankList(data)
        }.bind(this))
        this.ctrl.sender13545();
    },

    setVisibleStatus: function (bool) {
        this.setVisible(bool);
    },

    updateMessage: function (data) {
        if (!data) return
        if (!data.list || Utils.next(data.list) == null) return
        this.first_data = data.list[0];
        this.role_name.string = this.first_data.name || "";
        this.head_icon.setHeadRes(this.first_data.face_id);
        this.head_icon.setFrameRes(this.first_data.avatar_bid);
    },

    updateRankList: function (data) {
        if (!data) {
            this.showEmptyIcon(true);
            return
        }
        if (!this.scroll_view) {
            var scroll_view_size = cc.size(600, 700);;
            var setting = {
                item_class: RedRankItem,      // 单元类
                start_x: 0,                    // 第一个单元的X起点
                space_x: 0,                    // x方向的间隔
                start_y: 0,                    // 第一个单元的Y起点
                space_y: 0,                   // y方向的间隔
                item_width: 600,               // 单元的尺寸width
                item_height: 123,              // 单元的尺寸height
                row: 1,                        // 行数，作用于水平滚动类型
                col: 1,                        // 列数，作用于垂直滚动类型
                need_dynamic: true
            }
            this.scroll_view = new CommonScrollView()
            this.scroll_view.createScroll(this.main_panel, cc.v2(0, -70), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting, cc.v2(0.5, 0.5))
        }
        var list = data.list || [];
        if (!list || Utils.next(list) == null) {
            this.showEmptyIcon(true)
            return
        }
        list.sort(Utils.tableUpperSorter(["price"]));
        for(var i in list){
            list[i].index = i;
        }
        this.showEmptyIcon(false);
        this.scroll_view.setData(list);
    },

    showEmptyIcon: function (bool) {
        this.head_bg.active = !bool;
        this.look_btn.active = !bool;
        if (!this.empty_con && bool == false) return
        if (!this.empty_con) {
            var size = cc.size(200, 200);
            this.empty_con = new cc.Node();
            this.empty_con.setContentSize(size);
            this.empty_con.setAnchorPoint(cc.v2(0.5, 0.5));
            this.empty_con.setPosition(cc.v2(0, 0));
            this.main_panel.addChild(this.empty_con);
            var res = PathTool.getBigBg("bigbg_3");
            this.empty_bg = Utils.createImage(this.empty_con, null, 0, 0, cc.v2(0.5, 0.5), false)
            this.loadRes(res, function (sf_obj) {
                this.empty_bg.spriteFrame = sf_obj;
            }.bind(this))
            this.empty_label = Utils.createLabel(26, new cc.Color(0x68, 0x45, 0x2a, 0xff), null, 0, -100, "", this.empty_con, 0, cc.v2(0.5, 0.5));
        }
        var str = Utils.TI18N("暂无排行");
        this.empty_label.string = str;
        this.empty_con.active = bool;
        this.no_label.active = bool;
    },

    onShow: function () {
    },

    setData: function (data) {
    },

    onDelete: function () {
        if (this.empty_con) {
            this.empty_con.destroy();
            this.empty_label.destroy();
            this.empty_bg.destroy();
            this.empty_con = null;
            this.empty_bg = null;
            this.empty_label = null;
        }
        if (this.head_icon) {
            this.head_icon.onDelete();
            this.head_icon = null;
        }
        if (this.scroll_view) {
            this.scroll_view.DeleteMe()
        }
        this.scroll_view = null
    }
});

module.exports = RedBagGetPanel;