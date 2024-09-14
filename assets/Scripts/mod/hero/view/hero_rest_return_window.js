// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-04 17:07:58
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HeroEvent = require("hero_event");

var Hero_rest_returnWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hero", "hero_reset_return_panel");
        this.viewTag = SCENE_TAG.dialogue;          //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips

        this.ctrl = arguments[0];
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){

    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.list_view_nd = this.seekChild("list_view");
        this.mask_bg_nd   = this.seekChild("mask_bg");
        this.close_btn_nd = this.seekChild("close_btn");
        this.confirm_btn_nd = this.seekChild("confirm_btn");

        this.initListView();

        this.mask_bg_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCloseBtn, this);
        this.close_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCloseBtn, this);
        this.confirm_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCloseBtn, this);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.addGlobalEvent(HeroEvent.Hero_Reset_Look_Event, function(data) {
            if (data) {
                this.setItemsData(data);
            }
        }.bind(this))
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        if (params.item_list) {
            this.ctrl.sender11075(params.item_list);
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){

    },

    initListView: function() {
        var CommonScrollView = require("common_scrollview");
        var scroll_view_size = cc.size(this.list_view_nd.width, this.list_view_nd.height)
        var setting = {
            item_class: "backpack_item",      // 单元类
            start_x: 0,                    // 第一个单元的X起点
            space_x: 4,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                    // y方向的间隔
            item_width: 150,               // 单元的尺寸width
            item_height: 136,              // 单元的尺寸height
            col: 4,                        // 列数，作用于垂直滚动类型
            once_num: 5,
            need_dynamic: true
        }
        this.item_scrollview = new CommonScrollView()
        this.item_scrollview.createScroll(this.list_view_nd, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting, cc.v2(0.5,0.5))
    },

    setItemsData: function(item_list) {
        var cur_list = [];
        for (var item_i in item_list) {
            var item_data = {};
            item_data.bid = item_list[item_i].id;
            item_data.num = item_list[item_i].num;
            cur_list.push(item_data);
        }

        this.item_scrollview.setData(cur_list, null, {is_show_tips: true, is_other: false});
    },        

    onClickCloseBtn: function() {
        this.ctrl.openHeroResetReturnPanel(false);
    }
})