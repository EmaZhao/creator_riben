// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-19 09:39:25
// --------------------------------------------------------------------
var PathTool         = require("pathtool");
var CommonScrollView = require("common_scrollview");
var ArenaEvent       = require("arena_event");

var ArenaLoopMyLogWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("arena", "arena_loop_my_log_window");
        this.viewTag = SCENE_TAG.dialogue;          //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips

        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){

    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){

        Utils.getNodeCompByPath("main_container/main_panel/win_title", this.root_wnd, cc.Label).string = Utils.TI18N("比赛记录");
        Utils.getNodeCompByPath("main_container/main_panel/empty_tips/desc", this.root_wnd, cc.Label).string = Utils.TI18N("暂无任何记录");
        this.close_btn_nd  = this.seekChild("close_btn");
        this.mask_nd       = this.seekChild("mask");
        this.background_nd = this.seekChild("background");
        this.list_panel_nd = this.seekChild("list_panel")
        this.empty_tips_nd = this.seekChild("empty_tips");

        this.background_nd.scale = FIT_SCALE;
        this.close_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCloseBtn, this);
        this.mask_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCloseBtn, this);

        this.initItenList();
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.addGlobalEvent(ArenaEvent.UpdateMylogListEvent, function(log_list) {
            if (log_list)
                this.updateChallengeList(log_list);
        }.bind(this));
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        this.ctrl.sender20222();
        this.model.updateArenaLoopLogStatus(false);
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.my_log_sv){
            this.my_log_sv.deleteMe()
            this.my_log_sv = null;
        }
        this.ctrl.openArenaLoopMyLogWindow(false);
    },

    initItenList: function() {
        var LogItem     = require("arena_loop_my_log_item");
        var scorll_size = this.list_panel_nd.getContentSize();
        var size        = cc.size(scorll_size.width, scorll_size.height);
        var setting = {
            item_class: LogItem,
            start_x: 4,
            space_x: 0,
            start_y: 0,
            space_y: 0,
            item_width: 600,
            item_height: 136,
            row: 0,
            col: 1,
            need_dynamic: true
        }
        this.my_log_sv = new CommonScrollView();
        this.my_log_sv.createScroll(this.list_panel_nd, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, size, setting, cc.v2(0.5, 0.5));
    },

    onClickCloseBtn: function() {
        this.ctrl.openArenaLoopMyLogWindow(false);
    },

    updateChallengeList: function(log_list) {
        if(log_list.length == 0){
            this.empty_tips_nd.active = true
        }else{
            this.my_log_sv.setData(log_list);
            this.empty_tips_nd.active = false;
        }

    },
})