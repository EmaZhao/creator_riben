// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-04-28 11:02:17
// --------------------------------------------------------------------
var DaychargeController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var DaychargeModel = require("daycharge_model");

        this.model = new DaychargeModel();
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
        this.RegisterProtocal(21010, this.handle21010);
        this.RegisterProtocal(21011, this.handle21011);
    },

    // 每日首充
    sender21010:function(){
        this.SendProtocal(21010, {});
    },

    handle21010:function(data){
        var status = false;
        if(data.status == 1){
            status = true;
        }
        var MainuiController = require("mainui_controller");
        var MainUiConst = require("mainui_const");
        var DayChargetEvent = require("daycharge_event");
        MainuiController.getInstance().setFunctionTipsStatus(MainUiConst.icon.day_first_charge, status);
        gcore.GlobalEvent.fire(DayChargetEvent.DAY_FIRST_CHARGE_EVENT, data);
    },
    
    sender21011:function(){
        this.SendProtocal(21011, {});
    },

    handle21011:function(data){
        message(data.msg);
        if(data.code == 1){
            gcore.Timer.set((function () {
                this.openDayFirstChargeView(false);    
            }).bind(this), 500, 1);
        }
    },

    // -------打开界面
    openDayFirstChargeView:function(status){
        if(status){
            if(!this.daycharge_window){
                this.daycharge_window = Utils.createClass("daycharge_window",this);
            }
            if(this.daycharge_window && this.daycharge_window.isOpen() == false){
                this.daycharge_window.open();
            }
        }else{
            if(this.daycharge_window){
                this.daycharge_window.close();
                this.daycharge_window = null;
            }
        }
    },
});

module.exports = DaychargeController;