// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-01-07 15:32:46
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var EsecsiceController = require("esecsice_controller");
var CommonScrollView = require("common_scrollview");

var EsecsiceWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("esercise", "esercise_window");
        this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){

    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.seekChild(this.root_wnd, "bg");
        this.background.scale = FIT_SCALE*2;
        this.bg = this.seekChild(this.root_wnd, "bg", cc.Sprite);
        this.main_container = this.seekChild(this.root_wnd, "main_container");
        this.loadRes(PathTool.getBigBg("bigbg_63"), (function(resObject){
            this.bg.spriteFrame = resObject;
        }).bind(this));

        var container = this.seekChild(this.main_container, "scoreView");
        var scroll_view_size = cc.size(690, 941);
        var EsecsiceItem = require("esecsice_item");
        var setting = {
            item_class: EsecsiceItem,      // 单元类
            start_x: 0,                    // 第一个单元的X起点
            space_x: 4,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 10,                   // y方向的间隔
            item_width: 690,               // 单元的尺寸width
            item_height: 274,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 1,                        // 列数，作用于垂直滚动类型
            once_num: 5,
            need_dynamic: true
        }
        this.item_scrollview = new CommonScrollView()
        this.item_scrollview.createScroll(container, cc.v2(345, -471), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting, cc.v2(0.5,0.5))
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        var Stone_dungeonEvent = require("stone_dungeon_event");
        this.addGlobalEvent(Stone_dungeonEvent.Update_StoneDungeon_Data,function(){
            this.updateItemListRedStatus();
        }.bind(this));

        var Endless_trailEvent = require("endless_trail_event");
        this.addGlobalEvent(Endless_trailEvent.UPDATA_ESECSICE_ENDLESS_REDPOINT,function(){
            this.updateItemListRedStatus();
        }.bind(this));

        var HeroExpeditEvent = require("heroexpedit_event");
        this.addGlobalEvent(HeroExpeditEvent.Red_Point_Event,function(){
            this.updateItemListRedStatus();
        }.bind(this));

        var PrimusEvent = require("primus_event");
        this.addGlobalEvent(PrimusEvent.Updata_Primus_RedPoint,function(){
            this.updateItemListRedStatus();
        }.bind(this));

    },

    updateItemListRedStatus:function(){
        var item_list = this.item_scrollview.getItemList();
        for(var i in item_list){
            item_list[i].updateRedStatus();
        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        let data_list = [];
        for(let k in Config.dailyplay_data.data_exerciseactivity){
            data_list.push(Config.dailyplay_data.data_exerciseactivity[k]);
        }
        this.item_scrollview.setData(data_list);

        if(this.item_scrollview){
            this.item_scrollview.addEndCallBack(function(){
                this.updateItemListRedStatus();
            }.bind(this));
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if (this.item_scrollview){
            this.item_scrollview.DeleteMe()
        }
        this.item_scrollview = null
        EsecsiceController.getInstance().openEsecsiceView(false);
    },
});
