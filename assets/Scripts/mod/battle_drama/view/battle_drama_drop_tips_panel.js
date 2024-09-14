// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     掉落信息查看面板
// <br/>Create: 2019-03-28 11:01:26
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var BattleDramaController = require("battle_drama_controller");
var BattleDramaDropSecBossItem = require("battle_drama_drop_sec_boss_item");
var CommonScrollView = require("common_scrollview");

var Battle_drama_drop_tipsPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("battledrama", "battle_drama_drop_view");
        this.ctrl = BattleDramaController.getInstance();
        this.model = this.ctrl.getModel();
        this.drama_data = this.model.getDramaData();
        this.max_dun_id = arguments[0] || this.drama_data.max_dun_id;
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.item_list = {};
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.main_container = this.seekChild("root");
        this.scroll_nd = this.seekChild("scroll_nd");
        this.empty_bg_nd = this.seekChild("empty_bg");
        this.empty_bg_nd.active = true;

        var tab_size = this.scroll_nd.getContentSize();
        var setting = {
            item_class: BattleDramaDropSecBossItem,      // 单元类
            start_x: 0,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: BattleDramaDropSecBossItem.WIDTH,               // 单元的尺寸width
            item_height: BattleDramaDropSecBossItem.HEIGHT,              // 单元的尺寸height
            row: 1,                        // 行数，作用于水平滚动类型
            col: 1,                        // 列数，作用于垂直滚动类型
            need_dynamic: true
        }
        this.scroll_view = new CommonScrollView();
        this.scroll_view.createScroll(this.scroll_nd, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, tab_size, setting, cc.v2(0.5, 0.5))

        if (this.max_dun_id && gdata("dungeon_data", "data_drama_dungeon_info", [this.max_dun_id])) {
            var data = gdata("dungeon_data", "data_drama_dungeon_info", [this.max_dun_id]);
            this.updateItemReward(data.hook_show_items);
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function (params) {

    },

    updateItemReward: function (data) {
        if (data == null) return
        this.empty_bg_nd.active = false;
        this.cur_item = new BattleDramaDropSecBossItem();
        this.cur_item.show();
        this.cur_item.setData(data, true);
        this.cur_item.setPosition(0, 230);
        this.cur_item.setParent(this.main_container);
        var base_data = this.model.getDramaData();
        if (base_data) {
            var list = this.model.getShowDescRewad(base_data.max_dun_id);
            if (list && Utils.next(list || {}) != null) {
                this.scroll_view.setData(list);
            }
        }
    },

    setVisibleStatus: function (bool) {
        bool = bool || false;
        this.setVisible(bool)
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        if (this.scroll_view) {
            this.scroll_view.deleteMe();
            this.scroll_view = null;
        }
        if (this.cur_item) {
            this.cur_item.deleteMe();
            this.cur_item = null;
        }
    },
})