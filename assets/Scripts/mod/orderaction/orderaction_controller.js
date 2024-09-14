// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      战令控制模块
// <br/>Create: 2019-08-10 16:19:12
// --------------------------------------------------------------------
var OrderActionEvent = require("orderaction_event");

var OrderactionController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var OrderactionModel = require("orderaction_model");

        this.model = new OrderactionModel();
        this.model.initConfig();
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {
    },

    // 注册协议接受事件
    registerProtocals: function () {
        this.RegisterProtocal(25300, this.handle25300);
        this.RegisterProtocal(25301, this.handle25301);
        this.RegisterProtocal(25303, this.handle25303);
        this.RegisterProtocal(25304, this.handle25304);
        this.RegisterProtocal(25305, this.handle25305);
        this.RegisterProtocal(25306, this.handle25306);
        this.RegisterProtocal(25307, this.handle25307);
        this.RegisterProtocal(25308, this.handle25308);
        this.RegisterProtocal(25309, this.handle25309);
    },

    // 任务信息
    send25300:function(){
        this.SendProtocal(25300, {});
    },

    // [[
    // 由于第三期的界面改动比较大，所以相对应的有些界面就特殊去处理
    // ]]
    handle25300:function(data){
        this.model.setCurPeriod(data.period)        //周期数
        this.model.setCurDay(data.cur_day)          //天数
        this.model.setRMBStatus(data.rmb_status)    //是否激活特权
        this.model.setExtraStatus(data.exp_status)  //是否领取额外礼包
        this.model.setCurLev(data.lev)              //当前等级
        this.model.setCurExp(data.exp)              //当前经验
        this.model.setInitTaskData(data.list)       //任务列表

        gcore.GlobalEvent.fire(OrderActionEvent.OrderAction_Init_Event,data);
    },

    // 任务更新
    handle25301:function(data){
        this.model.updataTeskData(data);
        gcore.GlobalEvent.fire(OrderActionEvent.OrderAction_TaskGet_Event);
    },

    // 提交任务
    send25302:function(id){
        var proto = {};
        proto.id = id;
        this.SendProtocal(25302, proto);
    },

    // 等级奖励
    send25303:function(){
        this.SendProtocal(25303, {});
    },

    handle25303:function(data){
        this.model.setLevShowData(data.reward_list);
        gcore.GlobalEvent.fire(OrderActionEvent.OrderAction_LevReward_Event,data.lev);
    },

    // 领取等级奖励
    send25304:function(id){
        var proto = {};
        proto.id = id;
        this.SendProtocal(25304, proto);
    },

    handle25304:function(data){
        message(data.msg)
    },

    //  等级变更（只会主动推）
    handle25305:function(data){
        this.model.setCurExp(data.exp);
        this.model.setCurLev(data.lev);
        gcore.GlobalEvent.fire(OrderActionEvent.OrderAction_Updata_LevExp_Event,data);
    },

    // 进阶卡情况
    send25306:function(){
        this.SendProtocal(25306, {});
    },

    handle25306:function(data){
        this.model.setRMBStatus(data.rmb_status);
        this.model.setExtraStatus(data.exp_status);
        this.model.setGiftStatus(data.list);
        gcore.GlobalEvent.fire(OrderActionEvent.OrderAction_BuyGiftCard_Event);
    },

    // 购买等级（成功推送25305）
    send25307:function(id){
        var proto = {};
        proto.id = id;
        this.SendProtocal(25307, proto);
    },

    handle25307:function(data){
        message(data.msg);
        if(data.flag == 1){
            this.openBuyLevView(false);
        }
    },

    // 领取额外奖励（成功推25306）
    send25308:function(){
        this.SendProtocal(25308, {});
    },

    handle25308:function(data){
        message(data.msg);
    },

    // 是否要弹窗
    send25309:function(){
        this.SendProtocal(25309, {});
    },

    handle25309:function(data){
        gcore.GlobalEvent.fire(OrderActionEvent.OrderAction_IsPopWarn_Event,data);
    },

    // 打开主界面
    openOrderActionMainView:function(status){
        if(status == true){
            if(!this.order_action_view){
                this.order_action_view = Utils.createClass("orderaction_main_window",this);
            }
            if(this.order_action_view && this.order_action_view.isOpen() == false){
                this.order_action_view.open();
            }
            
        }else{
            if(this.order_action_view)   {
                this.order_action_view.close();
                this.order_action_view = null;
            }
        }
    },

    getOrderActionMainRoot:function(){
        if(this.order_action_view){
            return this.order_action_view;
        }
        return null;
    },

    // 打开购买等级
    openBuyLevView:function(status){
        if(status == true){
            if(!this.buy_lev_view){
                this.buy_lev_view = Utils.createClass("buy_lev_window",this);
            }
            if(this.buy_lev_view && this.buy_lev_view.isOpen() == false){
                this.buy_lev_view.open();
            }
        }else{
            if(this.buy_lev_view){
                this.buy_lev_view.close();
                this.buy_lev_view = null;
            }
        }
    },

    // 奖励总览
    openUntieRewardView:function(status){
        if(status == true){
            if(!this.untie_reward_view){
                this.untie_reward_view = Utils.createClass("untie_reward_1_window",this);
            }
            if(this.untie_reward_view && this.untie_reward_view.isOpen() == false){
                this.untie_reward_view.open();
            }
        }else{
            if(this.untie_reward_view){
                this.untie_reward_view.close();
                this.untie_reward_view = null;
            }
        }
    },

    // 打开活动结束警告界面
    openEndWarnView:function(status,day){
        if(status == true){
            if(!this.end_warn_view){
                this.end_warn_view = Utils.createClass("orderaction_end_warn_window",this);
            }
            if(this.end_warn_view && this.end_warn_view.isOpen() == false){
                this.end_warn_view.open(day);
            }
        }else{
            if(this.end_warn_view){
                this.end_warn_view.close();
                this.end_warn_view = null;
            }
        }
    },

    // 购买进阶卡
    openBuyCardView:function(status){
        if(status == true){
            if(!this.buy_card_view){
                this.buy_card_view = Utils.createClass("untie_reward_window",this);
            }
            if(this.buy_card_view && this.buy_card_view.isOpen() == false){
                this.buy_card_view.open();
            }
        }else{
            if(this.buy_card_view){
                this.buy_card_view.close();
                this.buy_card_view = null;
            }
        }
    }

});

module.exports = OrderactionController;