// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      奖励一览的总界面
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var GuildController = require("guild_controller");
var GuildRewardItem = require("guild_reward_item");
var CommonScrollView = require("common_scrollview");

var GuildRewardWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guild", "guild_reward_window");
        this.win_type = WinType.Mini;
        this.viewTag = SCENE_TAG.dialogue;
        this.ctrl = GuildController.getInstance();
    },


    openCallBack: function () {
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;
        this.main_container = this.seekChild("main_container");
        var main_panel = this.seekChild(this.main_container, "main_panel");

        this.close_btn = this.seekChild("close_btn");
        var container = this.seekChild(main_panel, "container");

        var size = container.getContentSize();
        var list_size = cc.size(size.width, size.height - 10);
        var setting = {
            item_class: GuildRewardItem,      // 单元类
            start_x: 10,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: 599,               // 单元的尺寸width
            item_height: 159,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 1,                        // 列数，作用于垂直滚动类型
            need_dynamic: true
        }
        this.scroll_view = new CommonScrollView()
        this.scroll_view.createScroll(container, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, list_size, setting, cc.v2(0.5, 0.5))
    },



    registerEvent: function () {
        this.background.on(cc.Node.EventType.TOUCH_END, function () {
            this.ctrl.openGuildRewardWindow(false);
        }, this)

        this.close_btn.on(cc.Node.EventType.TOUCH_END, function () {
            this.ctrl.openGuildRewardWindow(false);
        }, this)


    },

    openRootWnd: function () {
        var list = Config.guild_quest_data.data_lev_data;
        var arr = [];
        for(var i in list){
            var v = list[i];
            if (v.lev != 0)
            arr.push(v);
        }
        this.scroll_view.setData(arr);
    },

    closeCallBack: function () {
        this.ctrl.openGuildRewardWindow(false);
        if(this.scroll_view){
            this.scroll_view.deleteMe();
            this.scroll_view = null
        }
    }

});

module.exports = GuildRewardWindow;