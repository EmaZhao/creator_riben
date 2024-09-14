// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     购买进阶卡
// <br/>Create: 2019-08-10 16:22:18
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var OrderActionEvent = require("orderaction_event");

var Untie_rewardWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("orderaction", "untie_reward_window1");
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
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        var main_container = this.root_wnd.getChildByName("main_container");
        this.image_bg = main_container.getChildByName("Sprite_1").getComponent(cc.Sprite);
        
        var text_3 = main_container.getChildByName("Text_3").getComponent(cc.Label);
        text_3.string = Utils.TI18N("进阶赠礼");
        var text_3_0 = main_container.getChildByName("Text_3_0").getComponent(cc.Label);
        text_3_0.string = Utils.TI18N("激活可直接领取奖励");
        
        var text_3_1 = main_container.getChildByName("Text_3_1").getComponent(cc.Label);
        text_3_1.string = Utils.TI18N("活动期间可领取奖励");
        
        var bg_res = PathTool.getBigBg("orderaction/orderaction_banner4");
        var cur_period = this.model.getCurPeriod();
        if(cur_period == 2){
            bg_res = PathTool.getBigBg("orderaction/orderaction_banner5");
            this.image_bg.node.setContentSize(cc.size(651, 666));
            this.image_bg.node.setPosition(cc.v2(0, 4));
            text_3_0.node.color = text_3_1.node.color = new cc.Color(0x9e,0x01,0x12,0xff);
        }

        this.loadRes(bg_res, function (res) {
            this.image_bg.spriteFrame = res
        }.bind(this))

        this.btn_change = main_container.getChildByName("btn_change");
        this.btn_change_btn = this.btn_change.getComponent(cc.Button);
        this.btn_change_label = this.btn_change.getChildByName("Text_6").getComponent(cc.Label);
        this.btn_change_label.string = Utils.TI18N("￥198购买");
        if(this.model.getGiftStatus() == 1){
            this.btn_change_btn.interactable = false;
            this.btn_change_btn.enableAutoGrayEffect = true;
            this.btn_change_label.node.getComponent(cc.LabelOutline).enabled = false;
        }

        this.goods_1 = main_container.getChildByName("goods_1");
        this.goods_content_1 = this.goods_1.getChildByName("content");
        
        this.goods_2 = main_container.getChildByName("goods_2");
        this.goods_content_2 = this.goods_2.getChildByName("content");

        this.setData();
 
        this.btn_close = main_container.getChildByName("btn_close");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.addGlobalEvent(OrderActionEvent.OrderAction_BuyGiftCard_Event,function(){
            if(this.model.getGiftStatus() == 1){
                this.btn_change_btn.interactable = false;
                this.btn_change_btn.enableAutoGrayEffect = true;
                this.btn_change_label.node.getComponent(cc.LabelOutline).enabled = false;
            }
        }.bind(this));

        Utils.onTouchEnd(this.btn_close, function () {
            this.ctrl.openBuyCardView(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openBuyCardView(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.btn_change, function () {
            this.changeWarn();
        }.bind(this), 1);
    },

    setData:function(){
        var card_list = Config.holiday_war_order_data.data_advance_card_list

	    var period = this.model.getCurPeriod();
        if(card_list && card_list[period] && card_list[period][1]){
            var data_list = card_list[period][1].reward_1 || {};
            var setting = {};
            setting.scale = 0.7;
            setting.space_x = 3;
            setting.max_count = 4;
            setting.is_center = true;
            this.item_list1 = Utils.commonShowSingleRowItemList(this.goods_1, this.item_list1, data_list, setting,this.goods_content_1);

            var data_list = card_list[period][1].reward_2 || {};
            var setting = {};
            setting.scale = 0.7;
            setting.max_count = 4;
            setting.is_center = true;
            this.item_list2 = Utils.commonShowSingleRowItemList(this.goods_2, this.item_list2, data_list, setting,this.goods_content_2);
        }
    },

    changeWarn:function(){
        if(this.model.getGiftStatus() == 1)return;
        var day = this.model.getCurDay();
        var charge_list = Config.charge_data.data_charge_data;
        var card_list = Config.holiday_war_order_data.data_advance_card_list;
        var period = this.model.getCurPeriod();

        if(card_list && card_list[period] && card_list[period][1]){
            var str = null;
            if(day >= 25){
                if(day == 30){
                    str = Utils.TI18N("活动将在今天结束，是否确认充值");
                }else{
                    str = cc.js.formatStr(Utils.TI18N("活动将在 %d 天后结束，是否确认充值"),30-day);
                }
            }
    
            if(str){
                var CommonAlert = require("commonalert");
                CommonAlert.show(str, Utils.TI18N("确定"), function(){
                    var charge_id = card_list[period][1].charge_id || null;
                    if(charge_id && charge_list[charge_id]){
                        SDK.pay(charge_list[charge_id].val, 1, charge_list[charge_id].id, charge_list[charge_id].name,charge_list[charge_id].product_desc,null,null,charge_list[charge_id].pay_image);
                    }
                }.bind(this),Utils.TI18N("取消"),null,Utils.TI18N("奖励"));
            }else{
                var charge_id = card_list[period][1].charge_id || null;
                if(charge_id && charge_list[charge_id]){
                    SDK.pay(charge_list[charge_id].val, 1, charge_list[charge_id].id, charge_list[charge_id].name,charge_list[charge_id].product_desc,null,null,charge_list[charge_id].pay_image);
                }
            }
        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){

    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.item_list1){
            for(var i in this.item_list1){
                this.item_list1[i].deleteMe();
            }
            this.item_list1 = null;
        }

        if(this.item_list2){
            for(var i in this.item_list2){
                this.item_list2[i].deleteMe();
            }
            this.item_list2 = null;
        }

        this.ctrl.openBuyCardView(false);
    },
})