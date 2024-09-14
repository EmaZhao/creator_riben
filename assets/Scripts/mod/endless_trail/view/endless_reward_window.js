// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     奖励一览的总界面
// <br/>Create: 2019-03-06 11:12:30
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CommonScrollView = require("common_scrollview");

var Endless_rewardWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("endlesstrail", "endlesstrail_reward_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Tips;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
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
        this.main_container = this.root_wnd.getChildByName("main_container");
        this.main_panel = this.main_container.getChildByName("main_panel");
        this.win_title = this.main_panel.getChildByName("win_title").getComponent(cc.Label);
        this.win_title.string = Utils.TI18N("奖励一览");
        this.close_btn = this.main_panel.getChildByName("close_btn")
        this.first_label = this.main_panel.getChildByName("first_label").getComponent(cc.Label);
        this.first_label.string = Utils.TI18N("首通奖励");
        this.first_container = this.main_panel.getChildByName("first_container");
        this.five_label = this.main_panel.getChildByName("five_label").getComponent(cc.Label);
        this.five_label.string = Utils.TI18N("日常5关挑战奖励");
        this.five_container = this.main_panel.getChildByName("five_container");
        this.rank_label = this.main_panel.getChildByName("rank_label").getComponent(cc.Label);
        this.rank_label.string = Utils.TI18N("排行榜奖励");
        this.rank_container = this.main_panel.getChildByName("rank_container");
        this.comfirm_button = this.main_panel.getChildByName("comfirm_button");
        this.comfirm_label = this.comfirm_button.getChildByName("comfirm_label").getComponent(cc.Label);
        this.comfirm_label.string = Utils.TI18N("确定");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){

        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openEndlessRewardWindow(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openEndlessRewardWindow(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.comfirm_button, function () {
            this.ctrl.openEndlessRewardWindow(false);
        }.bind(this), 2);
    },

    updateFirstItemData:function(  ){
        var list = this.model.getFirstList();
        this.first_scroll_size = this.first_container.getContentSize();
        if(!this.first_scrollview){
            var setting = {
                item_class: "backpack_item",      // 单元类
                start_x: 10,                  // 第一个单元的X起点
                space_x: 20,                    // x方向的间隔
                start_y: 6,                    // 第一个单元的Y起点
                space_y: 0,                   // y方向的间隔
                item_width: 120,               // 单元的尺寸width
                item_height: 120,              // 单元的尺寸height
                row: 1,                        // 行数，作用于水平滚动类型
                col: 0                         // 列数，作用于垂直滚动类型
            }
            this.first_scrollview = new CommonScrollView();
            this.first_scrollview.createScroll(this.first_container, cc.v2(0,0), ScrollViewDir.horizontal, ScrollViewStartPos.top, this.first_scroll_size, setting);
        }

        if(list){
            var item_list = [];
            for(var i in list){
                var vo = Utils.deepCopy(Utils.getItemConfig(list[i].bid));
                item_list.push(vo);
            }
            this.first_scrollview.setData(item_list,null,{is_show_tips: true})
        }
    },

    updateFiveItemData:function(){
        var list = this.model.getFiveList();
        this.five_scroll_size = this.five_container.getContentSize();
        if(!this.five_scrollview){
            var setting = {
                item_class: "backpack_item",      // 单元类
                start_x: 10,                  // 第一个单元的X起点
                space_x: 20,                    // x方向的间隔
                start_y: 6,                    // 第一个单元的Y起点
                space_y: 0,                   // y方向的间隔
                item_width: 120,               // 单元的尺寸width
                item_height: 120,              // 单元的尺寸height
                row: 1,                        // 行数，作用于水平滚动类型
                col: 0                         // 列数，作用于垂直滚动类型
            }
            this.five_scrollview = new CommonScrollView();
            this.five_scrollview.createScroll(this.five_container, cc.v2(0,0), ScrollViewDir.horizontal, ScrollViewStartPos.top, this.five_scroll_size, setting);
        }
        if(list){
            var item_list = [];
            for(var i in list){
                var vo = Utils.deepCopy(Utils.getItemConfig(list[i].bid));
                item_list.push(vo);
            }
            this.five_scrollview.setData(item_list,null,{is_show_tips: true})
        }
    },

    updateRankItemData:function(){
        var list = this.model.getRankList();
        this.rank_scroll_size = this.rank_container.getContentSize();
        if(!this.rank_scrollview){
            var setting = {
                item_class: "backpack_item",      // 单元类
                start_x: 10,                  // 第一个单元的X起点
                space_x: 20,                    // x方向的间隔
                start_y: 6,                    // 第一个单元的Y起点
                space_y: 0,                   // y方向的间隔
                item_width: 120,               // 单元的尺寸width
                item_height: 120,              // 单元的尺寸height
                row: 1,                        // 行数，作用于水平滚动类型
                col: 0                         // 列数，作用于垂直滚动类型
            }
            this.rank_scrollview = new CommonScrollView();
            this.rank_scrollview.createScroll(this.rank_container, cc.v2(0,0), ScrollViewDir.horizontal, ScrollViewStartPos.top, this.rank_scroll_size, setting);
        }
        if(list){
            var item_list = [];
            for(var i in list){
                var vo = Utils.deepCopy(Utils.getItemConfig(list[i].bid));
                item_list.push(vo);
            }
            this.rank_scrollview.setData(item_list,null,{is_show_tips: true})
        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        this.updateFirstItemData();
        this.updateFiveItemData();
        this.updateRankItemData();
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.first_scrollview){
            this.first_scrollview.deleteMe();
            this.first_scrollview = null;
        }

        if(this.five_scrollview){
            this.five_scrollview.deleteMe();
            this.five_scrollview = null;
        }

        if(this.rank_scrollview){
            this.rank_scrollview.deleteMe();
            this.rank_scrollview = null;
        }

        this.ctrl.openEndlessRewardWindow(false);
    },
})