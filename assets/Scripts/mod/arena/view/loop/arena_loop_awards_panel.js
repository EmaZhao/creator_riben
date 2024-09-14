// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-06 21:33:28
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var AwardsItem = require("arena_loop_awards_item");
var CommonScrollView = require("common_scrollview");
var TimeTool = require("timetool");

var Arena_loop_awardsPanel = cc.Class({
    extends: BasePanel,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("arena", "arena_loop_awards_panel");

        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 可以初始化声明一些变量的
    initConfig: function() {
        this.awards_list = Config.arena_data.data_awards;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function() {

        Utils.getNodeCompByPath("container/rank_title", this.root_wnd, cc.Label).string = Utils.TI18N("排名");
        Utils.getNodeCompByPath("container/award_title", this.root_wnd, cc.Label).string = Utils.TI18N("奖励");
        Utils.getNodeCompByPath("my_container/role_name", this.root_wnd, cc.Label).string = Utils.TI18N("我的排名:");
        Utils.getNodeCompByPath("my_container/desc", this.root_wnd, cc.Label).string = Utils.TI18N("保持排名可获得奖励:");
        this.scroll_container_nd = this.seekChild("scroll_container");
        this.role_rank_lb = this.seekChild("role_rank", cc.Label);
        this.limit_time_lb = this.seekChild("limit_time", cc.Label);

        this.list_items = {};
        for (var item_i = 0; item_i < 3; item_i++) {
            var item_nd = this.seekChild("item_nd_" + item_i);
            this.list_items[item_i] = ItemsPool.getInstance().getItem("backpack_item");
            this.list_items[item_i].setParent(item_nd);
            this.list_items[item_i].setExtendData({ scale: 0.8 });
            this.list_items[item_i].show();
            this.list_items[item_i].setVisible(false);
        }

        this.initAwardsList();
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function(params) {
        this.updateWidgets();
        this.updateAwardsList();
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
        if (this.awards_sv) {
            this.awards_sv.deleteMe()
            this.awards_sv = null;
        }
    },

    updateWidgets: function() {
        if (!this.root_wnd) return;
        var loop_data = this.model.getMyLoopData();
        this.role_rank_lb.string = loop_data.rank;

        var my_reward = null;
        if (loop_data.rank !== 0) {
            for (var reward_i in this.awards_list) {
                cc.log(this.awards_list[reward_i]);
                if (loop_data.rank <= this.awards_list[reward_i].max && loop_data.rank >= this.awards_list[reward_i].min) {
                    my_reward = this.awards_list[reward_i].items;
                    break;
                }
            }
        }

        for (var item_i in this.list_items) {
            this.list_items[item_i].setVisible(false);
        }

        if (my_reward) {
            var item_num = my_reward.length;
            for (var item_i in my_reward) {
                var item_data = {};
                item_data.bid = my_reward[item_num - 1 - item_i][0];
                item_data.num = my_reward[item_num - 1 - item_i][1];
                this.list_items[item_i].setData(item_data);
                this.list_items[item_i].setVisible(true);
            }
        }

        // 更新时间
        var loop_data = this.model.getMyLoopData();
        var less_time = this.less_time = loop_data.end_time - gcore.SmartSocket.getTime();
        if (less_time > 0) {
            if (!this.update_timer)
                this.update_timer = this.startUpdate();
        } else {
            if (this.update_timer)
                this.stopUpdate();
        }
    },

    initAwardsList: function() {
        var scorll_size = this.scroll_container_nd.getContentSize();
        var size = cc.size(scorll_size.width, scorll_size.height);
        var setting = {
            item_class: AwardsItem,
            start_x: 0,
            space_x: 0,
            start_y: 0,
            space_y: 0,
            item_width: 614,
            item_height: 143,
            row: 0,
            col: 1,
            need_dynamic: true
        }
        this.awards_sv = new CommonScrollView();
        this.awards_sv.createScroll(this.scroll_container_nd, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, size, setting, cc.v2(0, 0.5));
    },

    updateAwardsList: function() {
        this.awards_sv.setData(this.awards_list);
    },

    updatePanelInfo: function() {
        this.updateWidgets();
    },

    update: function(dt) {
        if (this.less_time > 0) {
            this.less_time -= dt;
        } else {
            this.less_time = 0;
            this.stopUpdate();
            this.update_timer = null;
        }

        var time_str = TimeTool.getTimeFormat(Math.ceil(this.less_time));
        this.limit_time_lb.string = Utils.TI18N("赛季剩余时间:") + time_str;
    },
})