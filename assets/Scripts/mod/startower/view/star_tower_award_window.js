// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     竖版星命塔奖励总览
// <br/>Create: 2019-02-27 20:13:01
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var StartowerEvent = require("startower_event");
var CommonScrollView = require("common_scrollview");
var StarTowerAwardItem = require("star_tower_award_item_panel");

var Star_tower_awardWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("startower", "star_tower_award");
        this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){

    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        this.main_panel = this.root_wnd.getChildByName("main_panel");
        this.title = this.main_panel.getChildByName("title").getComponent(cc.Label);
        this.title.string = Utils.TI18N("奖励总览");
        this.close_btn = this.main_panel.getChildByName("close_btn");

        this.title_icon = this.main_panel.getChildByName("title_icon").getComponent(cc.Sprite);
        this.loadRes(PathTool.getBigBg("bigbg_71"), (function(resObject){
            this.title_icon.spriteFrame = resObject;
        }).bind(this));

        this.updateAwardList();
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){

        this.close_btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(ButtonSound.Close);
            this.ctrl.openAwardWindow(false);
        }, this)


        this.background.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(ButtonSound.Close);
            this.ctrl.openAwardWindow(false);
        }, this)


        this.addGlobalEvent(StartowerEvent.Update_Reward_Event, function () {
            if(this.list_view){
                var list = Config.star_tower_data.data_get_floor_award;
                
                var voList = [];
                for(var i in list){
                    voList.push(list[i]);
                }
                this.list_view.setData(Utils.deepCopy(voList));
            }
        }.bind(this));

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){

    },

    updateAwardList:function(){
        var scroll_view_size = cc.size(620,585);
        if(!this.list_view){
            var setting = {
                item_class: StarTowerAwardItem,      // 单元类
                start_x: 0,                  // 第一个单元的X起点
                space_x: 0,                    // x方向的间隔
                start_y: 0,                    // 第一个单元的Y起点
                space_y: 0,                   // y方向的间隔
                item_width: 620,               // 单元的尺寸width
                item_height: 173,              // 单元的尺寸height
                row: 1,                        // 行数，作用于水平滚动类型
                col: 1,                         // 列数，作用于垂直滚动类型
                need_dynamic: true,
            }
            this.list_view = new CommonScrollView();
            this.list_view.createScroll(this.main_panel, cc.v2(28,66), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting,cc.v2(0, 0));
        }
        var list = Config.star_tower_data.data_get_floor_award;
        var voList = [];
        for(var i in list){
            voList.push(list[i]);
        }
        
        this.list_view.setData(Utils.deepCopy(voList));
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.list_view){
            this.list_view.deleteMe();
            this.list_view = null;
        }

        this.ctrl.openAwardWindow(false);
    },
})