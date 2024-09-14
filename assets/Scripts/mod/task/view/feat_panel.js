// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      日常主界面的成就标签页
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var TaskController = require("task_controller");
var TaskItem = require("task_item");
var TaskEvent = require("task_event");
var CommonScrollView = require("common_scrollview");

var FeatPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("task", "feat_panel");

        this.ctrl = TaskController.getInstance();
        this.model = this.ctrl.getModel();
        this.status = null;
    },


    initPanel: function () {

        this.quest_container = this.root_wnd.getChildByName("quest_container");
        var size = this.quest_container.getContentSize();
        var scroll_view_size = cc.size(size.width, size.height-20)
        var setting = {
            item_class: TaskItem,      // 单元类
            start_x: 6,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 2,                   // y方向的间隔
            item_width: 610,               // 单元的尺寸width
            item_height: 148,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 1,                        // 列数，作用于垂直滚动类型
            need_dynamic: true
        }
        this.item_scrollview = new CommonScrollView()
        this.item_scrollview.createScroll(this.quest_container, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting, cc.v2(0.5, 0.5))

        this.addToParent(this.status);
    },

    addToParent: function (status) {
        // this.handleDynamicEvent(status);
        this.status = status;
        if (this.root_wnd == null)
            return
        this.setVisible(status);
        if (status == true)
            this.updateFeatList(true);
    },

    registerEvent: function () {
        this.addGlobalEvent(TaskEvent.UpdateFeatList, function () {
            this.updateFeatList();
        }.bind(this))
    },

    updateFeatList: function () {
        var list = this.model.getFeatList();
        this.item_scrollview.setData(list);
    },

    onDelete: function () {
        if (this.item_scrollview) {
            this.item_scrollview.deleteMe();
            this.item_scrollview = null;
        }
    }

});

module.exports = FeatPanel;