// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-06 21:32:33
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ActiveityItem = require("arena_loop_activity_item");
var CommonScrollView = require("common_scrollview");

var ArenaLoopActivityPanel = cc.Class({
    extends: BasePanel,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("arena", "arena_loop_activity_panel");

        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 可以初始化声明一些变量的
    initConfig: function() {
        this.activity_list = Config.arena_data.data_activity;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function() {

        Utils.getNodeCompByPath("container/rank_title", this.root_wnd, cc.Label).string = Utils.TI18N("排名");
        Utils.getNodeCompByPath("container/award_title", this.root_wnd, cc.Label).string = Utils.TI18N("奖励");
        Utils.getNodeCompByPath("my_container/role_name", this.root_wnd, cc.Label).string = Utils.TI18N("我的排名:");
        Utils.getNodeCompByPath("my_container/desc", this.root_wnd, cc.Label).string = Utils.TI18N("保持排名可获得奖励:");
        Utils.getNodeCompByPath("desc", this.root_wnd, cc.Label).string = Utils.TI18N("奖励每日21:00通过邮件发送");

        this.scroll_container_nd = this.seekChild("scroll_container");
        this.role_rank_lb = this.seekChild("role_rank", cc.Label);

        this.list_items = {};
        for (var item_i = 0; item_i < 2; item_i++) {
            var item_nd = this.seekChild("item_nd_" + item_i);
            this.list_items[item_i] = ItemsPool.getInstance().getItem("backpack_item");
            this.list_items[item_i].setParent(item_nd);
            this.list_items[item_i].setExtendData({ scale: 0.8 });
            this.list_items[item_i].show();
        }

        this.initActivityList();
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function(params) {
        this.updateWidgets();
        this.updateActiveList();
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function() {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function() {
        if (this.list_items) {
            for (let i in this.list_items) {
                if (this.list_items[i]) {
                    this.list_items[i].deleteMe()
                    this.list_items[i] = null;
                }
            }
            this.list_items = null;
        }
        if (this.activity_sv) {
            this.activity_sv.deleteMe();
            this.activity_sv = null;
        }
    },

    initActivityList: function() {
        var scorll_size = this.scroll_container_nd.getContentSize();
        var size = cc.size(scorll_size.width, scorll_size.height);
        var setting = {
            item_class: ActiveityItem,
            start_x: 0,
            space_x: 0,
            start_y: 0,
            space_y: 0,
            item_width: 614,
            item_height: 143,
            row: 0,
            col: 1,
            need_dynamic: false
        }
        this.activity_sv = new CommonScrollView();
        this.activity_sv.createScroll(this.scroll_container_nd, cc.v2(0, -5), ScrollViewDir.vertical, ScrollViewStartPos.top, size, setting, cc.v2(0.5, 0.5));
    },

    updateWidgets: function() {
        if (!this.root_wnd) return;
        var loop_data = this.model.getMyLoopData();
        this.role_rank_lb.string = loop_data.rank;

        var my_reward = null;
        if (loop_data.rank !== 0) {
            for (var reward_i in this.activity_list) {
                cc.log(this.activity_list[reward_i]);
                if (loop_data.rank <= this.activity_list[reward_i].max && loop_data.rank >= this.activity_list[reward_i].min) {
                    my_reward = this.activity_list[reward_i].items;
                    break;
                }
            }
        }

        for (var item_i in this.list_items) {
            if (my_reward && my_reward[item_i]) {
                var item_data = {};
                item_data.bid = my_reward[item_i][0];
                item_data.num = my_reward[item_i][1];
                this.list_items[item_i].setVisible(true);
                this.list_items[item_i].setData(item_data);
            } else {
                this.list_items[item_i].setVisible(false);
            }
        }

    },

    updateActiveList: function() {
        this.activity_sv.setData(this.activity_list);
    },

    updatePanelInfo: function() {
        this.updateWidgets();
    },
})