// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-02 09:56:02
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var RoleController = require("role_controller");
var VipEvent = require("vip_event");
var CommonScrollView = require("common_scrollview");
var DailyGiftItem = require("daily_gift_item");
var WelfareEvent = require("welfare_event");
var WelfareController = require("welfare_controller");

var Daily_giftPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("vip", "daily_gift_panel");
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.role_vo = RoleController.getInstance().getRoleVo();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.main_container = this.seekChild("main_container");
        this.daily_btn = this.seekChild(this.main_container,"daily_btn");
        this.daily_btn_tips = this.seekChild(this.daily_btn,"redpoint");

        var scrollCon = this.seekChild(this.main_container,"scrollCon")
        var tab_size = scrollCon.getContentSize();
        var setting = {
            item_class: DailyGiftItem,      // 单元类
            start_x: 0,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: 668,               // 单元的尺寸width
            item_height: 213,              // 单元的尺寸height
            row: 1,                        // 行数，作用于水平滚动类型
            col: 1,                        // 列数，作用于垂直滚动类型
            // need_dynamic: true
        }
        this.item_scrollview = new CommonScrollView();
        this.item_scrollview.createScroll(scrollCon, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, tab_size, setting, cc.v2(0.5, 0.5))
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.addGlobalEvent(VipEvent.DAILY_GIFT_INFO,function ( ){
            this.setData();
        },this)

        this.addGlobalEvent(WelfareEvent.Update_Daily_Awawd_Data,function ( ){
            this.updateDailyAwardRed();
        },this)

        Utils.onTouchEnd(this.daily_btn, function () {
            WelfareController.getInstance().sender21009()
        }.bind(this), 1)
    },

    setData:function(){
        var gift_data = [];
        var config = Config.charge_data.data_daily_gift_data
        for(var k in config){
            gift_data.push(config[k]);
        }
        gift_data.sort(Utils.tableLowerSorter(["id"]));
        this.item_scrollview.setData(gift_data);
        this.updateDailyAwardRed();
    },

    setVisibleStatus:function(status){
        this.setVisible(status);
    },

    //每日礼包按钮红点更新
    updateDailyAwardRed:function(){
        var red_status = false;
        var award_status = WelfareController.getInstance().getModel().getDailyAwardStatus();
        if(award_status == 0){
            red_status = true;
        }
        this.daily_btn_tips.active = red_status;
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){
        this.setData();
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.item_scrollview){
            this.item_scrollview.deleteMe();
            this.item_scrollview= null
        }
    },
})