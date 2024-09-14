// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     跨服时空，zys
// <br/>Create: 2019-07-29 10:38:42
// --------------------------------------------------------------------
var CrossshowEvent = require("crossshow_event");

var CrossshowController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var CrossshowModel = require("crossshow_model");

        this.model = new CrossshowModel();
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
        this.RegisterProtocal(22150, this.handle22150);     //跨服时空当前信息
    },

    //跨服时空当前信息\
    sender22150:function(){
        this.SendProtocal(22150,{});
    },

    handle22150:function(data){
        gcore.GlobalEvent.fire(CrossshowEvent.Get_Cross_Show_Info_Event, data)
    },

    //打开跨服战场主界面
    openCrossshowMainWindow:function(status){
        if(status == true){
            if(this.cross_show_main_window == null){
                this.cross_show_main_window = Utils.createClass("crossshow_main_window");
            }
            if(this.cross_show_main_window.isOpen() == false){
                this.cross_show_main_window.open();
            }
        }else{
            if(this.cross_show_main_window){
                this.cross_show_main_window.close();
                this.cross_show_main_window = null;
            }
        }
    }
});

module.exports = CrossshowController;