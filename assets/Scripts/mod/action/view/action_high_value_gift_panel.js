// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     超值礼包/限时礼包
// <br/>Create: 2019-07-03 19:20:01
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ActionEvent = require("action_event");
var ActionConst = require("action_const");
var ActionController = require("action_controller")
var CommonScrollView = require("common_scrollview");

var Action_high_value_giftPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("action", "action_high_value_gift_panel");
        this.holiday_bid = arguments[0]
    },


    // 可以初始化声明一些变量的
    initConfig:function(){
        this.ctrl = ActionController.getInstance();
        this.model = this.ctrl.getModel();
        this.touch_btn = true;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.main_container = this.root_wnd.getChildByName("main_container");
        this.img_bg = this.main_container.getChildByName("img_bg").getComponent(cc.Sprite);
        var str = "txt_cn_action_high_value_gift_panel";
        var config_data = Config.function_data.data_limit_little_recharge[this.holiday_bid];
        if(config_data && config_data.bg_name && config_data.bg_name != ""){
            str = config_data.bg_name;
        }

        var res = PathTool.getBigBg(str,null,"action");
        this.loadRes(res, (function(resObject){
            this.img_bg.spriteFrame = resObject;
        }).bind(this));
    
        this.txt_time_title = this.main_container.getChildByName("txt_time_title").getComponent(cc.Label); 	//时间标题
        this.txt_time_title.string = Utils.TI18N("剩余时间:");
        
        this.txt_time_title.node.color = new cc.Color().fromHEX(config_data.time_title_color.toString());      //设置字体颜色
        this.txt_time_title_line = this.main_container.getChildByName("txt_time_title").getComponent(cc.LabelOutline);
        this.txt_time_title_line.color = new cc.Color().fromHEX(config_data.time_stroke_color);
        
        this.txt_time_val = this.main_container.getChildByName("txt_time_val").getComponent(cc.Label); 		//剩余时间
        this.txt_time_val.node.color = new cc.Color().fromHEX(config_data.time_title_color);
        this.txt_time_val_line = this.main_container.getChildByName("txt_time_val").getComponent(cc.LabelOutline);
        this.txt_time_val_line.color = new cc.Color().fromHEX(config_data.time_stroke_color);
        
        this.txt_price = this.main_container.getChildByName("txt_price").getComponent(cc.Label); 				//礼包原价
        this.txt_price.node.color = new cc.Color().fromHEX(config_data.common_color);
        this.txt_discount_title = this.seekChild("txt_discount_title", cc.Label);
        this.txt_discount_title.string = "現在の価格：";
        this.txt_discount_title.node.color = new cc.Color().fromHEX(config_data.common_color);
        this.txt_discount_price = this.seekChild("txt_discount_price", cc.Label);
        this.txt_discount_price.node.color = new cc.Color().fromHEX(config_data.common_color);
        this.txt_limit_time = this.main_container.getChildByName("txt_limit_time").getComponent(cc.Label); 	//礼包限购次数
        this.txt_limit_time.node.color = new cc.Color().fromHEX(config_data.common_color);

        this.btn_buy = this.main_container.getChildByName("btn_buy");
        this.btn_buy_bt = this.main_container.getChildByName("btn_buy").getComponent(cc.Button);
        this.txt_buy = this.btn_buy.getChildByName("txt_buy").getComponent(cc.Label);
        this.txt_buy.string = Utils.TI18N("立即抢购");
        this.txt_buy_line = this.btn_buy.getChildByName("txt_buy").getComponent(cc.LabelOutline);
        
        var send_data = config_data.send_data;
        if(send_data && Utils.next(send_data) != null){
            // var bid = send_data[0][0];
            // var num = send_data[0][1];
            // var send_img = Utils.createImage(this.main_container,null, 229, 608, cc.v2(0,0.5),false, 1, false);
            // this.loadRes(PathTool.getItemRes(bid), (function(send_img,resObject){
            //     send_img.spriteFrame = resObject;
            // }).bind(this,send_img));
            // send_img.node.scale = 0.4;
            //
            // this.send_num_nd = this.seekChild("send_val");
            // this.send_num_nd.active = true;
            // this.send_num = this.send_num_nd.getComponent("CusRichText");
            // this.send_num.setNum(num);
        }

        this.goods_list = this.main_container.getChildByName("goods_list");
        var scroll_size = this.goods_list.getContentSize();
        var setting = {
            item_class: "backpack_item",      // 单元类
            start_x: 10,                  // 第一个单元的X起点
            space_x: 25,                    // x方向的间隔
            start_y: 8,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: 120 * 0.9,   // 单元的尺寸width
            item_height: 120 * 0.9, // 单元的尺寸height
            row: 1,                        // 行数，作用于水平滚动类型
            col: 0,                         // 列数，作用于垂直滚动类型
        }
        
        this.item_scroll_view = new CommonScrollView();
        this.item_scroll_view.createScroll(this.goods_list, cc.v2(-scroll_size.width/2,0) , ScrollViewDir.horizontal, ScrollViewStartPos.top, scroll_size, setting);
        this.item_scroll_view.setClickEnabled(false);
        
        if(this.holiday_bid == ActionConst.ActionRankCommonType.week_gift){
            this.txt_time_title.node.y = 569;
            this.txt_time_val.node.y = 569;
        }
        this.ctrl.cs16603(this.holiday_bid);
        this.model.setGiftRedStatus({bid: ActionConst.ActionRankCommonType.high_value_gift, status: false})
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.addGlobalEvent(ActionEvent.UPDATE_HOLIDAY_SIGNLE,function(data){
            if(!data)return;
            if(data.bid == this.holiday_bid){
                this.setData(data);
            }
        }.bind(this));

        this.addGlobalEvent(ActionEvent.Is_Charge_Event,function(data){
            if(data && data.status && data.charge_id){
                var charge_config = Config.charge_data.data_charge_data[data.charge_id];
                if(charge_config && data.status == 1 && data.charge_id == this.cur_charge_id){
                    SDK.pay(charge_config.val, 1, charge_config.id, charge_config.name, charge_config.product_desc,null,null,charge_config.pay_image);
                }
            }
        }.bind(this));

        Utils.onTouchEnd(this.btn_buy, function () {
            if(!this.touch_btn)return;
            if(this.get_item_ticket == null){
                this.get_item_ticket = gcore.Timer.set(function () {
                    this.touch_btn = true;
                    if(this.get_item_ticket!=null){
                        gcore.Timer.del(this.get_item_ticket);
                        this.get_item_ticket = null;
                    }
                }.bind(this), 2, 1);
                
                this.touch_btn = null;
                if(this.data && this.data.charge_id && this.data.left_time > 0){
                    this.cur_charge_id = this.data.charge_id;
                    this.ctrl.sender21016(this.data.charge_id);
                }
            }
        }.bind(this), 1);
    },

    setData:function(data){
        if(!data)return;
        // 倒计时
        var time = data.remain_sec || 0;
        this.model.setCountDownTime(this.txt_time_val, time);

        this.data = data.aim_list[0];
        // 限购：已购次数/总次数
        var totle_count = null;
        var current_count = null;
        var current_list = Utils.keyfind('aim_args_key', ActionConst.ActionExtType.RechageCurCount, this.data.aim_args);
        var totle_list = Utils.keyfind('aim_args_key', ActionConst.ActionExtType.RechageTotalCount, this.data.aim_args);
        current_count = current_list.aim_args_val || 0;
        totle_count = totle_list.aim_args_val || 0;
        this.txt_limit_time.string = cc.js.formatStr(Utils.TI18N("限定：%d/%d"),current_count,totle_count);

        // 剩余购买次数
        this.data.left_time = totle_count - current_count;
        // 折扣前价格、折扣后价格
        var price = null;
        var discount_price = null;
        var price_list = Utils.keyfind('aim_args_key', ActionConst.ActionExtType.ActivityOldPrice, this.data.aim_args);
        var dis_price_list = Utils.keyfind('aim_args_key', ActionConst.ActionExtType.ActivityCurrentPrice, this.data.aim_args);
        price = price_list.aim_args_val || 0;
        discount_price = dis_price_list.aim_args_val || 0;
        this.txt_price.string = cc.js.formatStr(Utils.TI18N("原价：%d"), price);
        this.txt_discount_price.string = cc.js.formatStr("%d", discount_price);

        var charge_list = Utils.keyfind('aim_args_key', ActionConst.ActionExtType.ItemRechargeId, this.data.aim_args);
        // 支付物品ID
        this.data.charge_id = charge_list.aim_args_val || 0;
        // 加载礼包物品列表
        this.loadRewardList(this.data.item_list);
        if(this.data.left_time == 0){
            this.txt_buy.string = Utils.TI18N("已领取");
            this.btn_buy_bt.interactable = false;
            this.btn_buy_bt.enableAutoGrayEffect = true;
        }else{
            this.btn_buy_bt.interactable = true;
            this.btn_buy_bt.enableAutoGrayEffect = false;
        }
    },

    loadRewardList:function(item_list){
        var list = [];
        if(item_list.length>0){
            for(var i in item_list){
                var vo = {};
                if(vo){
                    vo.bid = item_list[i].bid;
                    vo.num = item_list[i].num;
                    list.push(vo);
                }
            }
            var item_count = list.length;
            var scroll_size = this.goods_list.getContentSize();
            if(item_count > 5){
                this.item_scroll_view.setClickEnabled(true);
                if(this.item_scroll_view.root_wnd){
                    this.item_scroll_view.root_wnd.x = -scroll_size.width/2;
                }
                
            }else{
                this.item_scroll_view.setClickEnabled(false);
                if(this.item_scroll_view.root_wnd){
                    this.item_scroll_view.root_wnd.x = -scroll_size.width/2+(5 - item_count) * 10 + (4 - item_count) * 55;
                }
            }
            this.item_scroll_view.setData(list);
            this.item_scroll_view.addEndCallBack(function(){
                var list = this.item_scroll_view.getItemList();
                for(var i in list){
                    list[i].setDefaultTip();
                }
            }.bind(this));
        }
    },

    setVisibleStatus:function(bool){
        bool = bool || false;
        this.setVisible(bool);
    },
	

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){

    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.item_scroll_view){
            this.item_scroll_view.deleteMe()
            this.item_scroll_view = null;
        }

        if(this.get_item_ticket!=null){
            gcore.Timer.del(this.get_item_ticket);
            this.get_item_ticket = null;
        }
    },
})