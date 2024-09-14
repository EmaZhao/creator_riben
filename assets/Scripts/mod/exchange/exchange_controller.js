// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2018-12-25 16:37:10
// --------------------------------------------------------------------
var ExchangeEvent = require("exchange_event");

var ExchangeController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var ExchangeModel = require("exchange_model");

        this.model = new ExchangeModel();
        this.model.initConfig();
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {
        if(this.init_role_event == null){
            this.init_role_event = gcore.GlobalEvent.bind(EventId.EVT_ROLE_CREATE_SUCCESS, function(){
                gcore.GlobalEvent.unbind(this.init_role_event)
                this.init_role_event = null
                 //-- 上线时请求
                // this.send23606();
            }.bind(this));
        }
    },

    // 注册协议接受事件
    registerProtocals: function () {
        this.RegisterProtocal(23606, this.on23606);
        this.RegisterProtocal(23607, this.on23607);
    },

    send23606 : function(){
        this.SendProtocal(23606, {});
    },

    on23606 : function(data){
        this.model.setExchangeData(data)
        gcore.GlobalEvent.fire(ExchangeEvent.Extra_Reward, data);
    },

    send23607 : function(id){
        this.SendProtocal(23607, {id : id});
    },

    on23607 : function(data){
        message(data.msg);
    },

    openExchangeMainView : function(status){
        if(status){
            if(!this.exchange_win){
                var ExchangeWindow = require("exchange_window");
                this.exchange_win = new ExchangeWindow();
            }
            this.exchange_win.open()
        }else{
            if(this.exchange_win){
                this.exchange_win.close();
                this.exchange_win = null;
            }
        }
    }
});

module.exports = ExchangeController;
