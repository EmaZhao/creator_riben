// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-05-08 14:28:04
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var AdventureEvent = require("adventure_event");

var AdventureactivityWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("adventureactivity", "adventureactivity_window");
        this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){

    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background").getComponent(cc.Sprite);
        this.background.node.scale = FIT_SCALE; 
        var res = PathTool.getBigBg("bigbg_83");
        this.loadRes(res,(function(resObject){
            this.background.spriteFrame = resObject;
        }).bind(this));
   
        var main_panel = this.root_wnd.getChildByName("main_container");
        this.close_btn = main_panel.getChildByName("close_btn");
        var scroll_list = main_panel.getChildByName("scroll_list");
        var scroll_view_size = scroll_list.getContentSize();
        var AdventureActivityItem = require("adventureactivity_item_panel");
        var setting = {
            item_class: AdventureActivityItem,      // 单元类
            start_x: 0,                  // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 23,                   // y方向的间隔
            item_width: 687,               // 单元的尺寸width
            item_height: 214,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 1,                         // 列数，作用于垂直滚动类型
            need_dynamic: true
        }
        var CommonScrollView = require("common_scrollview");
        this.item_scrollview = new CommonScrollView();
        this.item_scrollview .createScroll(scroll_list, cc.v2(0,0) , ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openAdventureActivityMainWindow(false);
        }.bind(this), 2);

        // 冒险红点
        this.addGlobalEvent(AdventureEvent.UpdateAdventureForm, (function(){
            this.updateItemListRedStatus();
        }).bind(this));

        // //元素圣殿红点
        // this.addGlobalEvent(ElementEvent.Update_Element_Red_Status, (function(){
        //     this.updateItemListRedStatus();
        // }).bind(this));

        // //天界副本红点
        // this.addGlobalEvent(HeavenEvent.Update_Heaven_Red_Status, (function(){
        //     this.updateItemListRedStatus();
        // }).bind(this));
    },

    updateItemListRedStatus:function(){
        if(!this.item_scrollview)return;
        var item_list = this.item_scrollview.getItemList();
        if(item_list){
            for(var i in item_list){
                item_list[i].updateRedStatus();    
            }
        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        if(this.item_scrollview){
            var adventure_data = Config.cross_ground_data.data_adventure_activity;
            var list = [];
            
            for(var i in adventure_data){
                if(adventure_data[i].id == 1){//屏蔽天界
                    list.push(adventure_data[i]);
                }
            }
		    this.item_scrollview.setData(list);
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.item_scrollview){
            this.item_scrollview.deleteMe();
            this.item_scrollview = null;
        }
        this.ctrl.openAdventureActivityMainWindow(false);
    },
})