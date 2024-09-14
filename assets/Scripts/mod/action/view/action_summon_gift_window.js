// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-08-23 10:20:23
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ActionConst = require("action_const");
var ActionEvent = require("action_event");
var ActionSummonGiftWinodw = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("action", "action_summon_gift_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = require("action_controller").getInstance();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.main_container = this.seekChild("main_container");
        this.main_container.scale = 0;
        this.main_container.runAction(cc.scaleTo(0.2,1));
        this.buy_btn = this.main_container.getChildByName("buy_btn");
        this.buy_btn_label = this.buy_btn.getChildByName("Label").getComponent(cc.Label);
        this.textLabel = this.main_container.getChildByName("text").getComponent(cc.Label);
        this.goods_list = this.main_container.getChildByName("goods_list");
        this.goods_list_layout = this.goods_list.getComponent(cc.Layout);
        this.close_btn = this.main_container.getChildByName("btn_close");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.close_btn.on(cc.Node.EventType.TOUCH_END,()=>{
            this.ctrl.openSummonGiftWindow(false);
        });
        this.buy_btn.on(cc.Node.EventType.TOUCH_END,()=>{
            if(this.current_count>=this.totle_count){
                return;
            }
            let charge_config = Config.charge_data.data_charge_data[this.chargeId || 0];
            if(charge_config){
                SDK.pay(charge_config.val,1,charge_config.id,charge_config.name, charge_config.product_desc,null,null,charge_config.pay_image)
            }
        })

        this.addGlobalEvent(ActionEvent.UPDATE_HOLIDAY_SIGNLE,(data)=>{
            if(!data)return;
            if(data.bid == this.bid){
                if(data.aim_list.length>0){//刷新数据
                    this.data = data.aim_list[0];
                    this.refreshUI();
                }
            }
        })
    },
    
    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        if(params){
            this.bid = params.data.bid
            this.data = params.data.aim_list[0];
        }
        this.createReward();
        this.refreshUI()
    },

    createReward(){
        if(!this.data){
            return;
        }
        let reward = this.data.item_list;//奖励
        let scale
        if(reward.length > 4){
            scale = 0.8;
            this.goods_list_layout.type = cc.Layout.Type.GRID;
            this.goods_list_layout.spacingX = 20;
            this.goods_list_layout.spacingY = 15;
            this.goods_list.width = 450;
        }else{
            scale = 1;
            this.goods_list_layout.type = cc.Layout.Type.HORIZONTAL;
            this.goods_list.width = 0;
            this.goods_list_layout.spacingX = 8
        }
        for(var index in reward){
            var rewardInfo = reward[index];
            let node = new cc.Node()
            node.setContentSize(120*scale,120*scale)
            this.goods_list.addChild(node)
            let item = ItemsPool.getInstance().getItem("backpack_item");
            item.initConfig(false,scale,false,true)
            item.setParent(node)
            item.show()
            item.setData({bid:rewardInfo.bid,num:rewardInfo.num})   
        }
    },

    refreshUI(){
        if(!this.data){
            return;
        }
        // 折扣前价格、折扣后价格
        var price = null;
        var discount_price = null;
        var price_list = Utils.keyfind('aim_args_key', ActionConst.ActionExtType.ActivityOldPrice, this.data.aim_args);
        var dis_price_list = Utils.keyfind('aim_args_key', ActionConst.ActionExtType.ActivityCurrentPrice, this.data.aim_args);
        price = price_list.aim_args_val || 0;
        discount_price = dis_price_list.aim_args_val || 0;
        this.buy_btn_label.string = price;//目前无折扣价
        //支付id
        this.chargeId = Utils.keyfind('aim_args_key', ActionConst.ActionExtType.ItemRechargeId, this.data.aim_args).aim_args_val;
        // 限购：已购次数/总次数
      
        var current_list = Utils.keyfind('aim_args_key', ActionConst.ActionExtType.RechageCurCount, this.data.aim_args);
        var totle_list = Utils.keyfind('aim_args_key', ActionConst.ActionExtType.RechageTotalCount, this.data.aim_args);
        this.current_count = current_list.aim_args_val || 0;
        this.totle_count = totle_list.aim_args_val || 0;
        this.textLabel.string = cc.js.formatStr("残り購入回数：%d/%d",this.totle_count-this.current_count,this.totle_count);

        if(this.current_count>=this.totle_count){
            this.buy_btn.getComponent(cc.Button).interactable = false;
            this.buy_btn.getComponent(cc.Button).enableAutoGrayEffect = true;
            this.buy_btn.getChildByName("sprite").getComponent(cc.Button).enableAutoGrayEffect = true;
            gcore.GlobalEvent.fire(ActionEvent.GIFT_BUY_EVENT,this.bid);
        }
    },
  

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
       
    },
})