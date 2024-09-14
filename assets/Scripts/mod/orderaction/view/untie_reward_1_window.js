// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     奖励总览
// <br/>Create: 2019-08-15 20:06:14
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CommonScrollView = require("common_scrollview");

var Untie_reward_1Window = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("orderaction", "untie_reward_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){

    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        var background = this.root_wnd.getChildByName("background");
        background.scale = FIT_SCALE;
        
        this.main_container = this.root_wnd.getChildByName("main_container");
        var title_label = this.main_container.getChildByName("title_con").getChildByName("title_label").getComponent(cc.Label);
        title_label.string = Utils.TI18N("奖励总览");
        
        this.btn_buy = this.main_container.getChildByName("btn_buy");
        var btn_buy_lab = this.btn_buy.getChildByName("Text_1").getComponent(cc.Label);
        btn_buy_lab.string = Utils.TI18N("解锁领取");
        if(this.model.getGiftStatus() == 1){
            btn_buy_lab.string = Utils.TI18N("查看进阶卡");
        }
        this.commonShowReward();
        this.btn_close = this.main_container.getChildByName("btn_close");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.btn_close, function () {
            this.ctrl.openUntieRewardView(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.btn_buy, function () {
            this.ctrl.openBuyCardView(true)
        }.bind(this), 1);
    },

    commonShowReward:function(){
        var goods_1 = this.main_container.getChildByName("goods_1");
        var scroll_view_size = goods_1.getContentSize();
        var setting = {
            item_class: "backpack_item",
            start_x: 32,
            space_x: 20,
            start_y: 0,
            space_y: 0,
            item_width: 120,
            item_height: 120,
            row: 1,
            col: 4,
        }
        this.item_good_1 = new CommonScrollView()
        this.item_good_1.createScroll(goods_1, cc.v2(0,0), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting);

        var period = this.model.getCurPeriod();
        if(Config.holiday_war_order_data.data_lev_reward_list[period]){
            var count = Object.keys(Config.holiday_war_order_data.data_lev_reward_list[period]).length;
            var list = [];
            var dic_items = {};
            for(var i=1;i<=count;i++){
                if(Config.holiday_war_order_data.data_lev_reward_list[period][i]){
                    if(Config.holiday_war_order_data.data_lev_reward_list[period][i].reward){
                        for(var j in Config.holiday_war_order_data.data_lev_reward_list[period][i].reward){
                            var v = Config.holiday_war_order_data.data_lev_reward_list[period][i].reward[j];
                            if(dic_items[v[0]]){
                                dic_items[v[0]] = dic_items[v[0]] + v[1];
                            }else{
                                dic_items[v[0]] = v[1];
                            }
                        }
                        for(var j in Config.holiday_war_order_data.data_lev_reward_list[period][i].rmb_reward){
                            var v = Config.holiday_war_order_data.data_lev_reward_list[period][i].rmb_reward[j];
                            if(dic_items[v[0]]){
                                dic_items[v[0]] = dic_items[v[0]] + v[1];
                            }else{
                                dic_items[v[0]] = v[1];
                            }
                        }
                    }
                }
            }
            var price_list = Config.holiday_war_order_data.data_price_list;
            for(var id in dic_items){
                var sort = 0;
                if(price_list[id]){
                    sort = price_list[id].sort || 0;
                }
                list.push({bid: id, num: dic_items[id], sort: sort});
            }
            list.sort(function(a,b){
                return a.sort - b.sort;
            })
            this.item_good_1.setData(list);
            this.item_good_1.addEndCallBack(function(){
                var item_list = this.item_good_1.getItemList();
                for(var k in item_list){
                    item_list[k].setDefaultTip();
                }
            }.bind(this));
        }
    },



    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){

    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.item_good_1){
            this.item_good_1.deleteMe()
            this.item_good_1 = null;
        }
        this.ctrl.openUntieRewardView(false);
    },
})