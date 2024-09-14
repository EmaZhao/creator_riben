// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-06 21:33:28
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var AwardsItem = require("arena_champion_rank_awards_item");
var CommonScrollView = require("common_scrollview");

var ChampionRankAwardsWindow = cc.Class({
    extends: BaseView,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("arena", "arena_champion_rank_awards_window");

        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();

        this.viewTag = SCENE_TAG.dialogue; //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big; //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 可以初始化声明一些变量的
    initConfig: function() {
        this.awards_list = Config.arena_data.data_awards;
    },

    openCallBack: function() {

        Utils.getNodeCompByPath("main_container/main_panel/title_container/award_title", this.root_wnd, cc.Label).string = Utils.TI18N("奖励");
        Utils.getNodeCompByPath("main_container/main_panel/title_container/rank_title", this.root_wnd, cc.Label).string = Utils.TI18N("排名");
        Utils.getNodeCompByPath("main_container/main_panel/win_title", this.root_wnd, cc.Label).string = Utils.TI18N("冠军赛奖励");
        Utils.getNodeCompByPath("main_container/main_panel/notice_label", this.root_wnd, cc.Label).string = Utils.TI18N("比赛结束后奖品将发送到邮箱");
        this.list_view_nd = this.seekChild("list_view");
        this.mask_bg_nd = this.seekChild("mask_bg");
        this.close_btn_nd = this.seekChild("close_btn");
        this.mask_bg_nd.scale = FIT_SCALE;

        this.initAwardsList();

        this.mask_bg_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCloseBtn, this);
        this.close_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCloseBtn, this);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    openRootWnd: function(params) {
        // this.updateWidgets();
        this.updateAwardsList();
    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    closeCallBack: function() {
        if (this.awards_sv) {
            this.awards_sv.deleteMe()
        }
        this.ctrl.openArenaChampionRankAwardsWindow(false);
    },

    updateWidgets: function() {


    },

    initAwardsList: function() {
        var scorll_size = this.list_view_nd.getContentSize();
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
        this.awards_sv.createScroll(this.list_view_nd, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, size, setting, cc.v2(0.5, 0));
    },

    updateAwardsList: function() {
        // 临时测试,直接用循环赛排名奖励
        var tmp_list = Utils.deepCopy(Config.arena_champion_data.data_awards);
        for (var award_i in tmp_list) {
            tmp_list[award_i].index = award_i;
        }
        this.awards_sv.setData(tmp_list);
    },

    onClickCloseBtn: function() {
        this.ctrl.openArenaChampionRankAwardsWindow(false);
    },
})