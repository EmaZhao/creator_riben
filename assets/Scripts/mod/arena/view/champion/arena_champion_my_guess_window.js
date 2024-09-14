// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-11 16:16:58
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ArenaEvent = require("arena_event");
var MyGuessItem = require("arena_champion_my_guess_item");
var CommonScrollView = require("common_scrollview");

var Arena_champion_my_guess_Window = cc.Class({
    extends: BaseView,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("arena", "arena_champion_my_guess_window");
        this.viewTag = SCENE_TAG.dialogue; //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full; //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips

        this.ctrl = arguments[0];
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function() {

    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function() {
        Utils.getNodeCompByPath("main_container/main_panel/win_title", this.root_wnd, cc.Label).string = Utils.TI18N("我的竞猜");
        Utils.getNodeCompByPath("main_container/main_panel/empty_tips/desc", this.root_wnd, cc.Label).string = Utils.TI18N("暂无任何竞猜");
        this.close_btn_nd = this.seekChild("close_btn");
        this.mask_bg_nd = this.seekChild("mask_bg");
        this.list_view_nd = this.seekChild("list_view");
        this.empty_tips_nd = this.seekChild("empty_tips");
        this.mask_bg_nd.scale = FIT_SCALE;

        this.initGuessList();

        this.close_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCloseBtn, this);
        this.mask_bg_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCloseBtn, this);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {
        this.addGlobalEvent(ArenaEvent.UpdateMyGuessListEvent, function(guess_list) {
            if (guess_list) {
                this.updateWidgets(guess_list);
            }
        }.bind(this));
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function(params) {
        this.ctrl.sender20255();
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function() {

    },

    onClickCloseBtn: function() {
        this.ctrl.openArenaChampionMyGuessWindow(false);
    },

    initGuessList: function() {
        var scorll_size = this.list_view_nd.getContentSize();
        var size = cc.size(scorll_size.width, scorll_size.height);
        var setting = {
            item_class: MyGuessItem,
            start_x: 0,
            space_x: 0,
            start_y: 0,
            space_y: 0,
            item_width: 600,
            item_height: 136,
            row: 0,
            col: 1,
            need_dynamic: true
        }
        this.my_guess_sv = new CommonScrollView();
        this.my_guess_sv.createScroll(this.list_view_nd, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, size, setting, cc.v2(0.5, 0));
    },

    updateWidgets: function(guess_list) {
        guess_list = guess_list || [];

        if (guess_list.length > 0) {
            this.empty_tips_nd.active = false;
        } else {
            this.empty_tips_nd.active = true;
        }
        this.my_guess_sv.setData(guess_list);

        // var tes_data = [];
        // for (var test_1 = 0; test_1 <=10; test_1++) {
        //     tes_data.push({list: 222});
        // }
    },

})