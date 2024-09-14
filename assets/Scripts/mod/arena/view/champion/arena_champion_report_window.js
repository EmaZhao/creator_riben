// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-27 14:35:24
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ReportItem = require("arena_champion_report_item");
var CommonScrollView = require("common_scrollview");

var ArenaChampionReportWindow = cc.Class({
    extends: BaseView,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("arena", "arena_champion_report_window");
        this.viewTag = SCENE_TAG.dialogue; //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full; //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips

        this.ctrl = arguments[0];
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function() {

    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function() {

        Utils.getNodeCompByPath("main_container/main_panel/win_title", this.root_wnd, cc.Label).string = Utils.TI18N("数据统计");
        Utils.getNodeCompByPath("main_container/main_panel/desc_1", this.root_wnd, cc.Label).string = Utils.TI18N("伤害");
        Utils.getNodeCompByPath("main_container/main_panel/desc_2", this.root_wnd, cc.Label).string = Utils.TI18N("承受伤害");
        Utils.getNodeCompByPath("main_container/main_panel/desc_3", this.root_wnd, cc.Label).string = Utils.TI18N("治疗");
        this.close_btn_nd = this.seekChild("close_btn");
        this.mask_bg_nd = this.seekChild("mask_bg");
        this.check_btn_nd = this.seekChild("check_btn");
        this.mask_bg_nd.scale = FIT_SCALE;

        // baseinfo
        this.top_name_lb = this.seekChild("top_name", cc.Label);
        this.bottom_name_lb = this.seekChild("bottom_name", cc.Label);
        this.bottom_name_nd = this.seekChild("bottom_name");
        this.success_img_nd = this.seekChild("success_img");

        this.top_list_view_nd = this.seekChild("top_list_view");
        this.bottom_list_view_nd = this.seekChild("bottom_list_view");

        this.top_success_img_y = this.success_img_nd.y;
        this.bottom_success_img_y = this.bottom_name_nd.y;

        this.close_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCloseBtn, this);
        this.mask_bg_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCloseBtn, this);
        this.check_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCheckBtn, this);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function(data) {
        this.data = data;
        this.updateWidgets();
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function() {
        this.ctrl.openArenaChampionReportWindow(false);
    },

    onClickCloseBtn: function() {
        Utils.playButtonSound(2)
        this.ctrl.openArenaChampionReportWindow(false);
    },

    updateWidgets: function() {
        cc.log("DDDDDDDDDDDDDDD");
        cc.log(this.data);


        if (this.data) {
            this.setBaseInfo()
            this.setTopInfo()
            this.setBottomInfo()
        }
    },

    setBaseInfo: function() {
        this.success_img_nd.active = (this.data.ret != 0);

        if (this.data.ret == 1) {
            this.success_img_nd.y = this.top_success_img_y;
        } else if (this.data.ret == 2) {
            this.success_img_nd.y = this.bottom_success_img_y;
        }

        this.top_name_lb.string = this.data.a_name;
        this.bottom_name_lb.string = this.data.b_name;
    },

    setTopInfo: function() {
        var total_hurt = 0; // 总伤害
        var total_behurt = 0; // 总被伤害
        var total_curt = 0; // 总治疗

        for (var info_i in this.data.a_plist) {
            var info = this.data.a_plist[info_i];
            total_hurt += info.hurt;
            total_behurt += info.behurt;
            total_curt += info.curt;
        }

        var scorll_size = this.top_list_view_nd.getContentSize();
        var size = cc.size(scorll_size.width, scorll_size.height);
        var setting = {
            item_class: ReportItem,
            start_x: 0,
            space_x: 0,
            start_y: 0,
            space_y: 0,
            item_width: 122,
            item_height: 278,
            row: 1,
            col: 1,
            need_dynamic: false
        }
        this.topinfo_sv = new CommonScrollView();
        this.topinfo_sv.createScroll(this.top_list_view_nd, cc.v2(0, 0), ScrollViewDir.horizontal, ScrollViewStartPos.top, size, setting, cc.v2(0.5, 1));

        this.topinfo_sv.setData(this.data.a_plist, null, { total_hurt: total_hurt, total_behurt: total_behurt, total_curt: total_curt });
    },

    setBottomInfo: function() {

        var total_hurt = 0; // 总伤害
        var total_behurt = 0; // 总被伤害
        var total_curt = 0; // 总治疗

        for (var info_i in this.data.b_plist) {
            var info = this.data.b_plist[info_i];
            total_hurt += info.hurt;
            total_behurt += info.behurt;
            total_curt += info.curt;
        }

        var scorll_size = this.bottom_list_view_nd.getContentSize();
        var size = cc.size(scorll_size.width, scorll_size.height);
        var setting = {
            item_class: ReportItem,
            start_x: 0,
            space_x: 0,
            start_y: 0,
            space_y: 0,
            item_width: 122,
            item_height: 278,
            row: 1,
            col: 1,
            need_dynamic: false
        }
        this.bottominfo_sv = new CommonScrollView();
        this.bottominfo_sv.createScroll(this.bottom_list_view_nd, cc.v2(0, 0), ScrollViewDir.horizontal, ScrollViewStartPos.top, size, setting, cc.v2(0.5, 1));

        this.bottominfo_sv.setData(this.data.b_plist, null, { total_hurt: total_hurt, total_behurt: total_behurt, total_curt: total_curt });
    },

    onClickCheckBtn: function() {
        Utils.playButtonSound(1)
        if (this.data && this.data.replay_id != 0) {
            var BattleController = require("battle_controller")
            BattleController.getInstance().csRecordBattle(this.data.replay_id)
        }
    },

})