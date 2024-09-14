// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-09-16 19:26:31
// --------------------------------------------------------------------
var ElementController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var ElementModel = require("element_model");

        this.model = new ElementModel();
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
        // this.RegisterProtocal(1110, this.on1110);
        this.RegisterProtocal(25000, this.handle25000) // 元素神殿基础数据
        this.RegisterProtocal(25001, this.handle25001) // 元素神殿挑战
        this.RegisterProtocal(25002, this.handle25002) // 元素神殿扫荡
        this.RegisterProtocal(25003, this.handle25003) // 购买挑战次数
        this.RegisterProtocal(25004, this.handle25004) // 挑战次数刷新
        this.RegisterProtocal(25005, this.handle25005) // 最大关卡数更新
    },
    handle25000(){
        
    },
    handle25001(){
        
    },
    handle25002(){
        
    },
    handle25003(){
        
    },
    handle25004(){
        
    },
    handle25005(){
        
    },
    //打开元素神殿主界面
    openElementMainWindow( status ){
        if(status == true){
            let is_open = this.model.checkElementIsOpen()
            if(!is_open){
                return
            }

            if(this.element_main_wnd == null){
                this.element_main_wnd = ElementMainWindow.New()
            }
            if(this.element_main_wnd.isOpen() == false){
                this.element_main_wnd.open()
            }
        }else{
            if(this.element_main_wnd){
                this.element_main_wnd.close()
                this.element_main_wnd = null
            }
        }
    },
});

module.exports = ElementController;