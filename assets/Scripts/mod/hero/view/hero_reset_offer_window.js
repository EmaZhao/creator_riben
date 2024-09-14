// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-04 17:07:10
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HeroEvent = require("hero_event");
var HeroConst = require("hero_const")
var CommonAlert = require("commonalert")
var Hero_reset_offerWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hero", "hero_reset_offer_panel");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips

        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.is_show_tips = false;//是否显示提示

    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        Utils.getNodeCompByPath("container/confirm_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("献 祭");
        Utils.getNodeCompByPath("container/cancel_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("取 消");

        this.des_txt_lb     = this.seekChild("des_txt", cc.RichText);
        this.list_view_nd   = this.seekChild("list_view");
        this.cancel_btn_nd  = this.seekChild("cancel_btn");
        this.confirm_btn_nd = this.seekChild("confirm_btn");
        this.close_btn_nd = this.seekChild("close_btn");
        this.win_title_lb = this.seekChild("win_title",cc.Label)
        this.cancel_btn_nd.on(cc.Node.EventType.TOUCH_END,function(){
            Utils.playButtonSound(1)
            this.onClickCancelBtn()
        } , this);
        this.confirm_btn_nd.on(cc.Node.EventType.TOUCH_END, function(){
            Utils.playButtonSound(1)
            this.onClickConfirBtn()
        }, this);
        this.close_btn_nd.on(cc.Node.EventType.TOUCH_END, function(){
            Utils.playButtonSound(2)
            this.onClickCloseBtn()
        }, this);

        this.des_txt_lb.string = Utils.TI18N("献祭英雄可获得材料，若英雄有进行升级、进阶、升星培养，也会100%返还所消耗的进阶石、金币和英雄经验。本次献祭所得如下：");
        this.initListView();
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
    // 1 英雄分解 2 碎片分解  3神装分解 4 10星置换 参考 HeroConst.ResetType
    openRootWnd:function(params){
        this.reset_type = params.reset_type
        this.is_show_tips = params.is_show_tips
        if(params.reset_type == HeroConst.ResetType.eHeroReset){
            //英雄献祭
            this.des_txt_lb.string = Utils.TI18N("献祭英雄可获得材料，若英雄有进行升级、进阶、升星培养，也会100%返还所消耗的进阶石、金币和英雄经验。本次献祭所得如下：")
            this.win_title_lb.string = Utils.TI18N("英雄献祭")
            if (params.item_list) {
                this.ctrl.sender11075(params.item_list);
            }
        }else if(params.reset_type == HeroConst.ResetType.eChipReset){
            //碎片献祭
            this.des_txt_lb.string = Utils.TI18N(params.dec)
            this.setItemsData(params.item_list)
            this.win_title_lb.string = Utils.TI18N("碎片献祭")
        }
        if(params.callback){
            this.close_cb = params.callback; 
        }

    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.item_scrollview){
            this.item_scrollview.deleteMe();
            this.item_scrollview = null;
        }
        this.ctrl.openHeroResetOfferPanel(false)
    },

    updateWidgets: function() {

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

    onClickCancelBtn: function() {
        this.onClickCloseBtn();
    },

    onClickConfirBtn: function() {
        this.onClickCloseBtn()
        if(this.reset_type == HeroConst.ResetType.eHeroReset){
            this.onHeroComfirm()
        }else if(this.reset_type == HeroConst.ResetType.eChipReset){
            this.onChipComfirm()
        }


    },

    onClickCloseBtn: function() {
        this.ctrl.openHeroResetOfferPanel(false);
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
    onHeroComfirm(){
        if(this.is_show_tips){
            let str = Utils.TI18N("本次献祭含有5星或以上英雄，是否确认献祭？");
            let other_args = {}
            other_args.title = Utils.TI18N("英雄献祭");
            other_args.delayS = 10;
            let alert = CommonAlert.show(str,Utils.TI18N("确定"),function(){
                if(this.close_cb){
                    this.close_cb()
                }
            }.bind(this), Utils.TI18N("取消"),null,null,null,other_args)
        }else{
            if(this.close_cb){
                this.close_cb()
            }
        }
    },
    onChipComfirm(){
        if(this.is_show_tips){
            let str = Utils.TI18N("本次献祭的碎片满足召唤英雄要求，献祭后可能会失去召唤的机会，是否继续？");
            let other_args = {}
            other_args.title = Utils.TI18N("碎片献祭");
            other_args.delayS = 5;
            //点击跳转
            other_args.extend_str = Utils.TI18N("<on click='handler'><u>前往召唤英雄</u></on>")
            other_args.callFunc = function(){
                var BackpackController = require("backpack_controller")
                var BackPackConst = require("backpack_const")
                BackpackController.getInstance().openMainWindow(true, BackPackConst.item_tab_type.HERO)
                alert.close()
            }.bind(this)
            let alert = CommonAlert.show(str,Utils.TI18N("确定"),function(){
                if(this.close_cb){
                    this.close_cb()
                }
            }.bind(this), Utils.TI18N("取消"),null,null,null,other_args)
        }else{
            if(this.close_cb){
                this.close_cb()
            }
        }
    }
})