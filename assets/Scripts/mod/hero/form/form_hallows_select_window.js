// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-01-28 11:21:08
// --------------------------------------------------------------------
var PathTool = require("pathtool");

var FormHallowsSelectwindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hero", "form_hallows_select_panel");
        this.viewTag    = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type   = WinType.Full;                      //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl       = arguments[0];
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        var HallowsController = require("hallows_controller");
        this.hallows_model = HallowsController.getInstance().getModel();
    },

    openCallBack:function() {
        this.background_nd   = this.seekChild("background");
        this.items_container = this.seekChild("items_container");
        this.background_nd.scale       = FIT_SCALE;
        this.background_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCloseBtn, this);
            
        this.initListView();

        Utils.getNodeCompByPath("main_container/win_title", this.root_wnd, cc.Label).string = Utils.TI18N("神器更换")
    },

    registerEvent:function(){

    },

    closeCallBack: function() {
    },

    openRootWnd: function (params) {
        this.hallows_id = params.hallows_id;
        this.select_cb = params.callback;
        this.updateWidgets();
    },

    testFunction: function() {
        return this.testData;
    },

    initListView: function() {
        var CommonScrollView = require("common_scrollview");
        var FormHallowSelectItem = require("form_hallows_select_item");
        var scroll_view_size = cc.size(this.items_container.width, this.items_container.height)
        var setting = {
            item_class: FormHallowSelectItem,      // 单元类
            start_x: 11,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: 600,               // 单元的尺寸width
            item_height: 182,              // 单元的尺寸height
            col: 1,                        // 列数，作用于垂直滚动类型
            once_num: 5,
            need_dynamic: true
        }
        this.item_scrollview = new CommonScrollView();
        this.item_scrollview.createScroll(this.items_container, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting, cc.v2(0.5, 0.5))
    },

    onClickCloseBtn: function() {
        this.ctrl.openFormHallowsSelectPanel(false);
    },

    updateWidgets: function() {
        var hallows_list = [];
        var config_list = Config.hallows_data.data_base;

        for (var hallow_i in config_list) {
            var hallow_data = {};
            var hallow_cfg = config_list[hallow_i];
            var hallow_vo = this.hallows_model.getHallowsById(hallow_cfg.id);
            if (hallow_vo) {            
                require("hero_controller").getInstance().getModel().setHallowsRedPointState(hallow_cfg.id,"false");
                if (this.hallows_id == hallow_vo.id) {
                    hallow_vo.is_equip = true;
                } else {
                    hallow_vo.is_equip = false;                
                }
            }
            hallow_data.hallow_cfg = hallow_cfg;
            hallow_data.hallow_vo = hallow_vo;
            hallows_list.push(hallow_data);            
        }
        this.item_scrollview.setData(hallows_list, this.onClickHeroExhibiton.bind(this), {can_click: true});
    },

    onClickHeroExhibiton: function(hallow_vo) {
        if (this.select_cb)
            this.select_cb(hallow_vo);
        this.ctrl.openFormHallowsSelectPanel(false);
    },
})