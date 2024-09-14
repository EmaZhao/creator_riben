// --------------------------------------------------------------------
// @author: @syg.com(必填, 创建模块的人员)
// @description:
//      公会列表面板
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var GuildConst = require("guild_const");
var CommonScrollView = require("common_scrollview");
var GuildRequestItem = require("guild_request_item");
var GuildController = require("guild_controller");
var GuildEvent = require("guild_event");

var GuildListPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guild", "guild_list_panel");
        this.ctrl = GuildController.getInstance();
    },

    initPanel: function () {
        this.empty_tips = this.seekChild("empty_tips");
        this.desc = this.seekChild("desc", cc.Label);
        this.desc.string = Utils.TI18N("暂无任何公会信息");
        this.scroll_container = this.seekChild("background");

        this.checkbox = this.seekChild("checkbox", cc.Toggle);
        this.checkbox.isChecked = false;

        if (this.scroll_view == null) {
            var list_size = this.scroll_container.getContentSize();
            var setting = {
                item_class: GuildRequestItem,      // 单元类
                start_x: 2.5,                    // 第一个单元的X起点
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
            this.scroll_view.createScroll(this.scroll_container, cc.v2(0, list_size.height * 0.5 - 6), ScrollViewDir.vertical, ScrollViewStartPos.top, list_size, setting, cc.v2(0.5, 0.5))
        }
    },

    registerEvent: function () {
        this.addGlobalEvent(GuildEvent.UpdateGuildList, function (type, list) {
            if (type != GuildConst.list_type.total)
                return
            this.all_list = list || [];
            this.filterNotFullList();
        }.bind(this))
        this.checkbox.node.on("toggle", function () {
            this.filterNotFullList();
        }, this)

        this.ctrl.requestGuildList();
    },

    openRootWnd: function () {
    },

    onShow: function () {
    },

    addToParent: function (status) {
        if (this.root_wnd != null)
            this.setVisible(status)
            // this.root_wnd.active = status;
        if (status == true) {
            if (this.scroll_view == null) {
                // this.ctrl.requestGuildList();
            }
        }
    },

    filterNotFullList: function () {
        if (!this.all_list)
            return
        var status = this.checkbox.isChecked;
        var list;
        if (status) {
            if (this.filter_list == null) {
                this.filter_list = [];
                for (var i in this.all_list) {
                    var data = this.all_list[i];
                    if (data.members_num < data.members_max)
                        this.filter_list.push(data);
                }
            }
            list = this.filter_list;
        } else {
            list = this.all_list;
        }
        this.updateGuildList(list);
    },

    updateGuildList: function (list) {
        if (list == null || Utils.next(list) == null) {
            this.empty_tips.active = true;
        } else {
            this.empty_tips.active = false;
            if (this.scroll_view == null) {
                var list_size = this.scroll_container.getContentSize();
                var setting = {
                    item_class: GuildRequestItem,      // 单元类
                    start_x: 2.5,                    // 第一个单元的X起点
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
                this.scroll_view.createScroll(this.scroll_container, cc.v2(0, list_size.height * 0.5 - 5), ScrollViewDir.vertical, ScrollViewStartPos.top, list_size, setting, cc.v2(0.5, 0.5))
            }
            this.scroll_view.setData(list);
        }
    },

    onDelete: function () {
        if (this.scroll_view)
            this.scroll_view.deleteMe();
        this.scroll_view = null;
    }
});

module.exports = GuildListPanel;