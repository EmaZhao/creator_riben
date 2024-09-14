// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-17 19:44:59
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CommonScrollView = require("common_scrollview")
var FuncAwardItem = require("action_func_award_Item")
var ActionController = require("action_controller");
var Action_fund_awardWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("action", "action_fund_award_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this._controller = ActionController.getInstance()
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        var self = this;
        self.background = self.root_wnd.getChildByName("background");
    
        self.container = self.root_wnd.getChildByName("container")
    
        let list_panel = self.container.getChildByName("list_panel")
        let scroll_size = list_panel.getContentSize()
        let setting = {
            item_class : FuncAwardItem,     // -- 单元类
            start_x : 0,                  //-- 第一个单元的X起点
            space_x : 10,                   // -- x方向的间隔
            start_y : 15,                    //-- 第一个单元的Y起点
            space_y : 25,                   //-- y方向的间隔
            item_width : 115,               //-- 单元的尺寸width
            item_height : 129,              //-- 单元的尺寸height
            row : 0,                        //-- 行数，作用于水平滚动类型
            col : 5,                         //-- 列数，作用于垂直滚动类型
            once_num : 5,
        }
        self.item_scrollview = new CommonScrollView()
        self.item_scrollview.createScroll(list_panel, cc.v2(0,0) , ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_size, setting)
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.background.on('touchend',this._onClickCloseBtn,this)
    },
    _onClickCloseBtn(){
        this._controller.openActionFundAwardWindow(false)
    },
    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        let group_id = params.group_id;
        let fund_id = params.fund_id;
        let award_config = Config.month_fund_data.data_fund_award[group_id] || {};

        let award_data = []
        for(let day in award_config){
            let award = award_config[day];
            let day_award = {};
            day_award.day = day;
            day_award.award = award;
            day_award.fund_id = fund_id;
            award_data.push(day_award);
        }
        this.item_scrollview.setData(award_data);
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.item_scrollview){
            this.item_scrollview.deleteMe()
            this.item_scrollview = null;
        }
        this._controller.openActionFundAwardWindow(false)
    },
})