// --------------------------------------------------------------------
// @author: whjing2012@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-01-05 10:37:58
// --------------------------------------------------------------------
var OnlineGiftEvent = require("onlinegift_event");
var OnlinegiftController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var OnlinegiftModel = require("onlinegift_model");

        this.model = new OnlinegiftModel();
        this.model.initConfig();
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {
        if(!this.init_role_event){
            this.init_role_event = gcore.GlobalEvent.bind(EventId.EVT_ROLE_CREATE_SUCCESS, (function(){
                gcore.GlobalEvent.unbind(this.init_role_event);
                this.init_role_event = null;
                // this.send10926();
            }).bind(this));
        }
    },

    // 注册协议接受事件
    registerProtocals: function () {
        this.RegisterProtocal(10926, this.on10926);  // 已领福利
        this.RegisterProtocal(10927, this.on10927);  // 领取福利
    },

    // 已领福利处理
    send10926:function(){
        this.SendProtocal(10926, {});
    },

    on10926 : function(data){
        this.model.updateData(data);
        gcore.GlobalEvent.fire(OnlineGiftEvent.Get_Data, data);
    },

    // 领取福利
    send10927 : function(time){
        this.SendProtocal(10927, {time:time});
    },

    on10927 : function(data){
        message(data.msg);
        if(data.code == 1){
            gcore.GlobalEvent.fire(OnlineGiftEvent.Update_Data, data.time);
        }
    },

    // 打开窗口
    openOnlineGiftView : function(bool){
        if(bool){
            if(!this.onlinegiftView){
                var OnlineGiftWindow = require("onlinegift_window");
                this.onlinegiftView = new OnlineGiftWindow();
            }
            this.onlinegiftView.open();
        }else{
            if(this.onlinegiftView){
                this.onlinegiftView.close();
                this.onlinegiftView = null;
            }
        }
    }
});

module.exports = OnlinegiftController;
