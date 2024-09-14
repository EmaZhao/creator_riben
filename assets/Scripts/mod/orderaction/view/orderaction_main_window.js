// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     战令活动
// <br/>Create: 2019-08-10 16:25:19
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var OrderactionConst = require("orderaction_const");
var OrderActionEvent = require("orderaction_event");
var ActionController = require("action_controller")
var CommonAlert = require("commonalert");

var Orderaction_mainWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("orderaction", "orderaction_main_window1");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.tab_view = {};
        this.tab_panel_list = {}; //视图
        this.cur_index = null;
        this.cur_box_status = null;
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        this.main_container = this.root_wnd.getChildByName("main_container");

        this.btn_untie_reward = this.main_container.getChildByName("btn_untie_reward");
        // 解锁奖励总览
        this.btn_open_lock = this.main_container.getChildByName("btn_open_lock");
        this.btn_open_lock_label = this.btn_open_lock.getChildByName("name").getComponent(cc.Label);
        this.btn_open_lock_bg = this.btn_open_lock.getComponent(cc.Sprite);
        
        this.btn_open_lock_label.string = "";
        // 购买等级
        this.btn_buy_lev = this.main_container.getChildByName("btn_buy_lev");
        var text_2 = this.btn_buy_lev.getChildByName("Text_2").getComponent(cc.Label);
        text_2.string = Utils.TI18N("购买等级");
        
        var tab_view = this.main_container.getChildByName("tab_view");
        var title_name = [Utils.TI18N("奖励"),Utils.TI18N("任务")];
        for(var i=1;i<=2;i++){
            var tab = {};
            tab.btn_tab_view = tab_view.getChildByName("tab_"+i);
            tab.normal = tab.btn_tab_view.getChildByName("normal");
            tab.select = tab.btn_tab_view.getChildByName("select");
            tab.select.active = false;
            tab.name = tab.btn_tab_view.getChildByName("name").getComponent(cc.Label);
            tab.name.string = title_name[i-1];
            tab.icon = tab.btn_tab_view.getChildByName("icon");
            tab.icon.opacity = 178;
            tab.index = i;
            this.tab_view[i] = tab;
        }

        // 进度条
        this.bar_bg = this.main_container.getChildByName("bar_bg");
        this.bar = this.bar_bg.getChildByName("bar").getComponent(cc.ProgressBar);
        this.bar.progress = 0;
        this.bar_num = this.bar_bg.getChildByName("bar_num").getComponent(cc.Label);
        this.bar_num.string = "";
        this.bar_num_line = this.bar_bg.getChildByName("bar_num").getComponent(cc.LabelOutline);

        // 底部图片
        this.banner_botton = this.main_container.getChildByName("banner_botton").getComponent(cc.Sprite);
        // 活动时间与领取
        this.time_text_bg = this.main_container.getChildByName("Text_4").getComponent(cc.Label);
        this.time_text_bg.string = Utils.TI18N("活动剩余时间:");
        this.time_text = this.main_container.getChildByName("time_text").getComponent(cc.Label);
        this.time_text.string = "";
        this.all_get = this.main_container.getChildByName("all_get");
        var text_6 = this.all_get.getChildByName("Text_6").getComponent(cc.Label);
        text_6.string = Utils.TI18N("一键领取");
        
        //  进阶卡购买
        this.advance_card_buy = this.main_container.getChildByName("advance_card_buy");
        this.advance_card_buy_btn = this.main_container.getChildByName("advance_card_buy").getComponent(cc.Button);
        this.advance_card_buy_label = this.advance_card_buy.getChildByName("Text").getComponent(cc.Label);
        this.advance_card_buy_label.string = "";
        this.advance_card_buy.active = false;

        this.tabMainPeriodView_3();
        this.btn_rule = this.main_container.getChildByName("btn_rule");
        this.btn_close = this.main_container.getChildByName("btn_close");
    },

    // 第三期
    tabMainPeriodView_3:function(){
        this.level_num = this.main_container.getChildByName("level_num").getComponent(cc.Label);
        this.level_num_line = this.main_container.getChildByName("level_num").getComponent(cc.LabelOutline);
        this.level_num.string = "";
        var text_21 = this.main_container.getChildByName("Text_21").getComponent(cc.Label);
        text_21.string = Utils.TI18N("战令等级");
        var text_21_line = this.main_container.getChildByName("Text_21").getComponent(cc.LabelOutline);

        var desc = Utils.createRichLabel(20, new cc.Color(0xff,0xff,0xff,0xff), cc.v2(0, 0.5), cc.v2(-110,316),30,400);
        desc.horizontalAlign = cc.macro.TextAlignment.LEFT;
        this.main_container.addChild(desc.node);
        
        var text_1 = this.main_container.getChildByName("Image_1").getChildByName("Text_1").getComponent(cc.Label);
        
        this.activity_time = this.main_container.getChildByName("activity_time").getComponent(cc.Label);
        this.activity_time.string = "";
        this.activity_time_line = this.main_container.getChildByName("activity_time").getComponent(cc.LabelOutline);
        this.activity_time_line.enabled = false;

        this.title_barner = this.main_container.getChildByName("title_barner").getComponent(cc.Sprite);
        var title_res = PathTool.getBigBg("orderaction/orderaction_banner3");
        var botton_res = PathTool.getBigBg("orderaction/orderaction_banner1");
        var str = cc.js.formatStr(Utils.TI18N("通过<color=#ffd200>完成任务</color>提升等级，领取奖励"));
        var cur_period = this.model.getCurPeriod();
        var line_color = new cc.Color(0x08,0x2f,0x60,0xff);
        var title_name = Utils.TI18N("缤纷盛夏");
        if(cur_period == 2){
            title_res = PathTool.getBigBg("orderaction/orderaction_top6");
            botton_res = PathTool.getBigBg("orderaction/orderaction_buttom6");
            this.title_barner.node.setPosition(cc.v2(8, 195));
            this.title_barner.node.setContentSize(cc.size(671, 303));
            this.banner_botton.node.setContentSize(cc.size(720, 94));
            str = cc.js.formatStr(Utils.TI18N(" <outline=2,color=#7f3a18>通过<color=#ffd200>完成任务</color>提升等级，领取奖励</outline>"));
            line_color = new cc.Color(0x7f,0x3a,0x18,0xff);
            title_name = Utils.TI18N("花火映秋");
            this.activity_time_line.enabled = true;
            this.activity_time.node.color = new cc.Color(0xff,0xff,0xff,0xff);
        }
        desc.string = str;
        this.bar_num_line.color = line_color;
        text_21_line.color = line_color;
        this.level_num_line.color = line_color;
        this.activity_time_line.color = line_color;
        text_1.string = title_name;
        
        this.loadRes(title_res, function (res) {
            this.title_barner.spriteFrame = res;
        }.bind(this));

        this.loadRes(botton_res, function (res) {
            this.banner_botton.spriteFrame = res;
        }.bind(this));

        
        var text_3 = this.btn_untie_reward.getChildByName("Text_3").getComponent(cc.Label);
        text_3.string = Utils.TI18N("额外经验包");
        
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.addGlobalEvent(OrderActionEvent.OrderAction_Init_Event,function(data){
            this.tabChargeView(1,data.period);
            this.setBasicInitData(data);
            this.updateBoxStatus();
            this.getTaskRedPoint();
            var time = data.end_time - gcore.SmartSocket.getTime();
            ActionController.getInstance().getModel().setCountDownTime(this.time_text,time);
            if(this.activity_time){
                var config = Config.holiday_war_order_data.data_constant;
                if(config && config.action_time){
                    this.activity_time.string = Utils.TI18N("活动时间：")+config.action_time.desc;
                }
            }
        }.bind(this));

        // 任务更新
        this.addGlobalEvent(OrderActionEvent.OrderAction_TaskGet_Event,function(){
            this.getTaskRedPoint();
        }.bind(this));

        this.addGlobalEvent(OrderActionEvent.OrderAction_LevReward_Event,function(){
            this.statusTabRewardRedPoint();
        }.bind(this));

        this.addGlobalEvent(OrderActionEvent.OrderAction_Updata_LevExp_Event,function(data){
            this.setBasicInitData(data);
            this.model.setRewardLevRedPoint();
            this.statusTabRewardRedPoint();
        }.bind(this));

        this.addGlobalEvent(OrderActionEvent.OrderAction_IsPopWarn_Event,function(data){
            if(data){
                var totle_day = 30;
                if((totle_day - data.cur_day) == 7 || (totle_day - data.cur_day) == 3 || (totle_day - data.cur_day) == 0){
                    if(data.is_pop == 1){
                        this.ctrl.openEndWarnView(true,data.cur_day);
                    }
                }
            }
        }.bind(this));

        this.addGlobalEvent(OrderActionEvent.OrderAction_BuyGiftCard_Event,function(){
            this.updateBoxStatus();
            if(this.model.getGiftStatus() == 1){
                this.advance_card_buy_btn.interactable = false;
                this.advance_card_buy_btn.enableAutoGrayEffect = true;
                this.advance_card_buy_label.node.getComponent(cc.LabelOutline).enabled = false;
                this.btn_open_lock_label.string = Utils.TI18N("奖励总览");
                this.btn_open_lock_label.node.color = OrderactionConst.ColorConst[1];
                if(this.btn_open_lock_bg){
                    this.loadRes(PathTool.getUIIconPath("common", "common_1027"), function (sf_obj) {
                        this.btn_open_lock_bg.spriteFrame = sf_obj;
                    }.bind(this));
                }
            }else{
                this.advance_card_buy_btn.interactable = true;
                this.advance_card_buy_btn.enableAutoGrayEffect = false;
                this.advance_card_buy_label.node.getComponent(cc.LabelOutline).enabled = true;
                this.btn_open_lock_label.string = Utils.TI18N("解锁领取");
            }
        }.bind(this));

        Utils.onTouchEnd(this.btn_buy_lev, function () {
            var cur_period = this.model.getCurPeriod();
            if(Config.holiday_war_order_data.data_lev_reward_list[cur_period]){
                var cur_lev = this.model.getCurLev();
                if(cur_lev >= 40){
                    message(Utils.TI18N("您已满级，无法购买~~~"));
                }else{
                    this.ctrl.openBuyLevView(true);
                }
            }
        }.bind(this), 1);

        Utils.onTouchEnd(this.btn_untie_reward, function () {
            if(this.model.getGiftStatus() == 1){
                this.ctrl.send25308();
            }else{
                this.ctrl.openBuyCardView(true);
            }
        }.bind(this), 1);

        for(var i in this.tab_view){
            Utils.onTouchEnd(this.tab_view[i].btn_tab_view, function (tab) {
                var day = this.model.getCurDay();
                var period = this.model.getCurPeriod();
                this.tabChargeView(tab.index,period);
            }.bind(this,this.tab_view[i]), 3);
        }

        Utils.onTouchEnd(this.btn_open_lock, function () {
            var day = this.model.getCurDay();
            if(this.model.getGiftStatus() == 1){
                this.ctrl.openUntieRewardView(true);
            }else{
                this.ctrl.openBuyCardView(true);
            }
        }.bind(this), 1);

        Utils.onTouchEnd(this.btn_close, function () {
            this.ctrl.openOrderActionMainView(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openOrderActionMainView(false);
        }.bind(this), 2);

        this.btn_rule.on(cc.Node.EventType.TOUCH_END, function (event) {
            var config = Config.holiday_war_order_data.data_constant;
            var period = this.model.getCurPeriod();
            var config_desc = config.action_rule;
            if(period == 2){
                config_desc = config.action_rule1;
            }else if(period == 3){
                config_desc = config.action_rule2;
            }else if(period == 4){
                config_desc = config.action_rule3;
            }
            var pos = event.touch.getLocation();
            require("tips_controller").getInstance().showCommonTips(config_desc.desc, pos);
        }.bind(this));

        Utils.onTouchEnd(this.all_get, function () {
            this.ctrl.send25304(0)
        }.bind(this), 1);

        Utils.onTouchEnd(this.advance_card_buy, function () {
            this.changeWarn();
        }.bind(this), 1);
    },

    setAmendBuyPrice:function(period){
        var charge_list = Config.charge_data.data_charge_data;
        var card_list = Config.holiday_war_order_data.data_advance_card_list;
        if(card_list && card_list[period] && card_list[period][1]){
            var charge_id = card_list[period][1].charge_id || null;
            if(charge_id){
                var str = cc.js.formatStr(Utils.TI18N("￥%d购买"),charge_list[charge_id].val);
                this.advance_card_buy_label.string = str;
            }
        }
    },

    loadTitleBarner:function(period){
        period = period || 1;
        var color_bar_outline = OrderactionConst.ColorConst[3];
        var per_str = "txt_cn_orderaction_title";
        var banner_str;
        var visible = false;
        var pos_y = 191;
    
        this.bar_num_line.color = this.color_bar_outline;
        this.time_text_bg.node.y = pos_y;
        this.time_text.node.y = pos_y;

        var title_barner = this.main_container.getChildByName("title_barner").getComponent(cc.Sprite);
        var res = PathTool.getBigBg(per_str, null,"orderaction");
        this.banner_botton.node.active = visible;

        this.loadRes(res, function (res) {
            title_barner.spriteFrame = res;
        }.bind(this));

        if(banner_str){
            var banner_res = PathTool.getBigBg(banner_str, null,"orderaction");
            this.loadRes(banner_res, function (res) {
                this.banner_botton.spriteFrame = res;
            }.bind(this));
        }

    },

    tabChargeView:function(index,period){
        index = index || 1;
        if(this.cur_index == index)return;
        this.cur_index = index;
        this.setButtonShowORHide(index);
        if(index != 3){
            this.tabHeadTitle(index);
        }
        if(this.cur_panel != null){
            if(this.cur_panel.setVisibleStatus){
                this.cur_panel.setVisibleStatus(false);
            }
        }
        this.cur_panel = this.createTabViewPanel(this.cur_index,period);
        if(this.cur_panel != null){
            if(this.cur_panel.setVisibleStatus){
                this.cur_panel.setVisibleStatus(true);
            }
        }
    },

    tabHeadTitle:function(index){
        if(this.cur_herd_title!=null){
            this.cur_herd_title.select.active = false;
            this.cur_herd_title.icon.opacity = 178;
            this.cur_herd_title.name.node.color = OrderactionConst.ColorConst[7];
        }
        this.cur_herd_title = this.tab_view[index];
        if(this.cur_herd_title!=null){
            this.cur_herd_title.select.active = true;
            this.cur_herd_title.icon.opacity = 255;
            this.cur_herd_title.name.node.color = OrderactionConst.ColorConst[8];
        }
    },

    createTabViewPanel:function(index,period){
        var panel = this.tab_panel_list[index];
        if(panel == null){
            if(index == OrderactionConst.OrderActionView.reward_panel){
                var OrderActionRewardPanel = require("orderaction_reward_panel");
                panel = new OrderActionRewardPanel(period);
            }else if(index == OrderactionConst.OrderActionView.tesk_panel){
                var OrderActionTeskPanel = require("orderaction_tesk_panel");
                panel = new OrderActionTeskPanel(period);
            }else if(index == OrderactionConst.OrderActionView.advance_card){

            }
            var size = this.main_container.getContentSize();
            if(panel){
                var pos_y = -370;
                panel.setPosition(-326,pos_y);
                panel.setParent(this.main_container)
                panel.show();
            }
            this.tab_panel_list[index] = panel;
            if(this.all_get){
                this.all_get.zIndex = 30;
            }
            if(this.btn_buy_lev){
                this.btn_buy_lev.zIndex = 31;
            }
            if(this.btn_open_lock){
                this.btn_open_lock.zIndex = 32;
            }
        }
        return panel;
    },

    // 额外经验包宝箱
    updateBoxStatus:function(){
        var status = 0;
        var rmb_status = this.model.getRMBStatus();
        var extra_status = this.model.getExtraStatus();
        if(rmb_status == 0){
            status = 0;
        }else if(rmb_status == 1){
            if(extra_status == 0){
                status = 1;
            }else if(extra_status == 1){
                status = 2;
            }
        }
        if(this.cur_box_status == status)return;
        this.cur_box_status = status;

        var action = PlayerAction.action_1;
        if(status == 0){
            action = PlayerAction.action_1;
        }else if(status == 1){
            action = PlayerAction.action_2;
        }else if(status == 2){
            action = PlayerAction.action_3;
        }

        if(this.box_effect){
            this.box_effect.clearTracks();
            this.box_effect.node.removeFromParent();
            this.box_effect.node.destroy();
            this.box_effect = null;
        }
        if(this.btn_untie_reward && this.box_effect == null){
            this.box_effect = Utils.createEffectSpine(PathTool.getEffectRes(110), cc.v2(0, -18), cc.v2(0.5, 0.5), true, action);
            this.btn_untie_reward.addChild(this.box_effect.node);
        }
    },

    // 任务红点
    getTaskRedPoint:function(){
        var status = this.model.getTaskRedPoint();
        Utils.addRedPointToNodeByStatus(this.tab_view[2].btn_tab_view, status);
    },

    // 奖励红点
    statusTabRewardRedPoint:function(){
        var status = this.model.getRewardLevRedPoint();
        Utils.addRedPointToNodeByStatus(this.tab_view[1].btn_tab_view, status);
        Utils.addRedPointToNodeByStatus(this.all_get, status,9,6);
    },

    // 充值提醒
    changeWarn:function(){
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
                    str = cc.js.formatStr(Utils.TI18N("活动将在 %d 天后结束，是否确认充值"),30-day)
                }
            }
            if(str){
                CommonAlert.show(str,Utils.TI18N("确定"),function(){
                    var charge_id = card_list[period][1].charge_id || null;
                    if(charge_id && charge_list[charge_id]){
                        SDK.pay(charge_list[charge_id].val, 1, charge_list[charge_id].id, charge_list[charge_id].name,charge_list[charge_id].product_desc,null,null,charge_list[charge_id].pay_image);
                    }
                },Utils.TI18N("取消"));
            }else{
                var charge_id = card_list[period][1].charge_id || null;
                if(charge_id && charge_list[charge_id]){
                    SDK.pay(charge_list[charge_id].val, 1, charge_list[charge_id].id, charge_list[charge_id].name,charge_list[charge_id].product_desc,null,null,charge_list[charge_id].pay_image);
                }
            }
        }
    },

    // 设置数据
    setBasicInitData:function(data){
        if(!data)return;
        // 当前等级
        var lev_num = data.lev || 0;
        var cur_period = this.model.getCurPeriod();
        if(this.level_num){
            this.level_num.string = lev_num;
        }
        // 等级经验
        if(Config.holiday_war_order_data.data_lev_reward_list[cur_period]){
            var cur_len = lev_num + 1;
            if(cur_len >= Object.keys(Config.holiday_war_order_data.data_lev_reward_list[cur_period]).length){
                cur_len = Object.keys(Config.holiday_war_order_data.data_lev_reward_list[cur_period]).length;
            }
            if(Config.holiday_war_order_data.data_lev_reward_list[cur_period][cur_len]){
                // 下一个等级的经验值
                var cur_exp = Config.holiday_war_order_data.data_lev_reward_list[cur_period][cur_len].exp || 0;
                // 当前等级为0的时候
                if(data.lev == 0){
                    this.bar.progress = data.exp / cur_exp;
                    this.bar_num.string = data.exp+"/"+cur_exp;
                }else{
                    // 当前的
                    var exp = Config.holiday_war_order_data.data_lev_reward_list[cur_period][lev_num].exp || 0;
                    var diff_exp = cur_exp - exp;
                    // -- var percent_num = (data.exp - exp) /  (cur_exp - data.exp) * 100
                    var percent_num = (data.exp - exp) /  (cur_exp - exp);
                    this.bar.progress = percent_num;
                    this.bar_num.string = data.exp+"/"+cur_exp;
                }
            }
        }
    },

    // 倒计时和购买
    setButtonShowORHide:function(index){
        index = index || 1;
        this.time_text_bg.node.active = index == 1;
        this.time_text.node.active = index == 1;
        this.all_get.active = index == 1;
        this.advance_card_buy.active = index == 3;
    },


    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        this.ctrl.send25309();
        this.ctrl.send25300();
        this.ctrl.send25303();
        this.ctrl.send25306();
        this.model.initTaskData();
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.time_text){
            this.time_text.node.stopAllActions();
        }

        if(this.box_effect){
            this.box_effect.clearTracks();
            this.box_effect.node.removeFromParent();
            this.box_effect.node.destroy();
            this.box_effect = null;
        }
        
        if(this.tab_panel_list){
            for(var i in this.tab_panel_list){
                if(this.tab_panel_list[i] && this.tab_panel_list[i]["deleteMe"]){
                    this.tab_panel_list[i].deleteMe();
                }
            }
            this.tab_panel_list = null;
        }

        this.ctrl.openOrderActionMainView(false);
    },
})