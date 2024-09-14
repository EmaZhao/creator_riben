// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      公会申请列表
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var GuildController = require("guild_controller");
var GuildEvent = require("guild_event");
var GuildApplyItem = require("guild_apply_item");
var CommonScrollView = require("common_scrollview");

var GuildApplyWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guild", "guild_apply_window");
        this.win_type = WinType.Big;
        this.viewTag = SCENE_TAG.dialogue;
        this.ctrl = GuildController.getInstance();
    },


    openCallBack: function () {
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;
        this.close_btn = this.seekChild("close_btn");
        this.list_bg = this.seekChild("listbg");
        this.list_con = this.seekChild(this.list_bg,"con")
        this.empty_tips = this.seekChild("empty_tips");
        Utils.getNodeCompByPath("main_panel/win_title", this.root_wnd, cc.Label).string = Utils.TI18N("申请列表");
        this.empty_tips.getChildByName("desc").getComponent(cc.Label).string = Utils.TI18N("当前没有申请列表");
    },



    registerEvent: function () {
        this.addGlobalEvent(GuildEvent.UpdateApplyListInfo, function () {
            this.updateApplyList();
        }, this)
        if (this.background) {
            this.background.on(cc.Node.EventType.TOUCH_END, function () {
                this.ctrl.openGuildApplyWindow(false);
            }, this)
        }

        if (this.close_btn) {
            this.close_btn.on(cc.Node.EventType.TOUCH_END, function () {
                Utils.playButtonSound("c_close");
                this.ctrl.openGuildApplyWindow(false);
            }, this)
        }
    },

    openRootWnd: function () {
        this.ctrl.requestGuildApplyList();
    },

    updateApplyList: function () {
        var list = this.ctrl.getModel().getGuildApplyList();
        if (Utils.next(list) == null) {
            this.empty_tips.active = true;
            this.list_con.active = false;
        } else {
            this.empty_tips.active = false;
            this.list_con.active = true;
            if (this.scroll_view == null) {
                var list_size = this.list_bg.getContentSize();
                list_size = cc.size(list_size.width, list_size.height - 10)
                var setting = {
                    item_class: GuildApplyItem,      // 单元类
                    start_x: -2,                    // 第一个单元的X起点
                    space_x: 0,                    // x方向的间隔
                    start_y: 2,                    // 第一个单元的Y起点
                    space_y: 0,                   // y方向的间隔
                    item_width: 616,               // 单元的尺寸width
                    item_height: 134,              // 单元的尺寸height
                    row: 0,                        // 行数，作用于水平滚动类型
                    col: 1,                        // 列数，作用于垂直滚动类型
                    need_dynamic: true
                }
                this.scroll_view = new CommonScrollView()
                this.scroll_view.createScroll(this.list_con, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, list_size, setting, cc.v2(0.5, 0.5))
            }
            this.scroll_view.setData(list);
        }
    },

    closeCallBack: function () {
        this.ctrl.openGuildApplyWindow(false)
        if (this.scroll_view) {
            this.scroll_view.DeleteMe()
        }
        this.scroll_view = null
    }

});

module.exports = GuildApplyWindow;