// --------------------------------------------------------------------
// @author: @syg.com(必填, 创建模块的人员)
// @description:
//      公会查找面板
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var GuildConst = require("guild_const");
var CommonScrollView = require("common_scrollview");
var GuildRequestItem = require("guild_request_item");
var GuildController = require("guild_controller");
var GuildEvent = require("guild_event");

var GuildSearchPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guild", "guild_search_panel");
        this.panel_index = 1;       //1:为搜索界面 2:为列表界面 3:为没有查找到界面
        this.ctrl = GuildController.getInstance();
    },

    initPanel: function () {
        this.background = this.seekChild("background");
        this.background_width = this.background.getContentSize().width;

        this.search_container = this.seekChild("search_container");
        this.search_btn = this.seekChild(this.search_container, "search_btn");
        this.guild_value = this.seekChild(this.search_container,"guild_value",cc.EditBox);


        this.list_container = this.seekChild("list_container");
        this.return_btn = this.seekChild(this.list_container, "return_btn");
        this.notice_container = this.seekChild("notice_container");
        this.notice_btn = this.seekChild(this.notice_container, "notice_btn");
    },

    registerEvent: function () {
        this.search_btn.on(cc.Node.EventType.TOUCH_END, function () {
            var guild_name = this.guild_value.string;
            if(guild_name == "")
                message(Utils.TI18N("公会名字不得为空"));
            else
                this.ctrl.requestGuildList(null,null,null,guild_name);
        }, this)

        this.return_btn.on(cc.Node.EventType.TOUCH_END, function () {
            this.changeViewStatus(1);
        }, this)

        this.notice_btn.on(cc.Node.EventType.TOUCH_END, function () {
            this.changeViewStatus(1);
        }, this)

        this.addGlobalEvent(GuildEvent.UpdateGuildList, function (type, list) {
            if (type != GuildConst.list_type.search)
                return
            this.updateGuildList(list);
        }.bind(this))
    },

    openRootWnd: function () {

    },

    onShow: function () {
        let pos = this.root_wnd.getPosition()
        this.setPosition(pos.x,pos.y)
    },

    addToParent: function (status) {
        if (this.root_wnd != null)
            this.setVisible(status)
            // this.root_wnd.active = status;
    },

    changeViewStatus: function (index) {
        if (this.panel_index == index)
            return
        this.panel_index = index;
        this.search_container.active = this.panel_index == 1;
        this.list_container.active = this.panel_index == 2;
        this.notice_container.active = this.panel_index == 3;
        if (this.panel_index == 1)
            this.background.setContentSize(this.background_width, 780);
        else
            this.background.setContentSize(this.background_width, 702);
    },

    //外部判断是不是在公会查找到的列表界面
    checkIsInListStatus:function(){
        return this.panel_index == 2
    },

    changeToSearchListStatus:function(){
        this.changeViewStatus(1);
    },

    updateGuildList:function(list){
        if (list == null || Utils.next(list) == null){
            this.changeViewStatus(3);
        }else{
            if (this.scroll_view == null) {
                var list_size = this.list_container.getContentSize();
                var setting = {
                    item_class: GuildRequestItem,      // 单元类
                    start_x: 3,                    // 第一个单元的X起点
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
                this.scroll_view.createScroll(this.list_container, cc.v2(0, -list_size.height*0.5-3), ScrollViewDir.vertical, ScrollViewStartPos.top, list_size, setting, cc.v2(0.5, 0.5))
            }
            this.scroll_view.setData(list);
            this.changeViewStatus(2);
        }
    },

    onDelete: function () {
        if(this.scroll_view)
            this.scroll_view.deleteMe();
        this.scroll_view = null;
    }
});

module.exports = GuildSearchPanel;